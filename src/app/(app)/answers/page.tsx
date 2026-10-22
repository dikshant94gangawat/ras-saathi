"use client";

import { useRef, useState } from "react";
import { CloudUpload, FileText } from "lucide-react";
import { PYQS } from "@/data/pyq";
import { useApp } from "@/lib/store";
import { Empty, PageHeader } from "@/components/ui";

const MAX = 10 * 1024 * 1024;
const MAINS = PYQS.filter((p) => p.examPhase === "mains");

export default function AnswersPage() {
  const { lang, uploads, addUpload } = useApp();
  const [qid, setQid] = useState(MAINS[0]?._id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const pick = (f: File | null) => {
    setMsg(null);
    if (!f) return setFile(null);
    if (f.type !== "application/pdf") return setMsg({ ok: false, text: "Only PDF files are allowed." });
    if (f.size > MAX) return setMsg({ ok: false, text: "File must be 10 MB or smaller." });
    setFile(f);
  };

  const upload = async () => {
    if (!file || !qid) return;
    setBusy(true);
    setMsg(null);
    const base = { id: crypto.randomUUID(), questionId: qid, fileName: file.name, size: file.size, status: "pending" as const, createdAt: new Date().toISOString() };
    try {
      const sign = await fetch("/api/uploads/answer", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: qid, sizeBytes: file.size, contentType: "application/pdf" }),
      });
      if (sign.status === 401 || sign.status === 503) {
        addUpload({ ...base, stored: "local" });
        setMsg({ ok: true, text: "Cloud storage is not configured, so only the record was saved on this device." });
      } else if (!sign.ok) {
        throw new Error((await sign.json().catch(() => ({}))).error ?? "Could not start upload");
      } else {
        const { url, key } = await sign.json();
        const put = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/pdf" }, body: file });
        if (!put.ok) throw new Error("Upload to storage failed");
        const done = await fetch("/api/uploads/answer", {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: qid, key }),
        });
        if (!done.ok) throw new Error("Could not confirm upload");
        addUpload({ ...base, key, stored: "r2" });
        setMsg({ ok: true, text: "Uploaded. Awaiting review." });
      }
      setFile(null);
      if (input.current) input.current.value = "";
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Mains Answer Practice" subtitle="Write on paper, scan to PDF (max 10 MB), upload for review." />

      <section className="card space-y-4 p-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Question</label>
          <select className="input" value={qid} onChange={(e) => setQid(e.target.value)}>
            {MAINS.map((p) => <option key={p._id} value={p._id}>[{p.paperName} · {p.marks}m] {p.question[lang].slice(0, 80)}</option>)}
          </select>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0] ?? null); }}
          onClick={() => input.current?.click()}
          className="grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center transition hover:border-brand-500 dark:border-white/15">
          <CloudUpload className="text-brand-500" />
          <p className="mt-2 text-sm font-medium">{file ? file.name : "Drop a PDF here or click to choose"}</p>
          {file && <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
          <input ref={input} type="file" accept="application/pdf" hidden onChange={(e) => pick(e.target.files?.[0] ?? null)} />
        </div>

        {msg && <p role="status" className={msg.ok ? "text-sm text-emerald-600" : "text-sm text-red-600"}>{msg.text}</p>}
        <button className="btn-primary" disabled={!file || busy} onClick={upload}>{busy ? "Uploading..." : "Upload answer"}</button>
      </section>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Your submissions</h2>
      {uploads.length === 0 ? <Empty title="Nothing uploaded yet" /> : (
        <div className="card divide-y divide-slate-100 dark:divide-white/5">
          {uploads.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-4 text-sm">
              <FileText className="text-brand-500" size={18} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{u.fileName}</div>
                <div className="text-xs text-slate-500">{u.questionId} · {new Date(u.createdAt).toLocaleDateString()} · {u.stored === "r2" ? "Cloud" : "Local only"}</div>
              </div>
              <span className="chip capitalize">{u.status}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
