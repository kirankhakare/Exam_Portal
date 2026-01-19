// server/scripts/migrate_results.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Exam from "../models/Exam.js";
import Result from "../models/Result.js";

dotenv.config(); // loads server/.env

async function connectDB() {
  if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL missing in .env");
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log("✅ MongoDB connected");
}

async function migrateResults() {
  const results = await Result.find();
  let updated = 0;

  for (const r of results) {
    // ❌ no populate needed
    const exam = await Exam.findById(r.examId);
    if (!exam || !Array.isArray(exam.questions)) continue;

    const totalMarks = exam.questions.length * exam.marksCorrect;

    let score = r.score ?? 0;

    // safety clamps
    if (score < 0) score = 0;
    if (score > totalMarks) score = totalMarks;

    const percentage =
      totalMarks > 0
        ? Math.round((score / totalMarks) * 10000) / 100
        : 0;

    r.total = totalMarks;
    r.score = score;
    r.percentage = percentage;

    await r.save();
    updated++;
  }

  console.log(`✅ Migration completed. Updated ${updated} results`);
}

(async () => {
  try {
    await connectDB();
    await migrateResults();
    await mongoose.disconnect();
    console.log("🔚 Done");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
})();
