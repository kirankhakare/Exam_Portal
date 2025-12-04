import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import questionRoutes from "./routes/question.routes.js";
import examRoutes from "./routes/exam.routes.js";
import studentRoutes from "./routes/student.routes.js";
import historyRoutes from "./routes/history.routes.js";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", examRoutes);
app.use("/api/admin", questionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/history", historyRoutes);

// Connect database
connectDB();

app.get("/", (req, res) => {
  res.json({ message: "Backend working..." });
});

app.get("/check-db", async (req, res) => {
  const users = await import("./models/User.js").then(x => x.default.find());
  res.json({
    connected_to: mongoose.connection.name,
    total_users: users.length,
    users
  });
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
