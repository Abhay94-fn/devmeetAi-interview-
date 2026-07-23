import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getLeaderboard,
  getMyRank,
} from "../controllers/leaderboardController.js";

const router = Router();

router.get("/", protect, getLeaderboard);
router.get("/my-rank", protect, getMyRank);

export default router;
