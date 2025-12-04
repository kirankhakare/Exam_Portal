// backend/models/Result.js
import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },

  // Store question + options snapshot at exam time
  question: { type: String },

  optionA: { type: String },
  optionB: { type: String },
  optionC: { type: String },
  optionD: { type: String },

  // Key: "A" | "B" | "C" | "D" | "Not Attempted"
  selectedAnswer: {
    type: String,
    default: "Not Attempted",
  },

  correctAnswer: {
    type: String,
    default: null,
  },

  // Human readable texts
  selectedAnswerText: { type: String },
  correctAnswerText: { type: String },

  isCorrect: {
    type: Boolean,
    default: false,
  },

  // Per-question marks
  marksGiven: {
    type: Number,
    default: 0,
  },
});

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },

    // NEW: summary counts
    attempted: {
      type: Number,
      default: 0,
    },

    notAttempted: {
      type: Number,
      default: 0,
    },

    // NEW: manual_submit | timer_expired | fullscreen_exit | tab_switch_or_cheat
    submissionType: {
      type: String,
      default: "manual_submit",
    },

    // All per-question details
    answers: [answerSchema],

    // Session tracking
    startTime: {
      type: Date,
    },

    endTime: {
      type: Date,
    },

    submitted: {
      type: Boolean,
      default: false,
    },

    submittedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Result", resultSchema);
