// backend/controllers/student.controller.js
import Result from "../models/Result.js";
import Question from "../models/Question.js";
import User from "../models/User.js";
import Exam from "../models/Exam.js";
import sendResultEmail from "../utils/sendResultEmail.js";
import generateResultPdfBuffer from "../utils/generateResultPdfBuffer.js";

/**
 * START EXAM — Creates a new clean result session
 * POST /api/student/start
 */
export const startExam = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: "Missing studentId" });

    const user = await User.findById(studentId);
    if (!user || !user.isActive)
      return res.status(403).json({ message: "Account inactive" });

    if (!user.assignedExam)
      return res.status(400).json({ message: "No exam assigned." });

    const exam = await Exam.findById(user.assignedExam);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const now = new Date();

    // 🔥 CHECK EXAM AVAILABILITY WINDOW
    if (exam.availableFrom && now < exam.availableFrom) {
      return res.status(400).json({ message: "Exam is not yet available." });
    }
    if (exam.availableTo && now > exam.availableTo) {
      return res.status(400).json({ message: "Exam time is over." });
    }

    // Delete only previous active attempt for same exam
    await Result.deleteMany({
      studentId,
      examId: exam._id,
      submitted: false
    });

    const endTime = new Date(now.getTime() + exam.duration * 60000);

    const result = await Result.create({
      studentId,
      examId: exam._id,
      startTime: now,
      endTime,
      submitted: false,
      answers: [],
      score: 0,
      total: exam.questions?.length || 0,
    });

    res.json({
      message: "Exam started",
      resultId: result._id,
      startTime: now,
      endTime,
      timeLeft: exam.duration * 60,
    });

  } catch (err) {
    console.error("startExam error:", err);
    res.status(500).json({ message: "Server error", err });
  }
};


/**
 * GET TIME LEFT
 */
export const getTimeLeft = async (req, res) => {
  try {
    const studentId = req.query.studentId;

    const active = await Result.findOne({
      studentId,
      submitted: false
    }).sort({ createdAt: -1 });

    if (!active)
      return res.status(404).json({ message: "No active session found" });

    const now = new Date();
    const secondsLeft = Math.max(0, Math.floor((active.endTime - now) / 1000));

    res.json({
      timeLeft: secondsLeft,
      startTime: active.startTime,
      endTime: active.endTime
    });

  } catch (err) {
    console.error("getTimeLeft error:", err);
    res.status(500).json({ message: "Server error", err });
  }
};



/**
 * SUBMIT EXAM
 */
// backend/controllers/student.controller.js

