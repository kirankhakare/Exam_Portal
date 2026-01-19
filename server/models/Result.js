import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },

  // Snapshot of question at exam time
  question: { type: String },
  optionA: { type: String },
  optionB: { type: String },
  optionC: { type: String },
  optionD: { type: String },

  // A | B | C | D | Not Attempted
  selectedAnswer: {
    type: String,
    default: "Not Attempted",
  },

  correctAnswer: {
    type: String,
    default: null,
  },

  selectedAnswerText: { type: String },
  correctAnswerText: { type: String },

  isCorrect: {
    type: Boolean,
    default: false,
  },

  // +ve / -ve / 0 marks
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

    // MARKS OBTAINED
    score: {
      type: Number,
      default: 0,
    },

    // TOTAL MARKS (IMPORTANT: not question count)
    total: {
      type: Number,
      default: 0,
    },

    // ✅ DERIVED FIELD (AUTO)
    percentage: {
      type: Number,
      default: 0,
    },

    attempted: {
      type: Number,
      default: 0,
    },

    notAttempted: {
      type: Number,
      default: 0,
    },

    submissionType: {
      type: String,
      default: "manual_submit",
    },

    answers: [answerSchema],

    startTime: Date,
    endTime: Date,

    submitted: {
      type: Boolean,
      default: false,
    },

    submittedAt: Date,
  },
  { timestamps: true }
);

/**
 * 🔥 AUTO-CALCULATE PERCENTAGE
 * Runs every time result is saved
 */
resultSchema.pre("save", function (next) {
  if (this.total > 0) {
    this.percentage =
      Math.round((this.score / this.total) * 10000) / 100;
  } else {
    this.percentage = 0;
  }
  next();
});

export default mongoose.model("Result", resultSchema);
