"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/syllabus", label: "Overview & uploads" },
  { href: "/syllabus/micro", label: "Micro tracker" },
];

export function SyllabusTabs() {
  const path = usePathname();
  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto pb-1">
      {TABS.map((t) => {
        const active = t.href === "/syllabus" ? path === "/syllabus" : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={cn("chip shrink-0 !px-4 !py-2 !text-sm", active && "chip-active")}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
