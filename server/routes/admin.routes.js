import express from "express";
import { 
  createUser, 
  getUsers, 
  toggleUserStatus, 
  deleteUser, 
  updateUser 
} from "../controllers/admin.controller.js";
import { getSingleResult } from "../controllers/admin.controller.js";

import { 
  getAllExams, 
  createExam, 
  toggleExam ,
} from "../controllers/exam.controller.js";

import upload from "../middleware/uploadExcel.js";
import { uploadQuestions } from "../controllers/question.controller.js";
import { reassignExam } from "../controllers/admin.controller.js";
import { getDashboardStats } from "../controllers/adminDashboard.controller.js";


const router = express.Router();

// USER ROUTES
router.post("/create-user", createUser);
router.get("/users", getUsers);
router.put("/toggle-user/:id", toggleUserStatus);
router.put("/reassign-exam/:id", reassignExam);
router.delete("/user/:id", deleteUser);
router.put("/user/:id", updateUser);
router.get("/result/:studentId", getSingleResult);


// EXAM ROUTES
router.post("/create-exam", createExam);
router.get("/exams", getAllExams);
router.patch("/toggle-exam/:id", toggleExam);
router.get("/dashboard-stats", getDashboardStats);

// UPLOAD QUESTIONS
router.post("/upload-questions", upload.single("file"), uploadQuestions);

export default router;
