import express from "express";
import { login } from "../controllers/auth.controller.js";

const router = express.Router();
router.get("/student/:id", async (req, res) => {
  try {
    const student = await User.findById(req.params.id).select("-password");
    if (!student) return res.status(404).json({ message: "Not found" });

    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", login);

export default router;
