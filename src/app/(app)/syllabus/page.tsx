"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CloudUpload, Download, FileText, RefreshCw, Trash2 } from "lucide-react";
import { SYLLABUS } from "@/data/syllabus";
import { useApp } from "@/lib/store";
import type { ExamPhase } from "@/lib/types";
import { deleteSyllabusFile, getSyllabusFile, saveSyllabusFile } from "@/lib/syllabusFiles";
import { countTopics, generateMicroSyllabus } from "@/lib/microSyllabus";
import { Bar, PageHeader } from "@/components/ui";
import { SyllabusTabs } from "@/components/SyllabusTabs";
import { cn } from "@/lib/utils";

const MAX = 10 * 1024 * 1024;

function SyllabusUploadCard({ phase, title }: { phase: ExamPhase; title: string }) {
  const { syllabusDocs, setSyllabusDoc, microSyllabus, setMicroSyllabus } = useApp();
  const doc = syllabusDocs[phase];
  const micro = microSyllabus[phase];
  const uploadedAt = doc?.uploadedAt;
  const [url, setUrl] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let objectUrl: string | undefined;
    let alive = true;
    if (uploadedAt) {
      getSyllabusFile(phase)
        .then((blob) => {
          if (blob && alive) {
            objectUrl = URL.createObjectURL(blob);
            setUrl(objectUrl);
          }
        })
        .catch(() => {});
    }
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setUrl(undefined);
    };
  }, [phase, uploadedAt]);

  const buildTopics = async (file: Blob, prefix: string) => {
    try {
      const papers = await generateMicroSyllabus(phase, file);
      setMicroSyllabus(phase, papers);
      return { ok: true, text: [prefix, `Generated ${countTopics(papers)} micro topics.`].filter(Boolean).join(" ") };
    } catch (e) {
      setMicroSyllabus(phase, null);
      const reason = e instanceof Error ? e.message : "Unknown error.";
      return { ok: false, text: [prefix, `Could not generate micro topics. ${reason}`].filter(Boolean).join(" ") };
    }
  };

  const regenerate = async () => {
    setMsg(null);
    setBusy(true);
    try {
      const blob = await getSyllabusFile(phase);
      setMsg(blob ? await buildTopics(blob, "") : { ok: false, text: "File missing. Upload it again." });
    } catch {
      setMsg({ ok: false, text: "Could not read the saved file." });
    } finally {
      setBusy(false);
    }
  };

  const save = async (f: File | undefined) => {
    if (!f) return;
    setMsg(null);
    if (f.type !== "application/pdf") return setMsg({ ok: false, text: "Only PDF files are allowed." });
    if (f.size > MAX) return setMsg({ ok: false, text: "File must be 10 MB or smaller." });
    setBusy(true);
    try {
      await saveSyllabusFile(phase, f);
      setSyllabusDoc(phase, { fileName: f.name, size: f.size, uploadedAt: new Date().toISOString() });
      setMsg(await buildTopics(f, "Saved on this device."));
    } catch {
      setMsg({ ok: false, text: "Could not save the file in this browser." });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const remove = async () => {
    await deleteSyllabusFile(phase).catch(() => {});
    setSyllabusDoc(phase, null);
    setMicroSyllabus(phase, null);
    setMsg(null);
  };

  return (
    <section className="card space-y-4 p-5">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-xs text-slate-500">PDF, 10 MB max. Stored in this browser. Topics are extracted with Groq AI.</p>
      </div>

      {doc && (
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/5">
          <FileText className="shrink-0 text-brand-500" size={18} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{doc.fileName}</div>
            <div className="text-xs text-slate-500">
              {(doc.size / 1024 / 1024).toFixed(2)} MB · uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
            </div>
          </div>
          {url ? (
            <a className="chip" href={url} target="_blank" rel="noopener noreferrer"><Download size={12} /> Open</a>
          ) : (
            <span className="text-xs text-slate-400">File missing</span>
          )}
          <button className="chip" aria-label="Remove file" onClick={remove}><Trash2 size={12} /></button>
        </div>
      )}

      {doc && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className={micro ? "text-slate-600 dark:text-slate-300" : "text-slate-500"}>
            {micro ? `${countTopics(micro)} micro topics · ${micro.map((p) => p.paper).join(", ")}` : "No micro topics yet."}
          </span>
          <div className="flex gap-2">
            <button className="chip" onClick={regenerate} disabled={busy}>
              <RefreshCw size={12} /> {micro ? "Regenerate topics" : "Generate topics"}
            </button>
            {micro && <Link className="chip" href="/syllabus/micro">View micro tracker</Link>}
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); save(e.dataTransfer.files[0]); }}
        onClick={() => input.current?.click()}
        className="grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center transition hover:border-brand-500 dark:border-white/15">
        <CloudUpload className="text-brand-500" />
        <p className="mt-2 text-sm font-medium">{busy ? "Saving..." : doc ? "Replace PDF" : "Drop a PDF here or click to choose"}</p>
        <input ref={input} type="file" accept="application/pdf" hidden onChange={(e) => save(e.target.files?.[0])} />
      </div>

      {msg && <p role="status" className={msg.ok ? "text-sm text-emerald-600" : "text-sm text-red-600"}>{msg.text}</p>}
    </section>
  );
}

const PHASE_LABEL: Record<ExamPhase, string> = { pre: "Prelims", mains: "Mains" };

export default function SyllabusPage() {
  const { progress, lang, microSyllabus } = useApp();
  const generated = (["pre", "mains"] as ExamPhase[]).flatMap((ph) =>
    (microSyllabus[ph] ?? []).map((p) => ({ key: `${ph}-${p._id}`, label: PHASE_LABEL[ph], paper: p }))
  );
  const sections = generated.length ? generated : SYLLABUS.map((p) => ({ key: p._id, label: "", paper: p }));

  return (
    <>
      <PageHeader title="Syllabus" subtitle="Upload your Prelims and Mains syllabus and track progress by paper." />
      <SyllabusTabs />

      <div className="grid gap-4 lg:grid-cols-2">
        <SyllabusUploadCard phase="pre" title="Prelims syllabus" />
        <SyllabusUploadCard phase="mains" title="Mains syllabus" />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Progress by paper</h2>
      <div className="space-y-3">
        {sections.map(({ key, label, paper: p }) => {
          const ts = p.units.flatMap((u) => u.subjects.flatMap((s) => s.topics));
          const done = ts.filter((t) => progress[t.topicId]?.status === "completed").length;
          return (
            <section key={key} className="card p-5">
              <div className="mb-2 flex justify-between gap-2 text-sm">
                <span className="font-semibold">{label && `${label} · `}{p.paper} · {p.title[lang]}</span>
                <span className="shrink-0 text-slate-500">{done}/{ts.length} topics</span>
              </div>
              <Bar value={ts.length ? (done / ts.length) * 100 : 0} className="mb-4" />
              <div className="space-y-2">
                {p.units.map((u) => {
                  const unitTopics = u.subjects.flatMap((s) => s.topics);
                  const unitDone = unitTopics.filter((t) => progress[t.topicId]?.status === "completed").length;
                  return (
                    <div key={u.unitId}>
                      <div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>{u.title[lang]}</span>
                        <span>{unitDone}/{unitTopics.length}</span>
                      </div>
                      <Bar value={unitTopics.length ? (unitDone / unitTopics.length) * 100 : 0} />
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
