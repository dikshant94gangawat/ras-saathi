import Link from "next/link";
import { BarChart3, BookOpenCheck, FileUp, GraduationCap, Languages, Library, Timer, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: BookOpenCheck, t: "Syllabus Tracker", d: "GS-1 to GS-4 topic tree with status, revision counts and completion percentage." },
  { icon: Library, t: "PYQ Bank", d: "Filter by year, paper, marks and subject. Bilingual questions with model answers." },
  { icon: Timer, t: "Timed Mock Tests", d: "Negative marking, question palette, instant review with explanations." },
  { icon: BarChart3, t: "Study Analytics", d: "Daily targets, streaks, weekly charts and test score trends." },
  { icon: FileUp, t: "Mains Answer Upload", d: "Upload handwritten PDFs straight to Cloudflare R2 using pre-signed URLs." },
  { icon: Languages, t: "Hindi and English", d: "Switch languages anywhere. Light and dark mode included." },
];

export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="flex items-center gap-2 text-lg font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow">
            <GraduationCap size={20} />
          </span>
          RAS Saathi
        </span>
        <Link href="/dashboard" className="btn-primary">Open app</Link>
      </header>

      <section className="relative mx-auto max-w-4xl px-4 pb-16 pt-14 text-center animate-fade-up">
        <span className="chip mb-5">RPSC RAS Exam Preparation</span>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Prepare smarter for <span className="bg-gradient-to-r from-brand-400 to-brand-700 bg-clip-text text-transparent">RAS</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          One place for syllabus progress, previous year questions, mock tests and mains answer practice, built to run on free-tier infrastructure.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="btn-primary px-6 py-3">Start preparing <ArrowRight size={16} /></Link>
          <Link href="/pyq" className="btn-ghost px-6 py-3">Browse PYQs</Link>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, t, d }) => (
          <div key={t} className="card p-6 transition hover:-translate-y-1 hover:shadow-lg">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15"><Icon size={20} /></span>
            <h3 className="mt-4 font-semibold">{t}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
