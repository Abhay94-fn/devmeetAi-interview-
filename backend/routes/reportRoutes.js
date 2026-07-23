import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validate.js";
import {
  generateReport,
  getMyReports,
  getReportBySession,
} from "../controllers/reportController.js";

const router = Router();

router.use(protect);

router.post("/generate", generateReport);
router.get("/my", getMyReports);
router.get("/:sessionId", validateObjectId("sessionId"), getReportBySession);

export default router;
