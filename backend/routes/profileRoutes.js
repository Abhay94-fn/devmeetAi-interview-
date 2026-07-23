import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  getMyProfile,
  updateProfile,
  getPublicProfile,
  updateStats,
  uploadResume,
} from "../controllers/profileController.js";

const router = Router();

// Use memoryStorage so req.file.buffer is available for Cloudinary upload and pdf-parse
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

router.use(protect);

router.get("/me", requireRole("candidate", "admin"), getMyProfile);
router.patch("/me", requireRole("candidate", "admin"), updateProfile);
router.post("/stats", requireRole("candidate", "admin"), updateStats);
router.post("/resume", requireRole("candidate", "admin"), upload.single("resume"), uploadResume);
router.get("/:userId", getPublicProfile);

export default router;
