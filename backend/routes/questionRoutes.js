import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  getQuestions,
  getQuestionById,
  generateAIQuestion,
  seedQuestions,
  importLeetCodeQuestion,
} from "../controllers/questionController.js";

const router = Router();

router.get("/", getQuestions);
router.get("/seed", seedQuestions);
router.post("/seed", seedQuestions);
router.post("/import-leetcode", protect, importLeetCodeQuestion);
router.get("/:id", getQuestionById);
router.post("/generate", protect, generateAIQuestion);

export default router;
