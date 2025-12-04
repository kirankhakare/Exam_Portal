// backend/scripts/migrate_results.js
// Usage: node migrate_results.js <EXAM_ID>
// e.g. node migrate_results.js 64abc...

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// adjust path if your db connection lives elsewhere
const dbConnect = require("../config/db"); // should connect when required

// Models
const Exam = require("../models/Exam");
const Result = require("../models/Result");
const User = require("../models/User");

async function gradeExam(exam, studentAnswersMap) {
  const marks = exam.marks || { correct: 1, wrong: 0, unattempted: 0 };

  let score = 0;
  const answersDetailed = [];

  // prepare question correct map
  const qMap = new Map();
  (exam.questions || []).forEach(q => qMap.set(String(q._id), q.correctOption));

  for (const q of (exam.questions || [])) {
    const qid = String(q._id);
    const given = (studentAnswersMap[qid] === undefined) ? null : studentAnswersMap[qid];
    let status, mark;

    if (!given) {
      status = "not_attempted";
      mark = marks.unattempted ?? 0;
    } else if (given === qMap.get(qid)) {
      status = "correct";
      mark = marks.correct;
    } else {
      status = "wrong";
      mark = marks.wrong;
    }

    score += mark;
    answersDetailed.push({
      qId: qid,
      selected: given || null,
      correct: qMap.get(qid),
      status,
      mark
    });
  }

  // determine possible range
  const maxPossible = (exam.questions || []).length * Math.max(0, marks.correct);
  const minPossible = (exam.questions || []).length * Math.min(0, marks.wrong);

  return { score, maxPossible, minPossible, answersDetailed };
}

function computePercentage(score, minPossible, maxPossible) {
  if (Number.isFinite(minPossible) && Number.isFinite(maxPossible) && maxPossible !== minPossible) {
    const clamped = Math.max(minPossible, Math.min(maxPossible, score));
    return Math.round(((clamped - minPossible) / (maxPossible - minPossible)) * 10000) / 100; // two decimals
  }
  // fallback
  return maxPossible ? Math.round((score / maxPossible) * 10000) / 100 : 0;
}

async function run() {
  const examId = process.argv[2];
  if (!examId) {
    console.error("Please provide examId: node migrate_results.js <EXAM_ID>");
    process.exit(1);
  }

  await dbConnect(); // ensure connection (depends on your db file returning a function)
  console.log("Connected to DB");

  const exam = await Exam.findById(examId).lean();
  if (!exam) {
    console.error("Exam not found:", examId);
    await mongoose.disconnect();
    process.exit(1);
  }

  const resultsCursor = Result.find({ exam: examId }).cursor();
  let count = 0;

  for (let doc = await resultsCursor.next(); doc != null; doc = await resultsCursor.next()) {
    try {
      // build studentAnswers map from doc.answers (assumes stored per-question)
      const studentAnswersMap = {};
      if (Array.isArray(doc.answers)) {
        doc.answers.forEach(a => {
          // adjust if your stored selected option property name differs
          studentAnswersMap[String(a.qId)] = a.selected === "Not Attempted" ? null : a.selected;
        });
      }

      const graded = await gradeExam(exam, studentAnswersMap);
      const percentage = computePercentage(graded.score, graded.minPossible, graded.maxPossible);

      // write back
      await Result.updateOne({ _id: doc._id }, {
        $set: {
          score: graded.score,
          maxPossible: graded.maxPossible,
          minPossible: graded.minPossible,
          percentage,
          answers: graded.answersDetailed,
          migratedAt: new Date()
        }
      });

      count++;
      if (count % 100 === 0) console.log("Processed:", count);
    } catch (err) {
      console.error("Error processing result", doc._id, err);
    }
  }

  console.log("Migration complete. Processed:", count);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
