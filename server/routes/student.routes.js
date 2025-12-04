import express from "express";
import { submitExam, getLatestResult, getQuestions, startExam, getTimeLeft } from "../controllers/student.controller.js";
import { generateResultPdf } from "../controllers/pdf.controller.js";

const router = express.Router();

// start exam (creates session)
router.post("/start", startExam);

// get remaining time
router.get("/time-left", getTimeLeft);

// submit exam
router.post("/submit", submitExam);

// router.get("/result-pdf/:resultId", authMiddleware, generateResultPdf);
router.get("/result-pdf/:resultId", generateResultPdf);

// get questions
router.get("/get-questions", getQuestions);

// get latest result
router.get("/latest-result", getLatestResult);


export default router;
