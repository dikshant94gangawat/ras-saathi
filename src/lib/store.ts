"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExamPhase, Paper, ProgressStatus } from "./types";
import { TOTAL_TOPICS } from "@/data/syllabus";
import { dateKey } from "./utils";

export type TopicProgress = { status: ProgressStatus; lastRevisedAt?: string; revisionCount: number };
export type StudyLog = { minutes: number; targetAchieved: boolean };
export type TestAttempt = {
  id: string; testId: string; title: string; marks: number; total: number;
  correct: number; wrong: number; skipped: number; seconds: number; submittedAt: string;
};
export type UploadRecord = {
  id: string; questionId: string; fileName: string; size: number; key?: string;
  status: "pending" | "reviewed"; createdAt: string; stored: "r2" | "local";
};
export type SyllabusDoc = { fileName: string; size: number; uploadedAt: string };

type State = {
  name: string;
  targetYear: number;
  lang: "en" | "hi";
  dailyTargetMinutes: number;
  progress: Record<string, TopicProgress>;
  logs: Record<string, StudyLog>;
  attempts: TestAttempt[];
  uploads: UploadRecord[];
  syllabusDocs: Partial<Record<ExamPhase, SyllabusDoc>>;
  microSyllabus: Partial<Record<ExamPhase, Paper[]>>;
  bookmarks: string[];
  setProfile: (p: Partial<Pick<State, "name" | "targetYear" | "dailyTargetMinutes">>) => void;
  setLang: (l: "en" | "hi") => void;
  setStatus: (topicId: string, status: ProgressStatus) => void;
  markRevised: (topicId: string) => void;
  addStudy: (minutes: number, date?: string) => void;
  addAttempt: (a: TestAttempt) => void;
  addUpload: (u: UploadRecord) => void;
  setSyllabusDoc: (phase: ExamPhase, doc: SyllabusDoc | null) => void;
  setMicroSyllabus: (phase: ExamPhase, papers: Paper[] | null) => void;
  toggleBookmark: (id: string) => void;
  reset: () => void;
};

const initial = {
  name: "Aspirant", targetYear: 2027, lang: "en" as const, dailyTargetMinutes: 240,
  progress: {}, logs: {}, attempts: [], uploads: [], syllabusDocs: {}, microSyllabus: {}, bookmarks: [],
};

const syncRemote = (topicId: string, status: ProgressStatus, revised?: boolean) => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  fetch("/api/syllabus/progress", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topicId, status, revised }),
  }).catch(() => {});
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      setProfile: (p) => set(p),
      setLang: (lang) => set({ lang }),
      setStatus: (topicId, status) => {
        set((s) => ({
          progress: { ...s.progress, [topicId]: { ...s.progress[topicId], revisionCount: s.progress[topicId]?.revisionCount ?? 0, status } },
        }));
        syncRemote(topicId, status);
      },
      markRevised: (topicId) => {
        const cur = get().progress[topicId];
        set((s) => ({
          progress: {
            ...s.progress,
            [topicId]: {
              status: cur?.status ?? "completed",
              revisionCount: (cur?.revisionCount ?? 0) + 1,
              lastRevisedAt: new Date().toISOString(),
            },
          },
        }));
        syncRemote(topicId, cur?.status ?? "completed", true);
      },
      addStudy: (minutes, date = dateKey()) =>
        set((s) => {
          const total = Math.min(1440, (s.logs[date]?.minutes ?? 0) + minutes);
          return { logs: { ...s.logs, [date]: { minutes: total, targetAchieved: total >= s.dailyTargetMinutes } } };
        }),
      addAttempt: (a) => set((s) => ({ attempts: [a, ...s.attempts].slice(0, 200) })),
      addUpload: (u) => set((s) => ({ uploads: [u, ...s.uploads] })),
      setSyllabusDoc: (phase, doc) =>
        set((s) => {
          const next = { ...s.syllabusDocs };
          if (doc) next[phase] = doc;
          else delete next[phase];
          return { syllabusDocs: next };
        }),
      setMicroSyllabus: (phase, papers) =>
        set((s) => {
          const next = { ...s.microSyllabus };
          if (papers) next[phase] = papers;
          else delete next[phase];
          return { microSyllabus: next };
        }),
      toggleBookmark: (id) =>
        set((s) => ({ bookmarks: s.bookmarks.includes(id) ? s.bookmarks.filter((b) => b !== id) : [...s.bookmarks, id] })),
      reset: () => set({ ...initial }),
    }),
    { name: "ras-saathi-v1" }
  )
);

export const completionStats = (progress: Record<string, TopicProgress>) => {
  const vals = Object.values(progress);
  const completed = vals.filter((p) => p.status === "completed").length;
  const inProgress = vals.filter((p) => p.status === "in_progress").length;
  return {
    completed, inProgress, total: TOTAL_TOPICS,
    percent: TOTAL_TOPICS ? Math.round((completed / TOTAL_TOPICS) * 1000) / 10 : 0,
  };
};

export const streakOf = (logs: Record<string, StudyLog>) => {
  let streak = 0;
  const d = new Date();
  if (!(logs[dateKey(d)]?.minutes > 0)) d.setDate(d.getDate() - 1); // today not yet logged shouldn't break the streak
  while (logs[dateKey(d)]?.minutes > 0) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
};
