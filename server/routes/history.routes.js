import express from "express";
import { getAllResults } from "../controllers/history.controller.js";

const router = express.Router();

router.get("/all-results", getAllResults);

export default router;
