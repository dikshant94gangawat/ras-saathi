"use client";

import { useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, ChevronDown, Search } from "lucide-react";
import { PYQS, PYQ_TAGS, PYQ_YEARS } from "@/data/pyq";
import { topicTitle } from "@/data/syllabus";
import { useApp } from "@/lib/store";
import { Empty, PageHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

function Select<T extends string | number>({ value, onChange, options, label }: {
  value: T | ""; onChange: (v: T | "") => void; options: T[]; label: string;
}) {
  return (
    <select className="input !w-auto" value={value} aria-label={label}
      onChange={(e) => onChange((typeof options[0] === "number" ? Number(e.target.value) : e.target.value) as T | "")}>
      <option value="">{label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default function PyqPage() {
  const { lang, bookmarks, toggleBookmark } = useApp();
  const [q, setQ] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [phase, setPhase] = useState<"pre" | "mains" | "">("");
  const [marks, setMarks] = useState<number | "">("");
  const [tag, setTag] = useState<string | "">("");
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return PYQS.filter((p) =>
      (!year || p.examYear === year) && (!phase || p.examPhase === phase) && (!marks || p.marks === marks) &&
      (!tag || p.subjectTag === tag) && (!saved || bookmarks.includes(p._id)) &&
      (!s || `${p.question.en} ${p.question.hi}`.toLowerCase().includes(s))
    ).sort((a, b) => b.examYear - a.examYear);
  }, [q, year, phase, marks, tag, saved, bookmarks]);

  return (
    <>
      <PageHeader title="PYQ Bank" subtitle="Sample questions shown here. Replace with verified papers using the seed script." />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search questions" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select label="Year" value={year} onChange={setYear} options={PYQ_YEARS} />
        <Select label="Phase" value={phase} onChange={setPhase} options={["pre", "mains"] as ("pre" | "mains")[]} />
        <Select label="Marks" value={marks} onChange={setMarks} options={[2, 5, 10]} />
        <Select label="Subject" value={tag} onChange={setTag} options={PYQ_TAGS} />
        <button className={cn("chip !px-4", saved && "chip-active")} onClick={() => setSaved((v) => !v)}>Saved only</button>
      </div>

      <p className="mb-3 text-sm text-slate-500">{list.length} question{list.length !== 1 && "s"}</p>

      {list.length === 0 ? <Empty title="No questions found" hint="Try clearing some filters." /> : (
        <div className="space-y-3">
          {list.map((p) => {
            const isOpen = open === p._id;
            const bm = bookmarks.includes(p._id);
            return (
              <article key={p._id} className="card p-5 animate-fade-up">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="chip">{p.examYear}</span>
                  <span className="chip uppercase">{p.examPhase}</span>
                  <span className="chip">{p.paperName}</span>
                  <span className="chip">{p.marks} marks</span>
                  <span className="chip">{p.subjectTag}</span>
                  <button className="ml-auto text-slate-500 hover:text-brand-600" onClick={() => toggleBookmark(p._id)}
                    aria-label={bm ? "Remove bookmark" : "Bookmark"}>
                    {bm ? <BookmarkCheck size={18} className="text-brand-600" /> : <Bookmark size={18} />}
                  </button>
                </div>
                <p className="font-medium leading-relaxed">{p.question[lang]}</p>
                {p.topicIds.map((id) => topicTitle(id) && (
                  <span key={id} className="mt-2 mr-2 inline-block text-xs text-brand-700 dark:text-brand-300">#{topicTitle(id)![lang]}</span>
                ))}
                <button className="mt-3 flex items-center gap-1 text-sm font-semibold text-brand-600" onClick={() => setOpen(isOpen ? null : p._id)}>
                  Model answer <ChevronDown size={16} className={cn("transition", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed dark:bg-ink-900">{p.modelAnswer[lang]}</div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
