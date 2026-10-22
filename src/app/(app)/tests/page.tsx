"use client";

import Link from "next/link";
import { Clock, HelpCircle, Play } from "lucide-react";
import { TESTS } from "@/data/tests";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/ui";
import { fmtDuration } from "@/lib/utils";

export default function TestsPage() {
  const attempts = useApp((s) => s.attempts);
  return (
    <>
      <PageHeader title="Mock Tests" subtitle="Timed practice with negative marking and detailed review." />
      <div className="grid gap-4 sm:grid-cols-2">
        {TESTS.map((t) => {
          const best = attempts.filter((a) => a.testId === t.id).reduce((m, a) => Math.max(m, a.marks), -Infinity);
          return (
            <div key={t.id} className="card p-5">
              <h3 className="font-semibold">{t.title}</h3>
              <div className="mt-2 flex gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1"><HelpCircle size={14} /> {t.questions.length} questions</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {t.durationMinutes} min</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">+{t.marksPerQuestion} per correct, -{(t.marksPerQuestion / 3).toFixed(2)} per wrong</p>
              {Number.isFinite(best) && <p className="mt-2 text-sm font-medium text-emerald-600">Best: {best.toFixed(2)}/{t.questions.length * t.marksPerQuestion}</p>}
              <Link href={`/tests/${t.id}`} className="btn-primary mt-4"><Play size={14} /> Start test</Link>
            </div>
          );
        })}
      </div>

      <h2 className="mb-3 mt-10 text-lg font-semibold">Attempt history</h2>
      {attempts.length === 0 ? <p className="text-sm text-slate-500">No attempts yet.</p> : (
        <div className="card divide-y divide-slate-100 dark:divide-white/5">
          {attempts.slice(0, 10).map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
              <div>
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-slate-500">{new Date(a.submittedAt).toLocaleString()} · {fmtDuration(a.seconds)}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{a.marks.toFixed(2)}/{a.total}</div>
                <div className="text-xs text-slate-500">{a.correct} correct · {a.wrong} wrong · {a.skipped} skipped</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
