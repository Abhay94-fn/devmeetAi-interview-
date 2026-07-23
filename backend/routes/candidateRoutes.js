import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  getProfile,
  updateProfile,
  parseResume,
} from "../controllers/candidateController.js";

const router = Router();

// memoryStorage so req.file.buffer is available for pdf-parse
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

router.use(protect);
router.use(requireRole("candidate", "admin"));

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/resume/parse", upload.single("resume"), parseResume);

export default router;
