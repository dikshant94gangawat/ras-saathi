"use client";

import { useEffect, useState } from "react";

export function Hydrated({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <div className="space-y-4" aria-busy>
        <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200 dark:bg-ink-700" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-ink-700" />)}
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
