"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpenCheck, CalendarClock, FileUp, GraduationCap, LayoutDashboard, Library, Moon, Sun, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { Hydrated } from "./Hydrated";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/syllabus", label: "Syllabus", icon: BookOpenCheck },
  { href: "/pyq", label: "PYQ Bank", icon: Library },
  { href: "/tests", label: "Mock Tests", icon: Timer },
  { href: "/tracker", label: "Study Tracker", icon: CalendarClock },
  { href: "/answers", label: "Mains Answers", icon: FileUp },
];

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  return (
    <button className="btn-ghost !px-2.5" aria-label="Toggle theme"
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("ras-theme", next ? "dark" : "light");
      }}>
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function LangToggle() {
  const { lang, setLang } = useApp();
  return (
    <div className="flex overflow-hidden rounded-xl border border-slate-200 text-xs font-semibold dark:border-white/10">
      {(["en", "hi"] as const).map((l) => (
        <button key={l} onClick={() => setLang(l)}
          className={cn("px-3 py-2 transition", lang === l ? "bg-brand-600 text-white" : "hover:bg-slate-100 dark:hover:bg-ink-700")}>
          {l === "en" ? "EN" : "हिं"}
        </button>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-ink-800 lg:flex">
        <Link href="/" className="mb-6 flex items-center gap-2 px-2 text-lg font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow">
            <GraduationCap size={20} />
          </span>
          RAS Saathi
        </Link>
        <nav className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = path === href || path.startsWith(href + "/");
            return (
              <Link key={href} href={href}
                className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-ink-700")}>
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <p className="mt-auto px-2 text-xs text-slate-400">Data is stored in your browser unless cloud sync is configured.</p>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-ink-900/80 lg:px-8">
        <Link href="/" className="font-extrabold lg:hidden">RAS Saathi</Link>
        <div className="hidden lg:block" />
        <div className="flex items-center gap-2"><LangToggle /><ThemeToggle /></div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 lg:px-8 lg:pb-10">
        <Hydrated>{children}</Hydrated>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-ink-800/95 lg:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={cn("flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                active ? "text-brand-600" : "text-slate-500")}>
              <Icon size={20} /> {label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
