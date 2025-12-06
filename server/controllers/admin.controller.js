import User from "../models/User.js";
import bcrypt from "bcrypt";
import sendEmail from "../utils/sendEmail.js";
import Result from "../models/Result.js";   // <-- THIS IS MISSING IN YOUR FILE
import Exam from "../models/Exam.js";


// CREATE USER
export const createUser = async (req, res) => {
  try {
    const { name, email, phone, assignedExam } = req.body;

    if (!assignedExam) {
      return res.status(400).json({ message: "Please assign an exam to the student." });
    }

    // Generate password
    const plainPassword = Math.random().toString(36).substring(2, 8);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

 const user = new User({
  name,
  email,
  phone,
  password: hashedPassword,
  role: "student",
  isActive: true,
  assignedExam,        // ⭐ NEW
  hasSubmitted: false
});


    await user.save();

    // Portal link (dev mode)
    const portalLink = "https://examportal-lac.vercel.app/";

    // Send login details to student
    await sendEmail(
      email,
      "Your Exam Portal Login Details",
      `
Hello ${name},

Your account has been created successfully.

LOGIN DETAILS
Email: ${email}
Password: ${plainPassword}

Assigned Exam: ${assignedExam}

Exam Portal:
${portalLink}

Best regards,
Clickinnovate Team
`
    );

    res.json({ message: "User created successfully", user });

  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET ALL STUDENTS
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "student" }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// TOGGLE ACTIVE / INACTIVE USER
export const toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Flip active status
    user.isActive = !user.isActive;

    await user.save();
    res.json({
      message: "User status updated",
      isActive: user.isActive,
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", err });
  }
};

// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phone },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });

  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error", err });
  }
};


// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });

  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error", err });
  }
};

export const getSingleResult = async (req, res) => {
  try {
    const { studentId } = req.params;

    const result = await Result.findOne({
      studentId,
      submitted: true
    })
      .populate("studentId", "name email")
      .populate("examId", "title")
      .sort({ createdAt: -1 })
      .lean();

    if (!result) {
      return res.status(404).json({ message: "No result found" });
    }

    // compute totals (explicit)
    const totalQuestions = result.total ?? (result.answers?.length || 0);
    const obtainedScore = result.score ?? result.answers?.reduce((s, a) => s + (a.mark || 0), 0);

    res.json({
      _id: result._id,
      student: result.studentId,
      exam: result.examId,
      score: obtainedScore,
      totalQuestions,
      submittedAt: result.submittedAt,
      answers: result.answers // array of { questionId, question, selectedAnswer, correctAnswer, isCorrect, mark }
    });
  } catch (error) {
    console.error("Error fetching student result:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const fixOldExams = async (req, res) => {
  await Exam.updateMany({}, {
    $set: {
      questions: [],
      isActive: true,
      questionCount: 0
    }
  });

  res.send("Old exams patched!");
};

export const reassignExam = async (req, res) => {
  try {
    const userId = req.params.id;
    const { assignedExam } = req.body;

    if (!assignedExam) {
      return res.status(400).json({ message: "assignedExam is required" });
    }

    // 🔍 Validate exam exists
    const examExists = await Exam.findById(assignedExam);
    if (!examExists) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // 1️⃣ Reset user exam progress
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        assignedExam,
        hasSubmitted: false,
        startedAt: null,
        completedAt: null,
        currentSectionIndex: 0,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Delete ALL previous results for this student
    await Result.deleteMany({ studentId: userId });

    // 3️⃣ (Removed invalid ExamSession.deleteMany)
    // ❌ You DO NOT use ExamSession model — so we do NOT delete it.

    return res.json({
      message: "Exam reassigned successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Reassign exam error:", error);
    res.status(500).json({ message: "Server error" });
  }
};








