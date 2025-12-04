import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    phone: { type: String },     // ⭐ ADD THIS LINE

    role: { type: String, default: "student" },
    isActive: { type: Boolean, default: true },

    assignedExam: {
      type: String,
      default: null
    },

    hasSubmitted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
