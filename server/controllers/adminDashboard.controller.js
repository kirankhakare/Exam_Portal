import User from "../models/User.js";
import Exam from "../models/Exam.js";
import Result from "../models/Result.js";

export const getDashboardStats = async (req, res) => {
  try {

    /** ========== BASIC STATS ========== **/

    const totalUsers = await User.countDocuments({ role: "student" });
    const totalExams = await Exam.countDocuments();
    const totalResults = await Result.countDocuments();


    /** ========== SUBMISSION STATUS ========== **/

    const submitted = await Result.countDocuments({ submitted: true });
    const autoSubmitted = await Result.countDocuments({
      submitted: true,
      autoSubmitted: true
    });
    const notStarted = totalUsers - submitted;


    /** ========== SCORE DISTRIBUTION ========== **/

    const allResults = await Result.find().lean();

    const distribution = {
      "0_20": 0,
      "20_40": 0,
      "40_60": 0,
      "60_80": 0,
      "80_100": 0
    };

    allResults.forEach(r => {
      const pct = (r.score / r.total) * 100;

      if (pct <= 20) distribution["0_20"]++;
      else if (pct <= 40) distribution["20_40"]++;
      else if (pct <= 60) distribution["40_60"]++;
      else if (pct <= 80) distribution["60_80"]++;
      else distribution["80_100"]++;
    });


    /** ========== RECENT RESULTS (latest 10) ========== **/

    const recentResults = await Result.find()
      .sort({ submittedAt: -1 })
      .limit(10)
      .populate("studentId", "name email")
      .populate("examId", "title")
      .lean();


    /** ========== ⭐ TOP 10 STUDENTS BY SCORE ⭐ ========== **/

    const topStudents = await Result.find()
      .sort({ score: -1 })
      .limit(10)
      .populate("studentId", "name email")
      .populate("examId", "title")
      .lean();


    /** ========== SEND ALL STATS ========== **/

    res.json({
      totalUsers,
      totalExams,
      totalResults,

      submissions: {
        submitted,
        autoSubmitted,
        notStarted
      },

      scoreDistribution: distribution,
      recentResults,
      topStudents,
    });

  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Server error", err });
  }
};
