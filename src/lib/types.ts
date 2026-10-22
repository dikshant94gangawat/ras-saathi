export type Bi = { en: string; hi: string };
export type Topic = { topicId: string; title: Bi };
export type Subject = { subjectId: string; title: Bi; topics: Topic[] };
export type Unit = { unitId: string; title: Bi; subjects: Subject[] };
export type Paper = { _id: string; paper: string; title: Bi; units: Unit[] };

export type ProgressStatus = "not_started" | "in_progress" | "completed";
export type ExamPhase = "pre" | "mains";

export type PYQ = {
  _id: string;
  examYear: number;
  examPhase: "pre" | "mains";
  paperName: string;
  marks: 2 | 5 | 10;
  subjectTag: string;
  topicIds: string[];
  question: Bi;
  modelAnswer: Bi;
};

export type MockTest = {
  id: string;
  title: string;
  durationMinutes: number;
  negativeMarking: number;
  marksPerQuestion: number;
  questions: { id: string; q: Bi; options: Bi[]; answer: number; explanation: Bi }[];
};
