import { MongoClient } from "mongodb";
import { SYLLABUS } from "../src/data/syllabus";
import { PYQS } from "../src/data/pyq";

const CHUNK = 500;

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("ras");
  try {
    for (const paper of SYLLABUS) {
      await db.collection<any>("ras_syllabus_tree").replaceOne({ _id: paper._id }, { ...paper, version: 1 }, { upsert: true });
      console.log("seeded", paper._id);
    }
    for (let i = 0; i < PYQS.length; i += CHUNK) {
      await db.collection<any>("pyq_bank").bulkWrite(
        PYQS.slice(i, i + CHUNK).map((r) => ({ replaceOne: { filter: { _id: r._id }, replacement: r, upsert: true } })),
        { ordered: false }
      );
    }
    console.log("seeded", PYQS.length, "PYQs");
    await db.collection("pyq_bank").createIndexes([
      { key: { examYear: -1, examPhase: 1, paperName: 1 } },
      { key: { subjectTag: 1, marks: 1 } },
      { key: { topicIds: 1 } },
    ]);
  } finally {
    await client.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
