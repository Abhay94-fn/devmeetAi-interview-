import { Router } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { handleValidation } from "../middleware/validate.js";
import {
  getDashboardStats,
  getAllCandidates,
  scheduleInterview,
  joinSession,
  evaluateCandidate,
  getCustomQuestions,
  createCustomQuestion,
  updateCustomQuestion,
  deleteCustomQuestion,
  getMeetingToken,
} from "../controllers/interviewerController.js";

const router = Router();

router.use(protect);
router.use(requireRole("interviewer", "admin"));

router.get("/dashboard", getDashboardStats);
router.get("/candidates", getAllCandidates);
router.post("/schedule", scheduleInterview);
router.post("/join/:sessionCode", joinSession);
router.get("/meeting-token/:sessionId", getMeetingToken);

router.post(
  "/evaluate/:id",
  [
    body("scores").isObject().withMessage("scores must be an object"),
    body("scores.problemSolving").isInt({ min: 0, max: 100 }).withMessage("problemSolving must be 0–100"),
    body("scores.codeQuality").isInt({ min: 0, max: 100 }).withMessage("codeQuality must be 0–100"),
    body("scores.timeComplexity").isInt({ min: 0, max: 100 }).withMessage("timeComplexity must be 0–100"),
    body("scores.spaceComplexity").isInt({ min: 0, max: 100 }).withMessage("spaceComplexity must be 0–100"),
    body("scores.communication").isInt({ min: 0, max: 100 }).withMessage("communication must be 0–100"),
    body("scores.edgeCases").isInt({ min: 0, max: 100 }).withMessage("edgeCases must be 0–100"),
    body("recommendation")
      .optional()
      .isIn(["strong_yes", "yes", "neutral", "no", "strong_no", ""])
      .withMessage("Invalid recommendation value"),
    body("notes").optional().isString().trim().isLength({ max: 2000 }).withMessage("Notes max 2000 characters"),
  ],
  handleValidation,
  evaluateCandidate
);

router.get("/questions", getCustomQuestions);
router.post("/questions", createCustomQuestion);
router.put("/questions/:id", updateCustomQuestion);
router.delete("/questions/:id", deleteCustomQuestion);

export default router;
