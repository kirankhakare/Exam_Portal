import XLSX from "xlsx";
import Question from "../models/Question.js";
import Exam from "../models/Exam.js"; 

export const uploadQuestions = async (req, res) => {
  try {
    const examId = req.body.examId;

    if (!examId) {
      return res.status(400).json({ message: "examId is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Read Excel
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const formatted = data.map((row) => ({
      question: row["Question"],
      optionA: row["Option A"],
      optionB: row["Option B"],
      optionC: row["Option C"],
      optionD: row["Option D"],
      correctAnswer: row["Correct Option"],
      examId,
    }));

    // Insert Questions
    const createdQuestions = await Question.insertMany(formatted);

    // Push question IDs into Exam
    exam.questions.push(...createdQuestions.map((q) => q._id));
    await exam.save();

    res.json({
      message: "Questions uploaded successfully!",
      count: createdQuestions.length,
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    console.error("GET QUESTIONS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId).populate("questions");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.json({ questions: exam.questions });
  } catch (error) {
    console.error("Get exam questions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const updated = await Question.findByIdAndUpdate(questionId, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.json({
      message: "Question updated",
      question: updated,
    });
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    // 👉 Get question to find examId
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const examId = question.examId;

    // 👉 Delete question
    await Question.findByIdAndDelete(questionId);

    // 👉 Also remove from Exam.questions array
    await Exam.findByIdAndUpdate(examId, {
      $pull: { questions: questionId }
    });

    // 👉 Check if any questions remain
    const remaining = await Question.countDocuments({ examId });

    if (remaining === 0) {
      await Exam.findByIdAndDelete(examId);
      return res.json({
        message: "Question deleted & Exam removed (no questions left)",
        examDeleted: true
      });
    }

    res.json({
      message: "Question deleted",
      examDeleted: false
    });

  } catch (error) {
    console.error("Delete question error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const bulkDeleteQuestions = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No question IDs provided" });
    }

    // 👉 Lookup first question to get exam
    const question = await Question.findById(ids[0]);
    const examId = question?.examId;

    // 👉 Delete questions
    await Question.deleteMany({ _id: { $in: ids } });

    // 👉 Remove references from exam
    await Exam.findByIdAndUpdate(examId, {
      $pull: { questions: { $in: ids } }
    });

    // 👉 Check remaining
    const remaining = await Question.countDocuments({ examId });

    if (remaining === 0) {
      await Exam.findByIdAndDelete(examId);
      return res.json({
        message: "Selected questions deleted & Exam removed",
        examDeleted: true
      });
    }

    res.json({
      message: "Selected questions deleted",
      examDeleted: false
    });

  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




