import Result from "../models/Result.js";
import User from "../models/User.js";
import Exam from "../models/Exam.js";

export const getAllResults = async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });
    const finalData = [];

    for (let r of results) {
      const user = await User.findById(r.studentId);
      const exam = await Exam.findById(r.examId);

      if (!user || !exam) continue;

      // ✅ get marksCorrect from EXAM
      const marksCorrect = exam.marksCorrect || 1;

      // ✅ calculate total marks from exam
      const totalMarks = exam.questionCount * marksCorrect;

      // ✅ percentage logic (CORRECT)
      const percentage =
        totalMarks > 0
          ? ((r.score / totalMarks) * 100).toFixed(2)
          : "0.00";

      finalData.push({
        studentId: r.studentId,

        // Student
        name: user.name,
        email: user.email,

        // Exam
        examTitle: exam.title,
        marksCorrect: exam.marksCorrect,
        questionCount: exam.questionCount,

        // Result
        score: r.score,
        totalMarks,
        percentage,

        submissionType: r.submissionType || "manual_submit",
        date: r.submittedAt || r.createdAt,
      });
    }

    res.json(finalData);

  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ message: "Server error" });
  }
};

