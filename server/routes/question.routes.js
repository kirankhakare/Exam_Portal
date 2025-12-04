import express from "express";
import { getAllQuestions, updateQuestion, deleteQuestion } from "../controllers/question.controller.js";
import { bulkDeleteQuestions } from "../controllers/question.controller.js";

const router = express.Router();

router.get("/exam-questions/:examId", getAllQuestions);
router.patch("/update-question/:questionId", updateQuestion);
router.delete("/delete-question/:questionId", deleteQuestion);
router.post("/bulk-delete", bulkDeleteQuestions);

export default router;
