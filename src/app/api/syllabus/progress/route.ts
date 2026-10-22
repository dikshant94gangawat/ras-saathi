import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { TOPIC_ID_SET, TOTAL_TOPICS } from "@/data/syllabus";

const bodySchema = z.object({
  topicId: z.string().min(3).max(64),
  status: z.enum(["not_started", "in_progress", "completed"]),
  revised: z.boolean().optional(),
});

export async function POST(req: Request) {
  if (!supabaseConfigured()) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { topicId, status, revised } = parsed.data;
  if (!TOPIC_ID_SET.has(topicId)) return NextResponse.json({ error: "Unknown topic" }, { status: 404 });

  try {
    const { error } = await supabase.rpc("upsert_topic_progress", { p_topic_id: topicId, p_status: status, p_revised: revised ?? false });
    if (error) throw error;

    const { count, error: cErr } = await supabase
      .from("user_syllabus_progress")
      .select("topic_id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "completed");
    if (cErr) throw cErr;

    const completed = count ?? 0;
    return NextResponse.json({
      topicId, status, completed, total: TOTAL_TOPICS,
      completionPercent: Math.round((completed / TOTAL_TOPICS) * 1000) / 10,
    });
  } catch (e) {
    console.error("progress update failed", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
