import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { createUploadUrl, verifyUpload, R2Error } from "@/lib/uploadToR2";

const signSchema = z.object({
  questionId: z.string().min(1).max(64),
  sizeBytes: z.number().int().positive(),
  contentType: z.literal("application/pdf"),
});
const confirmSchema = z.object({ questionId: z.string().min(1).max(64), key: z.string().min(1).max(256) });

const fail = (e: unknown) => {
  const s = e instanceof R2Error ? e.status : 500;
  return NextResponse.json({ error: s === 500 ? "Server error" : (e as Error).message }, { status: s });
};

async function authed() {
  if (!supabaseConfigured()) return null;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

export async function POST(req: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const a = await authed();
  if (!a) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const parsed = signSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    return NextResponse.json(await createUploadUrl({ userId: a.user.id, ...parsed.data }));
  } catch (e) { return fail(e); }
}

export async function PUT(req: Request) {
  const a = await authed();
  if (!a) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const parsed = confirmSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    await verifyUpload(parsed.data.key, a.user.id);
    const { error } = await a.supabase.from("mains_answer_uploads").insert({
      user_id: a.user.id, question_id: parsed.data.questionId, pdf_url_r2: parsed.data.key,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) { return fail(e); }
}
