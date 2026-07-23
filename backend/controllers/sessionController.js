import Session from "../models/Session.js";
import Question from "../models/Question.js";
import CandidateProfile from "../models/CandidateProfile.js";
import * as geminiService from "../services/geminiService.js";
import { generateSessionCode } from "../utils/sessionCode.js";
import { executeCode as executeJudge0 } from "../services/judgeService.js";
import { createMeetingRoom, deleteMeetingRoom } from "../services/dailyService.js";

export const createSession = async (req, res) => {
  const { topic, difficulty, language, questionId, type = "ai_solo" } = req.body;

  try {
    // ── Tier Constraints Enforcement ───────────────────────────────────
    const userTier = req.user.tier || "free";

    // 1. Free Starter Limits
    if (userTier === "free") {
      // Language limit: JavaScript only
      if (language && language !== "javascript") {
        return res.status(403).json({
          message: "Multiple programming languages are only available in the Pro Developer plan. JavaScript is supported in the Free Starter plan."
        });
      }
    }

    // 2. Recruiter Enterprise Limits (Peer and Live assessment video features)
    if ((type === "peer" || type === "live_interview") && userTier !== "enterprise") {
      return res.status(403).json({
        message: "Live video interviews and peer sessions are exclusive features of the Recruiter Enterprise plan. Contact sales to upgrade."
      });
    }
    const sessionCode = await generateSessionCode();
    let question = null;

    if (questionId) {
      question = await Question.findById(questionId);
    }

    if (!question) {
      const profile = await CandidateProfile.findOne({ userId: req.user._id });
      const resumeParsed = profile?.resumeParsed || {};
      const tailored = await geminiService.generateTailoredQuestion(topic, difficulty, resumeParsed);
      
      question = {
        title: tailored.title || `Optimal ${topic} Resolution`,
        statement: tailored.statement || `Design an algorithm that solves a ${topic} challenge.`,
        starterCode: tailored.starterCode || {
          javascript: "function solve() {\n  // Write code\n}",
          python: "def solve():\n    pass",
          java: "class Solution {\n  public static void main(String[] args) {\n    // Write code\n  }\n}",
          cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  // Write code\n  return 0;\n}",
        },
        hints: tailored.hints || [],
        expectedComplexity: tailored.expectedComplexity || { time: "O(N)", space: "O(1)" },
      };
    }

    let meetingUrl = "";
    let meetingName = "";
    if (type === "peer" || type === "live_interview") {
      const room = await createMeetingRoom(sessionCode);
      meetingUrl = room.url;
      meetingName = room.name;
    }

    const session = await Session.create({
      sessionCode,
      type,
      candidateId: req.user._id,
      status: "waiting",
      topic,
      difficulty,
      language: language || "javascript",
      question,
      meetingUrl,
      meetingName,
    });

    res.status(201).json(session);
  } catch (err) {
    console.error("Create session error:", err.message);
    res.status(500).json({ message: "Failed to initialize interview sandbox" });
  }
};

export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ candidateId: req.user._id })
      .populate("aiReport")
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(sessions);
  } catch (err) {
    console.error("Get my sessions error:", err.message);
    res.status(500).json({ message: "Failed to fetch session logs" });
  }
};

export const getSessionById = async (req, res) => {
  const { id } = req.params;

  try {
    const session = await Session.findById(id).populate("aiReport");
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const userIdStr = req.user._id.toString();
    const canAccess =
      !session.candidateId ||
      session.candidateId?.toString() === userIdStr ||
      session.interviewerId?.toString() === userIdStr ||
      req.user.role === "candidate" ||
      req.user.role === "interviewer" ||
      req.user.role === "admin";

    if (!canAccess) {
      return res.status(403).json({ message: "Access denied to this sandbox" });
    }

    res.json(session);
  } catch (err) {
    console.error("Get session error:", err.message);
    res.status(500).json({ message: "Failed to load session details" });
  }
};

export const endSession = async (req, res) => {
  const { id } = req.params;

  try {
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.status = "completed";
    session.endedAt = new Date();
    if (session.startedAt) {
      session.duration = Math.floor((session.endedAt - session.startedAt) / 1000);
    }
    await session.save();

    if (session.meetingName) {
      deleteMeetingRoom(session.meetingName).catch(() => {});
    }

    res.json(session);
  } catch (err) {
    console.error("End session error:", err.message);
    res.status(500).json({ message: "Failed to complete session" });
  }
};

export const saveCodeSnapshot = async (req, res) => {
  const { id } = req.params;
  const { code, language } = req.body;

  try {
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.codeHistory = [...session.codeHistory.slice(-49), {
      code,
      language: language || session.language,
      timestamp: new Date()
    }];

    await session.save();
    res.json({ saved: true });
  } catch (err) {
    console.error("Save snapshot error:", err.message);
    res.status(500).json({ message: "Failed to save code progression" });
  }
};

export const getHint = async (req, res) => {
  const { id } = req.params;
  const { level = 1, code = "" } = req.query;

  try {
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const questionStr = session.question?.statement || "";
    const hint = await geminiService.getHint(questionStr, code, level);

    res.json({ hint });
  } catch (err) {
    console.error("Get hint error:", err.message);
    res.status(500).json({ message: "Failed to fetch hint suggestions" });
  }
};

export const runCode = async (req, res) => {
  const { id } = req.params;
  const { code, language, stdin = "" } = req.body;

  try {
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const result = await executeJudge0(code, language || session.language, stdin);

    // If there is an error, generate an AI explanation of the error and location
    if (result.stderr) {
      try {
        const questionText = session.question?.statement || "";
        const aiExplanation = await geminiService.explainCodeError(
          code,
          language || session.language,
          result.stderr,
          questionText
        );
        result.aiExplanation = aiExplanation;
      } catch (err) {
        console.warn("AI error explanation skipped:", err.message);
      }
    }

    // Save final code in history
    session.codeHistory = [...session.codeHistory.slice(-49), {
      code,
      language: language || session.language,
      timestamp: new Date()
    }];
    await session.save();

    res.json(result);
  } catch (err) {
    console.error("Run code error:", err.message);
    res.status(500).json({ message: "Failed to execute code" });
  }
};

export const startSession = async (req, res) => {
  const { id } = req.params;

  try {
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.status = "in_progress";
    session.startedAt = new Date();
    await session.save();

    res.json(session);
  } catch (err) {
    console.error("Start session error:", err.message);
    res.status(500).json({ message: "Failed to start session" });
  }
};
