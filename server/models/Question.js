import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true     // ⭐ MUST HAVE
  },

  question: { type: String, required: true },
  optionA: { type: String, required: true },
  optionB: { type: String, required: true },
  optionC: { type: String, required: true },
  optionD: { type: String, required: true },

  // Should be A/B/C/D (not “Option A”)
  correctAnswer: { type: String, required: true }
});

export default mongoose.model("Question", questionSchema);
