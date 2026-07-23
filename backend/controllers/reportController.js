import Session from "../models/Session.js";
import Report from "../models/Report.js";
import CandidateProfile from "../models/CandidateProfile.js";
import * as geminiService from "../services/geminiService.js";
import { getIO } from "../socket/store.js";

export const generateReport = async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const userIdStr = req.user._id.toString();
    if (session.candidateId?.toString() !== userIdStr && session.interviewerId?.toString() !== userIdStr) {
      return res.status(403).json({ message: "Access denied to this session" });
    }

    // Check if report already exists
    const existing = await Report.findOne({ sessionId });
    if (existing) {
      return res.json(existing);
    }

    // Set status to generating
    session.status = "generating_report";
    await session.save();

    // Immediately return processing status to prevent HTTP timeout
    res.json({ status: "processing", sessionId });

    // Generate in background
    process.nextTick(async () => {
      try {
        const generated = await geminiService.generatePostInterviewReport(session);

        const integrityScore = Math.max(0, 100 - (session.integrityFlags?.length || 0) * 10);

        const report = await Report.create({
          sessionId,
          candidateId: session.candidateId,
          overallScore: generated.overallScore ?? 50,
          breakdown: {
            problemSolving: generated.breakdown?.problemSolving ?? 50,
            codeQuality: generated.breakdown?.codeQuality ?? 50,
            timeComplexity: generated.breakdown?.timeComplexity ?? 50,
            spaceComplexity: generated.breakdown?.spaceComplexity ?? 50,
            communication: generated.breakdown?.communication ?? 50,
            edgeCases: generated.breakdown?.edgeCases ?? 50,
          },
          strengths: generated.strengths || [],
          weaknesses: generated.weaknesses || [],
          tips: generated.tips || [],
          estimatedLevel: generated.estimatedLevel || "Mid-Level",
          companyFitMap: {
            faang: generated.companyFitMap?.faang ?? 50,
            startup: generated.companyFitMap?.startup ?? 50,
            enterprise: generated.companyFitMap?.enterprise ?? 50,
          },
          studyResources: generated.studyResources || [],
          integrityScore,
        });

        // Update session report link
        session.aiReport = report._id;
        session.status = "completed";
        await session.save();

        // Update candidate stats profile
        const score = report.overallScore;
        const profile = await CandidateProfile.findOne({ userId: session.candidateId });
        if (profile) {
          const total = profile.stats.totalSessions + 1;
          const oldAvg = profile.stats.avgScore || 0;
          profile.stats.totalSessions = total;
          profile.stats.avgScore = Math.round(((oldAvg * (total - 1)) + score) / total);

          if (session.topic) {
            if (!profile.skillScores) profile.skillScores = new Map();
            profile.skillScores.set(session.topic, score);
          }

          // Streak calculation
          const todayStr = new Date().toISOString().split("T")[0];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          const lastDate = profile.lastSessionDate;
          profile.lastSessionDate = todayStr;

          if (lastDate === yesterdayStr) {
            profile.stats.currentStreak += 1;
          } else if (lastDate !== todayStr) {
            profile.stats.currentStreak = 1;
          }

          if (profile.stats.currentStreak > profile.stats.longestStreak) {
            profile.stats.longestStreak = profile.stats.currentStreak;
          }

          // XP accumulation
          profile.xpPoints += 100 + Math.floor(score / 10) * 5 + profile.stats.currentStreak * 2;

          // Badges check
          const badges = profile.badges || [];
          const addBadgeIfNew = (name, icon) => {
            if (!badges.some((b) => b.name === name)) {
              badges.push({ name, icon, earnedAt: new Date() });
            }
          };
          addBadgeIfNew("First Mock Interview", "🎓");
          if (profile.stats.currentStreak >= 7) addBadgeIfNew("Weekly Warrior", "🔥");
          if (profile.stats.currentStreak >= 30) addBadgeIfNew("Month Strong", "🏆");
          if (score === 100) addBadgeIfNew("Absolute Perfection", "🌟");
          if (total >= 50) addBadgeIfNew("DevMeet Veteran", "👑");
          profile.badges = badges;

          // Activity Calendar
          const calendar = profile.activityCalendar || [];
          const calIndex = calendar.findIndex((c) => c.date === todayStr);
          if (calIndex !== -1) {
            calendar[calIndex].count += 1;
          } else {
            calendar.push({ date: todayStr, count: 1 });
          }
          profile.activityCalendar = calendar;

          await profile.save();

          // Update this candidate's rank efficiently with a single count query
          const betterCount = await CandidateProfile.countDocuments({ xpPoints: { $gt: profile.xpPoints } });
          profile.rank = betterCount + 1;
          await profile.save();
        }

        // Notify front-end that report is compiled
        const io = getIO();
        if (io) {
          io.to(`report_${sessionId}`).emit("report:ready", { reportId: report._id });
        }
      } catch (bgErr) {
        console.error("Background report generation failed:", bgErr.message);
        session.status = "completed"; // Revert status so candidate is not stuck
        await session.save();
      }
    });
  } catch (err) {
    console.error("Report controller generate error:", err.message);
    res.status(500).json({ message: "Failed to schedule report generation" });
  }
};

export const getReportBySession = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const report = await Report.findOne({ sessionId });
    if (!report) {
      const session = await Session.findById(sessionId);
      if (session && session.status === "generating_report") {
        return res.json({ status: "processing", sessionId });
      }
      return res.status(404).json({ message: "Report scorecard not compiled yet" });
    }

    const userIdStr = req.user._id.toString();
    const canAccess =
      report.candidateId?.toString() === userIdStr ||
      req.user.role === "interviewer" ||
      req.user.role === "admin";

    if (!canAccess) {
      return res.status(403).json({ message: "Access denied to this report" });
    }

    res.json(report);
  } catch (err) {
    console.error("Get report by session error:", err.message);
    res.status(500).json({ message: "Failed to retrieve report scorecard" });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ candidateId: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error("Get my reports error:", err.message);
    res.status(500).json({ message: "Failed to load report cards logs" });
  }
};
