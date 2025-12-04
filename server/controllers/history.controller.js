import Result from "../models/Result.js";
import User from "../models/User.js";
import Exam from "../models/Exam.js";

export const getAllResults = async (req, res) => {
  try {
    // newest first
    const results = await Result.find().sort({ createdAt: -1 });

    const finalData = [];

    for (let r of results) {
      const user = await User.findById(r.studentId);
      const exam = await Exam.findById(r.examId);

      if (user) {
        const percentage =
          r.total > 0 ? ((r.score / r.total) * 100).toFixed(2) : 0;

        finalData.push({
          studentId: r.studentId,
          
          // 👇 Student
          name: user.name,
          email: user.email,

          // 👇 Exam info
          examTitle: exam?.title || "Unknown Exam",

          // 👇 Result scoring
          score: r.score,
          total: r.total,
          percentage,

          // 👇 NEW FIELD
          submissionType: r.submissionType || "manual_submit",

          // 👇 Date
          date: r.submittedAt || r.createdAt,
        });
      }
    }

    res.json(finalData);

  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ message: "Server error" });
  }
};
