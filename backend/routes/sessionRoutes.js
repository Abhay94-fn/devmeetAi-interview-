import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validate.js";
import {
  createSession,
  getMySessions,
  getSessionById,
  endSession,
  saveCodeSnapshot,
  getHint,
  runCode,
  startSession,
} from "../controllers/sessionController.js";

const router = Router();

router.use(protect);

router.post("/create", createSession);
router.get("/my", getMySessions);
router.get("/:id", validateObjectId("id"), getSessionById);
router.patch("/:id/start", validateObjectId("id"), startSession);
router.patch("/:id/end", validateObjectId("id"), endSession);
router.post("/:id/code", validateObjectId("id"), saveCodeSnapshot);
router.get("/:id/hint", validateObjectId("id"), getHint);
router.post("/:id/run", validateObjectId("id"), runCode);

export default router;
