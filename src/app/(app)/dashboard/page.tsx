"use client";

import Link from "next/link";
import { Flame, Target, Trophy, BookCheck } from "lucide-react";
import { useApp, completionStats, streakOf } from "@/lib/store";
import { SYLLABUS, topicsOfPaper } from "@/data/syllabus";
import { Bar, PageHeader, Ring, Stat } from "@/components/ui";
import { dateKey, fmtMinutes, lastNDays } from "@/lib/utils";

export default function Dashboard() {
  const { name, progress, logs, attempts, dailyTargetMinutes, lang } = useApp();
  const stats = completionStats(progress);
  const today = logs[dateKey()]?.minutes ?? 0;
  const week = lastNDays(7).map((d) => ({ d, m: logs[d]?.minutes ?? 0 }));
  const max = Math.max(60, dailyTargetMinutes, ...week.map((w) => w.m));
  const avg = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + (a.marks / a.total) * 100, 0) / attempts.length) : 0;

  return (
    <>
      <PageHeader title={`Welcome back, ${name}`} subtitle="Here is where your RAS preparation stands today." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Syllabus done" value={`${stats.percent}%`} hint={`${stats.completed}/${stats.total} topics`} icon={<BookCheck size={16} />} />
        <Stat label="Today" value={fmtMinutes(today)} hint={`Target ${fmtMinutes(dailyTargetMinutes)}`} icon={<Target size={16} />} />
        <Stat label="Streak" value={`${streakOf(logs)} days`} hint="Consecutive study days" icon={<Flame size={16} />} />
        <Stat label="Avg. test score" value={attempts.length ? `${avg}%` : "-"} hint={`${attempts.length} attempts`} icon={<Trophy size={16} />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-1">
          <h2 className="mb-4 font-semibold">Overall completion</h2>
          <div className="flex justify-center"><Ring value={stats.percent} size={160} label="complete" /></div>
          <p className="mt-4 text-center text-sm text-slate-500">{stats.inProgress} topics in progress</p>
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Paper-wise progress</h2>
          <div className="space-y-4">
            {SYLLABUS.map((p) => {
              const ts = topicsOfPaper(p._id);
              const done = ts.filter((t) => progress[t.topicId]?.status === "completed").length;
              const pct = ts.length ? (done / ts.length) * 100 : 0;
              return (
                <Link key={p._id} href="/syllabus" className="block">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{p.paper}: {p.title[lang]}</span>
                    <span className="text-slate-500">{done}/{ts.length}</span>
                  </div>
                  <Bar value={pct} />
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <section className="card mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Last 7 days</h2>
          <Link href="/tracker" className="text-sm font-medium text-brand-600">Log study time</Link>
        </div>
        <div className="flex h-40 items-end gap-3">
          {week.map(({ d, m }) => (
            <div key={d} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-full w-full items-end">
                <div className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
                  style={{ height: `${(m / max) * 100}%`, minHeight: m ? 4 : 2, opacity: m ? 1 : 0.2 }} title={fmtMinutes(m)} />
              </div>
              <span className="text-[11px] text-slate-500">{new Date(d + "T00:00").toLocaleDateString("en", { weekday: "short" })}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
