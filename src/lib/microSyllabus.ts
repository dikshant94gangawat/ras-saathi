import type { ExamPhase, Paper } from "./types";

export const countTopics = (papers: Paper[]) =>
  papers.reduce((n, p) => n + p.units.reduce((m, u) => m + u.subjects.reduce((k, s) => k + s.topics.length, 0), 0), 0);

export async function generateMicroSyllabus(phase: ExamPhase, file: Blob): Promise<Paper[]> {
  const body = new FormData();
  body.append("phase", phase);
  body.append("file", file, "syllabus.pdf");

  const res = await fetch("/api/syllabus/micro", { method: "POST", body });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? "Could not generate topics.");
  return data.papers as Paper[];
}
