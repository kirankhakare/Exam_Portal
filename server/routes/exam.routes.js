import express from "express";
import { createExam, getAllExams, toggleExam } from "../controllers/exam.controller.js";

const router = express.Router();

router.post("/create", createExam);
router.get("/", getAllExams);
router.get("/all", getAllExams);
router.patch("/toggle-exam/:id", toggleExam);


export default router;
