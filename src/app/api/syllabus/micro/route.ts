import { NextResponse } from "next/server";
import { z } from "zod";
import { extractText, getDocumentProxy } from "unpdf";
import type { Bi, ExamPhase, Paper } from "@/lib/types";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const GENERAL: Bi = { en: "General", hi: "General" };

const PROMPT = `You extract the syllabus structure from an Indian civil services (RAS) syllabus.
Return only a JSON object of this shape:
{"papers":[{"name":"Paper I","title":{"en":"","hi":""},"units":[{"title":{"en":"","hi":""},"subjects":[{"title":{"en":"","hi":""},"topics":[{"en":"","hi":""}]}]}]}]}
- The input is text extracted from a PDF, so headings and body text may be mixed together. Tell them apart from context.
- A topic is one specific syllabus item, usually a short phrase. Use the document's wording, shortened only if it is a long sentence.
- Skip page numbers, headers, footers, exam instructions, marking schemes, and dates.
- Keep the document's order. Do not invent items that are not in the text.
- Give an English and a Hindi version of every title and topic. If the text is already Hindi, copy it into both fields.
- "name" is the paper label such as "Paper I". Use "Prelims" or "Mains" if the text has no paper labels.
- If a paper has no units, put its subjects under one unit titled "General". If a unit has no subject headings, put its topics under one subject titled "General".`;

const biZ = z.object({ en: z.string(), hi: z.string().optional() });
const extractedZ = z.object({
  papers: z.array(z.object({
    name: z.string(),
    title: biZ,
    units: z.array(z.object({
      title: biZ,
      subjects: z.array(z.object({ title: biZ, topics: z.array(biZ) })),
    })),
  })),
});
type Extracted = z.infer<typeof extractedZ>;

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

const clip = (s: string) => s.replace(/\s+/g, " ").trim().slice(0, 200);
const norm = (b: { en: string; hi?: string }): Bi | null => {
  const en = clip(b.en);
  return en ? { en, hi: clip(b.hi ?? "") || en } : null;
};
function keep<T>(x: T | null): x is T {
  return x !== null;
}

function toPapers(phase: ExamPhase, input: Extracted): Paper[] {
  const papers: Paper[] = [];
  for (const p of input.papers) {
    const pid = `${phase}-P${papers.length + 1}`;
    const units: Paper["units"] = [];
    for (const u of p.units) {
      const uid = `${pid}-U${units.length + 1}`;
      const subjects: Paper["units"][number]["subjects"] = [];
      for (const s of u.subjects) {
        const topics = s.topics.map(norm).filter(keep);
        if (!topics.length) continue;
        const sid = `${uid}-S${subjects.length + 1}`;
        subjects.push({
          subjectId: sid,
          title: norm(s.title) ?? GENERAL,
          topics: topics.map((t, ti) => ({ topicId: `${sid}-T${ti + 1}`, title: t })),
        });
      }
      if (!subjects.length) continue;
      units.push({ unitId: uid, title: norm(u.title) ?? GENERAL, subjects });
    }
    if (!units.length) continue;
    papers.push({
      _id: pid,
      paper: clip(p.name) || `Paper ${papers.length + 1}`,
      title: norm(p.title) ?? GENERAL,
      units,
    });
  }
  return papers;
}

async function callGroq(key: string, payload: string): Promise<Response> {
  let res: Response | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: payload,
    });
    if (res.ok || (res.status !== 429 && res.status !== 503)) break;
    await new Promise((r) => setTimeout(r, 1500 * attempt));
  }
  return res!;
}

async function extract(key: string, phase: ExamPhase, pdf: ArrayBuffer): Promise<Extracted> {
  const doc = await getDocumentProxy(new Uint8Array(pdf));
  const { text: pages } = await extractText(doc, { mergePages: true });
  const source = String(pages).trim();
  if (!source) throw new ApiError(422, "No text found in this PDF. Scanned PDFs are not supported.");

  const payload = JSON.stringify({
    model: MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: PROMPT },
      { role: "user", content: `Phase: ${phase === "pre" ? "Prelims" : "Mains"}.\n\nSyllabus text:\n${source}` },
    ],
  });
  const res = await callGroq(key, payload);
  if (!res.ok) {
    console.error("groq request failed", MODEL, res.status, await res.text());
    if (res.status === 429) {
      throw new ApiError(429, `The AI rate limit was reached for model ${MODEL}. Wait a minute and try again, or check your Groq usage limits.`);
    }
    if (res.status === 403) {
      throw new ApiError(502, "The AI request was blocked (HTTP 403). Check that the network or proxy allows api.groq.com and that GROQ_API_KEY is valid.");
    }
    throw new ApiError(502, `The AI service failed (HTTP ${res.status}, model ${MODEL}). Try again later or set GROQ_MODEL.`);
  }

  const body = await res.json();
  const text: string = body?.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) throw new ApiError(502, "The AI returned no topics. Try again.");

  let json: unknown;
  try {
    json = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, ""));
  } catch {
    throw new ApiError(502, "The AI returned unreadable data. Try again.");
  }
  const parsed = extractedZ.safeParse(json);
  if (!parsed.success) throw new ApiError(502, "The AI returned unexpected data. Try again.");
  return parsed.data;
}

export async function POST(req: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return fail(503, "AI key not configured. Add GROQ_API_KEY to .env.local and restart the dev server.");

  try {
    const form = await req.formData();
    const phase = form.get("phase");
    const file = form.get("file");
    if ((phase !== "pre" && phase !== "mains") || !(file instanceof File)) return fail(400, "Invalid input.");
    if (file.type !== "application/pdf") return fail(400, "Only PDF files are allowed.");
    if (file.size > MAX_BYTES) return fail(400, "File must be 10 MB or smaller.");

    const papers = toPapers(phase, await extract(key, phase, await file.arrayBuffer()));
    if (!papers.length) return fail(422, "No topics found in this PDF.");
    return NextResponse.json({ papers });
  } catch (e) {
    if (e instanceof ApiError) return fail(e.status, e.message);
    console.error("syllabus generation failed", e);
    return fail(500, "Server error.");
  }
}
