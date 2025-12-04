import Exam from "../models/Exam.js";

/**
 * CREATE NEW EXAM
 * POST /api/admin/create-exam
 */
export const createExam = async (req, res) => {
  try {
    const {
      title,
      duration,
      availableFrom,
      availableTo,
      marksCorrect,
      marksWrong,
      marksNotAttempted,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Exam title is required" });
    }

    const exam = await Exam.create({
      title,

      // duration → if admin sends "", null or 0, fallback to default (60)
      duration:
        duration && !isNaN(duration) && Number(duration) > 0
          ? Number(duration)
          : undefined,

      // availability
      availableFrom: availableFrom ? new Date(availableFrom) : null,
      availableTo: availableTo ? new Date(availableTo) : null,

      // marking rules (fallback to defaults defined in schema)
      marksCorrect:
        marksCorrect !== undefined && marksCorrect !== ""
          ? Number(marksCorrect)
          : undefined,
      marksWrong:
        marksWrong !== undefined && marksWrong !== ""
          ? Number(marksWrong)
          : undefined,
      marksNotAttempted:
        marksNotAttempted !== undefined && marksNotAttempted !== ""
          ? Number(marksNotAttempted)
          : undefined,

      // always initialize question count
      questionCount: 0,
    });

    res.json({
      message: "Exam created successfully",
      exam,
    });

  } catch (err) {
    console.error("Create exam error:", err);
    res.status(500).json({ message: "Server error", err });
  }
};


/**
 * GET ALL EXAMS
 * GET /api/admin/exams
 */
export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });

    const formatted = exams.map(exam => ({
      _id: exam._id,
      title: exam.title,
      duration: exam.duration,
      isActive: exam.isActive,

      // availability
      availableFrom: exam.availableFrom,
      availableTo: exam.availableTo,

      // marking
      marksCorrect: exam.marksCorrect,
      marksWrong: exam.marksWrong,
      marksNotAttempted: exam.marksNotAttempted,

      questionCount:
        exam.questionCount !== undefined
          ? exam.questionCount
          : (exam.questions ? exam.questions.length : 0),
    }));

    res.json(formatted);

  } catch (error) {
    console.error("Get exams error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * TOGGLE ACTIVE / INACTIVE EXAM
 * PATCH /api/admin/toggle-exam/:id
 */
export const toggleExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    exam.isActive = !exam.isActive;
    await exam.save();

    res.json({
      message: `Exam is now ${exam.isActive ? "Active" : "Inactive"}`,
      isActive: exam.isActive
    });

  } catch (error) {
    console.error("Toggle exam status error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
