"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, CircleDot, RotateCcw, Search } from "lucide-react";
import Link from "next/link";
import { SYLLABUS } from "@/data/syllabus";
import { useApp } from "@/lib/store";
import type { ExamPhase, ProgressStatus } from "@/lib/types";
import { Bar, PageHeader } from "@/components/ui";
import { SyllabusTabs } from "@/components/SyllabusTabs";
import { cn } from "@/lib/utils";

const STATUSES: { v: ProgressStatus; label: string; cls: string }[] = [
  { v: "not_started", label: "Not started", cls: "" },
  { v: "in_progress", label: "In progress", cls: "bg-amber-500 text-white border-amber-500" },
  { v: "completed", label: "Completed", cls: "bg-emerald-600 text-white border-emerald-600" },
];

const PHASES: { v: ExamPhase; label: string }[] = [
  { v: "pre", label: "Prelims" },
  { v: "mains", label: "Mains" },
];

export default function MicroTrackerPage() {
  const { progress, setStatus, markRevised, lang, microSyllabus } = useApp();
  const [phase, setPhase] = useState<ExamPhase>("pre");
  const [paperId, setPaperId] = useState<string>();
  const [q, setQ] = useState("");
  const generated = !!microSyllabus[phase];
  const papers = useMemo(() => microSyllabus[phase] ?? (phase === "mains" ? SYLLABUS : []), [microSyllabus, phase]);
  const paper = papers.find((p) => p._id === paperId) ?? papers[0];
  const query = q.trim().toLowerCase();

  const ts = useMemo(() => paper?.units.flatMap((u) => u.subjects.flatMap((s) => s.topics)) ?? [], [paper]);
  const done = ts.filter((t) => progress[t.topicId]?.status === "completed").length;

  const units = useMemo(
    () => (paper?.units ?? []).map((u) => ({
      ...u,
      subjects: u.subjects.map((s) => ({
        ...s,
        topics: s.topics.filter((t) => !query || `${t.title.en} ${t.title.hi}`.toLowerCase().includes(query)),
      })).filter((s) => s.topics.length),
    })).filter((u) => u.subjects.length),
    [paper, query]
  );

  return (
    <>
      <PageHeader title="Micro Syllabus Tracker" subtitle="Topic-by-topic status. Progress saves instantly." />
      <SyllabusTabs />

      <div className="mb-4 flex gap-2">
        {PHASES.map((ph) => (
          <button key={ph.v} onClick={() => { setPhase(ph.v); setPaperId(undefined); }} className={cn("chip shrink-0 !px-4 !py-2 !text-sm", phase === ph.v && "chip-active")}>
            {ph.label}
          </button>
        ))}
      </div>

      {paper && (
        <>
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {papers.map((p) => (
              <button key={p._id} onClick={() => setPaperId(p._id)} className={cn("chip shrink-0 !px-4 !py-2 !text-sm", paper._id === p._id && "chip-active")}>
                {p.paper}
              </button>
            ))}
          </div>

          <div className="card mb-4 p-5">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-semibold">{paper.title[lang]}</span>
              <span className="text-slate-500">{done}/{ts.length} completed</span>
            </div>
            <Bar value={ts.length ? (done / ts.length) * 100 : 0} />
          </div>
          {generated && <p className="-mt-2 mb-4 text-xs text-slate-500">Generated from your uploaded syllabus PDF.</p>}
        </>
      )}

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="input pl-9" placeholder="Search topics in English or Hindi" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="space-y-3">
        {!paper && (
          <div className="card p-8 text-center text-sm text-slate-500">
            No {phase === "pre" ? "Prelims" : "Mains"} micro topics yet.{" "}
            <Link className="font-medium text-brand-700 underline dark:text-brand-300" href="/syllabus">Upload the syllabus</Link> to generate them.
          </div>
        )}
        {paper && units.length === 0 && <div className="card p-8 text-center text-sm text-slate-500">No topics match your search.</div>}
        {units.map((u) => (
          <details key={u.unitId} open className="card group overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-semibold">
              {u.title[lang]}
              <ChevronDown size={18} className="transition group-open:rotate-180" />
            </summary>
            <div className="space-y-4 border-t border-slate-100 p-4 dark:border-white/5">
              {u.subjects.map((s) => (
                <div key={s.subjectId}>
                  <h3 className="mb-2 text-sm font-semibold text-brand-700 dark:text-brand-300">{s.title[lang]}</h3>
                  <ul className="divide-y divide-slate-100 dark:divide-white/5">
                    {s.topics.map((t) => {
                      const p = progress[t.topicId];
                      const status = p?.status ?? "not_started";
                      return (
                        <li key={t.topicId} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 text-sm">
                              {status === "completed" ? <Check size={16} className="text-emerald-600" />
                                : status === "in_progress" ? <CircleDot size={16} className="text-amber-500" />
                                  : <span className="h-4 w-4 rounded-full border border-slate-300 dark:border-white/20" />}
                              <span className={cn(status === "completed" && "text-slate-400 line-through")}>{t.title[lang]}</span>
                            </div>
                            {!!p?.revisionCount && (
                              <div className="ml-6 text-[11px] text-slate-500">
                                Revised {p.revisionCount}x{p.lastRevisedAt && `, last ${new Date(p.lastRevisedAt).toLocaleDateString()}`}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {STATUSES.map((st) => (
                              <button key={st.v} onClick={() => setStatus(t.topicId, st.v)}
                                aria-pressed={status === st.v}
                                className={cn("chip", status === st.v && (st.cls || "chip-active"))}>
                                {st.label}
                              </button>
                            ))}
                            <button className="chip" title="Log a revision" aria-label="Log a revision" onClick={() => markRevised(t.topicId)}>
                              <RotateCcw size={12} />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
