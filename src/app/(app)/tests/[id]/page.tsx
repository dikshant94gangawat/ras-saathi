"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flag } from "lucide-react";
import { getTest } from "@/data/tests";
import { useApp, type TestAttempt } from "@/lib/store";
import { cn, fmtDuration } from "@/lib/utils";

export default function TestRunner({ params }: { params: { id: string } }) {
  const test = getTest(params.id);
  if (!test) notFound();
  return <Runner test={test} />;
}

function Runner({ test }: { test: NonNullable<ReturnType<typeof getTest>> }) {
  const { lang, addAttempt, addStudy } = useApp();
  const total = test.durationMinutes * 60;
  const [started, setStarted] = useState(false);
  const [left, setLeft] = useState(total);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<TestAttempt | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const doneRef = useRef(false);

  const submit = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const a = answersRef.current;
    let correct = 0, wrong = 0;
    test.questions.forEach((q) => {
      if (a[q.id] === undefined) return;
      a[q.id] === q.answer ? correct++ : wrong++;
    });
    const attempt: TestAttempt = {
      id: crypto.randomUUID(), testId: test.id, title: test.title,
      marks: Math.round((correct * test.marksPerQuestion - wrong * test.marksPerQuestion * test.negativeMarking) * 100) / 100,
      total: test.questions.length * test.marksPerQuestion, correct, wrong,
      skipped: test.questions.length - correct - wrong,
      seconds: total - leftRef.current, submittedAt: new Date().toISOString(),
    };
    addAttempt(attempt);
    addStudy(Math.max(1, Math.round(attempt.seconds / 60)));
    setResult(attempt);
  }, [test, total, addAttempt, addStudy]);

  const leftRef = useRef(left);
  leftRef.current = left;

  useEffect(() => {
    if (!started || result) return;
    const t = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [started, result]);

  useEffect(() => { if (started && left === 0) submit(); }, [left, started, submit]);

  if (!started) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <h1 className="text-xl font-bold">{test.title}</h1>
        <ul className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <li>{test.questions.length} questions, {test.durationMinutes} minutes</li>
          <li>+{test.marksPerQuestion} per correct answer</li>
          <li>-{(test.marksPerQuestion * test.negativeMarking).toFixed(2)} per wrong answer</li>
        </ul>
        <button className="btn-primary mt-6 px-8 py-3" onClick={() => setStarted(true)}>Begin</button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-500">Your score</p>
          <p className="mt-1 text-4xl font-extrabold text-brand-600">{result.marks.toFixed(2)}<span className="text-xl text-slate-400">/{result.total}</span></p>
          <p className="mt-2 text-sm text-slate-500">{result.correct} correct · {result.wrong} wrong · {result.skipped} skipped · {fmtDuration(result.seconds)}</p>
          <div className="mt-5 flex justify-center gap-2">
            <Link href="/tests" className="btn-ghost">All tests</Link>
            <Link href="/dashboard" className="btn-primary">Dashboard</Link>
          </div>
        </div>
        {test.questions.map((q, i) => {
          const picked = answers[q.id];
          return (
            <div key={q.id} className="card p-5">
              <p className="font-medium">{i + 1}. {q.q[lang]}</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {q.options.map((o, oi) => (
                  <li key={oi} className={cn("rounded-lg border px-3 py-2",
                    oi === q.answer ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                      : oi === picked ? "border-red-400 bg-red-50 dark:bg-red-500/10" : "border-slate-200 dark:border-white/10")}>
                    {o[lang]}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{picked === undefined && <b>Skipped. </b>}{q.explanation[lang]}</p>
            </div>
          );
        })}
      </div>
    );
  }

  const q = test.questions[idx];
  const low = left <= 60;
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between text-sm">
          <span className="text-slate-500">Question {idx + 1} of {test.questions.length}</span>
          <span className={cn("rounded-lg px-3 py-1 font-mono font-semibold", low ? "bg-red-100 text-red-700" : "bg-slate-100 dark:bg-ink-700")}>{fmtDuration(left)}</span>
        </div>
        <p className="text-lg font-medium leading-relaxed">{q.q[lang]}</p>
        <div className="mt-5 space-y-2">
          {q.options.map((o, oi) => (
            <button key={oi} onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
              className={cn("flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                answers[q.id] === oi ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10" : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-ink-700")}>
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-semibold">{String.fromCharCode(65 + oi)}</span>
              {o[lang]}
            </button>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-between gap-2">
          <div className="flex gap-2">
            <button className="btn-ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Previous</button>
            <button className="btn-ghost" onClick={() => setAnswers((a) => { const n = { ...a }; delete n[q.id]; return n; })}>Clear</button>
          </div>
          {idx < test.questions.length - 1
            ? <button className="btn-primary" onClick={() => setIdx(idx + 1)}>Next</button>
            : <button className="btn-primary" onClick={() => confirm("Submit the test?") && submit()}><Flag size={14} /> Submit</button>}
        </div>
      </div>

      <aside className="card h-fit p-4">
        <p className="mb-3 text-sm font-semibold">Palette</p>
        <div className="grid grid-cols-5 gap-2">
          {test.questions.map((x, i) => (
            <button key={x.id} onClick={() => setIdx(i)}
              className={cn("h-9 rounded-lg border text-sm font-medium",
                i === idx && "ring-2 ring-brand-500",
                answers[x.id] !== undefined ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 dark:border-white/10")}>
              {i + 1}
            </button>
          ))}
        </div>
        <button className="btn-ghost mt-4 w-full" onClick={() => confirm("Submit the test?") && submit()}>Submit now</button>
      </aside>
    </div>
  );
}
