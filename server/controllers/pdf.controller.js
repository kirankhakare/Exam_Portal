// controllers/pdf.controller.js
import PDFDocument from "pdfkit";
import Result from "../models/Result.js";
import User from "../models/User.js";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import fs from "fs";
import path from "path";

/**
 * GET /api/student/result-pdf/:resultId
 * Streams a PDF with full exam review.
 */
export const generateResultPdf = async (req, res) => {
  try {
    const { resultId } = req.params;
    if (!resultId) return res.status(400).json({ message: "Missing resultId" });

    // Load result
    const result = await Result.findById(resultId).lean();
    if (!result) return res.status(404).json({ message: "Result not found" });

    // Load student & exam
    const student = await User.findById(result.studentId).lean();
    const exam = await Exam.findById(result.examId).lean();

    // Get ALL questions of the exam — NOT ONLY attempted ones
    const examQuestions = await Question.find({ examId: exam._id }).lean();

    // Map attempted answers by questionId
    const answerMap = {};
    (result.answers || []).forEach(a => {
      answerMap[String(a.questionId)] = a;
    });

    // Create PDF doc and stream to response
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    const filename = `Result-${student?.name || "student"}-${exam?.title || "exam"}.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Optional Logo
    const logoPath = "/mnt/data/c321e541-ac75-4552-a0ae-ea4a908e84d2.png";
    if (fs.existsSync(logoPath)) {
      try {
        doc.image(logoPath, 50, 45, { width: 80 });
      } catch {}
    }

    // Header
    doc.fontSize(18).text("Exam Result", 150, 50).moveDown(1);

    // Student Info
    doc.fontSize(10);
    const leftColX = 50;
    const rightColX = 320;
    const topY = 140;

    doc.text(`Student Name: ${student?.name}`, leftColX, topY);
    doc.text(`Email: ${student?.email}`, leftColX, topY + 15);
    doc.text(`Exam: ${exam?.title}`, leftColX, topY + 30);
    doc.text(`Date: ${new Date(result.submittedAt).toLocaleString()}`, leftColX, topY + 45);

    doc.text(`Score: ${result.score}`, rightColX, topY);
    doc.text(`Total Questions: ${examQuestions.length}`, rightColX, topY + 15);
    doc.text(`Percentage: ${result.percentage ? result.percentage + "%" : "—"}`, rightColX, topY + 30);

    // Divider
    doc.moveTo(50, topY + 75).lineTo(545, topY + 75).stroke();

    doc.fontSize(12).text("Question Review", 50, topY + 90);
    doc.moveDown(0.5);

    let y = doc.y + 5;

    // Loop ALL exam questions (not only attempted)
    for (let i = 0; i < examQuestions.length; i++) {
      const q = examQuestions[i];
      const userAnswer = answerMap[String(q._id)];

      const selected = userAnswer?.selectedAnswer || "Not Attempted";
      const correct = q.correctAnswer;

      const status = userAnswer
        ? userAnswer.isCorrect ? "Correct" : "Wrong"
        : "Not Attempted";

      const statusColor = userAnswer
        ? userAnswer.isCorrect ? "green" : "red"
        : "gray";

      // Page break check
      if (y > 720) {
        doc.addPage();
        y = 50;
      }

      // Question
      doc.fontSize(11).fillColor("black").text(`${i + 1}. ${q.question}`, 50, y, { width: 470 });
      y = doc.y + 6;

      // Options
      const optLabels = ["A", "B", "C", "D"];
      const options = [q.optionA, q.optionB, q.optionC, q.optionD];

      doc.fontSize(10);
      for (let j = 0; j < options.length; j++) {
        doc.text(`   ${optLabels[j]}. ${options[j]}`, 60, y);
        y = doc.y + 2;
      }

      // Answers
      y += 4;
      doc.fillColor("black").text(`Your Answer: ${selected}`, 60, y);
      doc.text(`Correct Answer: ${correct}`, 60, (y += 14));

      doc.fillColor(statusColor).text(`Status: ${status}`, 60, (y += 14));

      // Divider
      doc.moveTo(50, (y += 6)).lineTo(545, y).strokeColor("#eeeeee").stroke();
      y += 12;
    }

    doc.end();

  } catch (err) {
    console.error("generateResultPdf error:", err);
    res.status(500).json({ message: "Server error generating PDF" });
  }
};