export const submitExam = async (req, res) => {
  try {
    const { studentId, answers, submissionType } = req.body;

    if (!studentId || !answers) {
      return res.status(400).json({ message: "Missing studentId or answers" });
    }

    // FIND ACTIVE EXAM SESSION
    const active = await Result.findOne({
      studentId,
      submitted: false,
    }).sort({ createdAt: -1 });

    if (!active) {
      return res.status(400).json({ message: "No active exam session." });
    }

    const now = new Date();

    // ALWAYS SCORE EVEN IF TIME IS OVER
    // ❌ remove early return, just mark as submitted later

    // FETCH EXAM WITH QUESTIONS
    const exam = await Exam.findById(active.examId)
      .populate("questions")
      .lean();

    if (!exam) {
      return res.status(404).json({ message: "Exam not found." });
    }

    const correctMarks = exam.marksCorrect;
    const wrongMarks = exam.marksWrong;
    const notAttemptedMarks = exam.marksNotAttempted;

    let score = 0;
    let answerDetails = [];

    let attemptedCount = 0;
    let notAttemptedCount = 0;

    // 🔥 Normalize student answers to A/B/C/D
    const getOptionKey = (value, q) => {
      if (!value) return "";
      const v = value.toString().trim().toUpperCase();

      if (v === "NOT ATTEMPTED") return "";

      if (["A", "B", "C", "D"].includes(v)) return v;

      if (v === "OPTION A") return "A";
      if (v === "OPTION B") return "B";
      if (v === "OPTION C") return "C";
      if (v === "OPTION D") return "D";

      // match full text
      if (q.optionA && v === q.optionA.trim().toUpperCase()) return "A";
      if (q.optionB && v === q.optionB.trim().toUpperCase()) return "B";
      if (q.optionC && v === q.optionC.trim().toUpperCase()) return "C";
      if (q.optionD && v === q.optionD.trim().toUpperCase()) return "D";

      return "";
    };

    // 🔥 SCORE EACH QUESTION
    for (const q of exam.questions) {
      const qId = String(q._id);
      const studentAnsRaw = answers[qId] || null;

      const correctKey = getOptionKey(q.correctAnswer, q); // A/B/C/D
      const selectedKey = getOptionKey(studentAnsRaw, q);  // A/B/C/D

      let isCorrect = false;
      let marks = 0;

      if (!selectedKey) {
        // NOT ATTEMPTED
        marks = notAttemptedMarks;
        notAttemptedCount++;

      } else if (selectedKey === correctKey) {
        // CORRECT
        marks = correctMarks;
        isCorrect = true;
        attemptedCount++;

      } else {
        // WRONG → APPLY NEGATIVE MARKING
        marks = -(correctMarks / 3); // ⭐ TCS RULE
        attemptedCount++;
      }

      score += marks;

      const selectedText = selectedKey ? q["option" + selectedKey] : "Not Attempted";
      const correctText = correctKey ? q["option" + correctKey] : "";

      answerDetails.push({
        questionId: qId,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,

        selectedAnswer: selectedKey || "Not Attempted",
        correctAnswer: correctKey,
        selectedAnswerText: selectedText,
        correctAnswerText: correctText,

        isCorrect,
        marksGiven: marks,
      });
    }

    // 🔥 SAVE SCORING + META
    active.score = Number(score.toFixed(2));
    active.total = exam.questions.length;
    active.attempted = attemptedCount;
    active.notAttempted = notAttemptedCount;

    active.submitted = true;
    active.submittedAt = now;
    active.answers = answerDetails;

    // ⭐ IMPORTANT FIX
    active.submissionType = submissionType || "manual_submit";

    await active.save();


    // update student flag
    await User.findByIdAndUpdate(studentId, { hasSubmitted: true });

    // 🔥 SEND PDF EMAIL
    try {
      const user = await User.findById(studentId).lean();
      const pdfBuffer = await generateResultPdfBuffer(active._id);

      await sendResultEmail(
        user.email,
        user.name,
        exam.title,
        pdfBuffer
      );

      console.log("Result PDF emailed to:", user.email);
    } catch (err) {
      console.error("Email/PDF sending failed:", err);
    }

    // RESPONSE
    return res.json({
      message: "Exam submitted successfully",
      score,
      total: exam.questions.length,
      attempted: attemptedCount,
      notAttempted: notAttemptedCount,
      resultId: active._id,
    });

  } catch (err) {
    console.error("Submit exam error:", err);
    res.status(500).json({ message: "Server error", err });
  }
};




/**
 * GET QUESTIONS
 */
export const getQuestions = async (req, res) => {
  try {
    const studentId = req.query.studentId;

    const user = await User.findById(studentId);
    if (!user || !user.isActive)
      return res.status(403).json({ message: "Your account is inactive." });

    if (!user.assignedExam)
      return res.status(400).json({ message: "No exam assigned." });

    const exam = await Exam.findById(user.assignedExam).populate("questions");
    if (!exam)
      return res.status(404).json({ message: "Exam not found" });

    const questions = exam.questions.map(q => ({
      _id: q._id,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD
    }));

    res.json({
      examTitle: exam.title,
      duration: exam.duration,
      questions
    });

  } catch (err) {
    console.error("Get questions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET LATEST RESULT
 */
export const getLatestResult = async (req, res) => {
  try {
    const { studentId } = req.query;

    const result = await Result.findOne({ studentId }).sort({ createdAt: -1 });

    if (!result)
      return res.status(404).json({ message: "Result not found" });

    res.json(result);

  } catch (err) {
    console.error("Result fetch error:", err);
    res.status(500).json({ message: "Server error", err });
  }
};


