import type { ExamPhase } from "./types";

// Syllabus PDFs live in the browser (IndexedDB) because the app has no server-side storage for them.
const DB_NAME = "ras-saathi-files";
const STORE = "syllabus";

const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

async function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(req.result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export const saveSyllabusFile = (phase: ExamPhase, file: Blob) =>
  run("readwrite", (s) => s.put(file, phase));

export const getSyllabusFile = (phase: ExamPhase) =>
  run<Blob | undefined>("readonly", (s) => s.get(phase));

export const deleteSyllabusFile = (phase: ExamPhase) =>
  run("readwrite", (s) => s.delete(phase));
