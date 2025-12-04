import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isActive: { type: Boolean, default: true },

  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],

  // NEW FIELDS
  duration: { type: Number, default: 60 }, // minutes
  availableFrom: { type: Date, default: null },
  availableTo: { type: Date, default: null },

  marksCorrect: { type: Number, default: 1 },
  marksWrong: { type: Number, default: 0 },
  marksNotAttempted: { type: Number, default: 0 },
});

export default mongoose.model("Exam", examSchema);
