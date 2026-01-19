import PDFDocument from "pdfkit";
import Result from "../models/Result.js";
import User from "../models/User.js";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";

/**
 * Generate PDF result with full summary + detailed answers
 */
export default async function generateResultPdfBuffer(resultId) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await Result.findById(resultId).lean();
      if (!result) return reject(new Error("Result not found"));

      const student = await User.findById(result.studentId).lean();
      const exam = await Exam.findById(result.examId)
        .populate("questions")
        .lean();

      const totalQuestions = exam.questions.length;
      const totalMarks = result.total; // ✅ already MARKS
      const score = result.score;

      const percentage =
        totalMarks > 0
          ? Math.round((score / totalMarks) * 10000) / 100
          : 0;

      // Fetch questions used in result
      const questionIds = result.answers.map(a => a.questionId);
      const questions = await Question.find({ _id: { $in: questionIds } }).lean();

      const answerMap = {};
      result.answers.forEach(a => {
        answerMap[String(a.questionId)] = a;
      });

      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks = [];

      doc.on("data", c => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", err => reject(err));

      /* ===========================
       * HEADER
       =========================== */
      doc.fontSize(20).text(exam.title || "Exam Result", { align: "center" });
      doc.moveDown(1);

      /* ===========================
       * STUDENT META
       =========================== */
      doc.fontSize(12);
      doc.text(`Student: ${student?.name || "-"}`);
      doc.text(`Email: ${student?.email || "-"}`);
      doc.text(
        `Submitted At: ${
          result.submittedAt
            ? new Date(result.submittedAt).toLocaleString()
            : "-"
        }`
      );
      doc.text(
        `Submission Type: ${
          result.submissionType?.replace(/_/g, " ") || "Manual Submit"
        }`
      );
      doc.moveDown(1);

      /* ===========================
       * SCORE SUMMARY
       =========================== */
      doc.fontSize(14).text("Exam Summary", { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12);
      doc.text(`Total Questions: ${totalQuestions}`);
      doc.text(`Attempted: ${result.attempted || 0}`);
      doc.text(`Not Attempted: ${result.notAttempted || 0}`);
      doc.moveDown(0.3);

      doc.text(`Score: ${score} / ${totalMarks}`);
      doc.text(`Percentage: ${percentage}%`);
      doc.moveDown(1);

      /* ===========================
       * DETAILED ANSWERS
       =========================== */
      doc.fontSize(14).text("Detailed Answers", { underline: true });
      doc.moveDown(0.5);

      questions.forEach((q, index) => {
        const idx = index + 1;
        const ans = answerMap[String(q._id)] || {};

        const selectedKey = ans.selectedAnswer;
        const correctKey = ans.correctAnswer;

        const selectedText =
          ans.selectedAnswerText ||
          (selectedKey && q[`option${selectedKey}`]) ||
          "Not Attempted";

        const correctText =
          ans.correctAnswerText ||
          (correctKey && q[`option${correctKey}`]) ||
          "";

        const marks =
          typeof ans.marksGiven === "number" ? ans.marksGiven : 0;

        const status =
          !selectedKey || selectedText === "Not Attempted"
            ? "Not Attempted"
            : selectedKey === correctKey
            ? "Correct"
            : "Wrong";

        doc.fontSize(12).fillColor("black").text(`${idx}. ${q.question}`);
        doc.moveDown(0.2);

        doc.fontSize(11);
        doc.text(`A. ${q.optionA}`);
        doc.text(`B. ${q.optionB}`);
        doc.text(`C. ${q.optionC}`);
        doc.text(`D. ${q.optionD}`);
        doc.moveDown(0.2);

        doc.fontSize(11).text(`Your Answer: ${selectedText}`);
        doc.text(`Correct Answer: ${correctText}`);
        doc.text(`Marks: ${marks} (${status})`);

        doc.moveDown(0.6);
        doc
          .strokeColor("#CCCCCC")
          .lineWidth(1)
          .moveTo(40, doc.y)
          .lineTo(550, doc.y)
          .stroke();
        doc.moveDown(0.8);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
