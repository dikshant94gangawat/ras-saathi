"use client";

import { useEffect, useState } from "react";
import { Pause, Play, Plus, Square } from "lucide-react";
import { useApp, streakOf } from "@/lib/store";
import { Bar, PageHeader, Stat } from "@/components/ui";
import { cn, dateKey, fmtDuration, fmtMinutes, lastNDays } from "@/lib/utils";

function Stopwatch({ onSave }: { onSave: (min: number) => void }) {
  const [sec, setSec] = useState(0);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [run]);
  return (
    <div className="card p-5 text-center">
      <h2 className="mb-2 font-semibold">Study timer</h2>
      <div className="font-mono text-4xl font-bold tabular-nums">{fmtDuration(sec)}</div>
      <div className="mt-4 flex justify-center gap-2">
        <button className="btn-primary" onClick={() => setRun((r) => !r)}>{run ? <><Pause size={14} /> Pause</> : <><Play size={14} /> {sec ? "Resume" : "Start"}</>}</button>
        <button className="btn-ghost" disabled={sec < 60}
          onClick={() => { onSave(Math.floor(sec / 60)); setSec(0); setRun(false); }}>
          <Square size={14} /> Save
        </button>
      </div>
      {sec > 0 && sec < 60 && <p className="mt-2 text-xs text-slate-500">Sessions under a minute can't be saved.</p>}
    </div>
  );
}

export default function TrackerPage() {
  const { logs, addStudy, dailyTargetMinutes, setProfile } = useApp();
  const [mins, setMins] = useState(30);
  const today = logs[dateKey()]?.minutes ?? 0;
  const days = lastNDays(35);
  const weekTotal = lastNDays(7).reduce((s, d) => s + (logs[d]?.minutes ?? 0), 0);
  const hit = days.filter((d) => logs[d]?.targetAchieved).length;

  return (
    <>
      <PageHeader title="Study Tracker" subtitle="Log study time, hit your daily target, keep the streak." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Today" value={fmtMinutes(today)} hint={`${Math.min(100, Math.round((today / dailyTargetMinutes) * 100))}% of target`} />
        <Stat label="This week" value={fmtMinutes(weekTotal)} />
        <Stat label="Streak" value={`${streakOf(logs)} days`} hint={`${hit} target days in last 35`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Log time</h2>
          <Bar value={(today / dailyTargetMinutes) * 100} className="mb-4" />
          <div className="mb-3 flex flex-wrap gap-2">
            {[15, 30, 60, 90, 120].map((m) => (
              <button key={m} className={cn("chip", mins === m && "chip-active")} onClick={() => setMins(m)}>{m}m</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="number" min={1} max={600} className="input" value={mins}
              onChange={(e) => setMins(Math.max(1, Math.min(600, Number(e.target.value) || 1)))} aria-label="Minutes" />
            <button className="btn-primary shrink-0" onClick={() => addStudy(mins)}><Plus size={14} /> Add</button>
          </div>
          <label className="mt-5 block text-sm font-medium">Daily target (minutes)</label>
          <input type="number" min={30} max={1200} step={15} className="input mt-1" value={dailyTargetMinutes}
            onChange={(e) => setProfile({ dailyTargetMinutes: Math.max(30, Math.min(1200, Number(e.target.value) || 30)) })} />
        </section>

        <Stopwatch onSave={(m) => addStudy(m)} />
      </div>

      <section className="card mt-4 p-5">
        <h2 className="mb-3 font-semibold">Last 5 weeks</h2>
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto">
          {days.map((d) => {
            const m = logs[d]?.minutes ?? 0;
            const lvl = m === 0 ? 0 : m < dailyTargetMinutes / 2 ? 1 : m < dailyTargetMinutes ? 2 : 3;
            return (
              <div key={d} title={`${d}: ${fmtMinutes(m)}`}
                className={cn("h-6 min-w-6 rounded-md",
                  ["bg-slate-100 dark:bg-white/5", "bg-brand-200", "bg-brand-400", "bg-brand-600"][lvl])} />
            );
          })}
        </div>
      </section>
    </>
  );
}
