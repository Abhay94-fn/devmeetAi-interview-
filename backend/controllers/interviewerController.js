import InterviewerProfile from "../models/InterviewerProfile.js";
import CandidateProfile from "../models/CandidateProfile.js";
import Session from "../models/Session.js";
import User from "../models/User.js";
import Report from "../models/Report.js";
import Question from "../models/Question.js";
import * as geminiService from "../services/geminiService.js";
import { generateSessionCode } from "../utils/sessionCode.js";
import { createMeetingRoom, createMeetingToken } from "../services/dailyService.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalCount = await Session.countDocuments({ interviewerId: req.user._id });
    const completedCount = await Session.countDocuments({ interviewerId: req.user._id, status: "completed" });
    const scheduledCount = await Session.countDocuments({ interviewerId: req.user._id, status: "scheduled" });
    const liveCount = await Session.countDocuments({ interviewerId: req.user._id, status: "live" });

    const upcomingSessions = await Session.find({
      interviewerId: req.user._id,
      status: { $in: ["scheduled", "waiting", "live", "in_progress"] }
    })
      .populate("candidateId", "name email avatar")
      .sort({ scheduledFor: 1 });

    const sessionsConducted = await Session.find({ interviewerId: req.user._id, status: "completed" }).select("_id");
    const sessionIds = sessionsConducted.map((s) => s._id);

    let avgRatingGiven = 0;
    if (sessionIds.length > 0) {
      const reports = await Report.find({ sessionId: { $in: sessionIds } });
      if (reports.length > 0) {
        const sum = reports.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
        avgRatingGiven = Math.round(sum / reports.length);
      }
    }

    await InterviewerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { "stats.totalConducted": completedCount, "stats.avgRatingGiven": avgRatingGiven } },
      { upsert: true }
    );

    res.json({
      totalConducted: completedCount,
      scheduledCount,
      liveCount,
      totalCount,
      avgRatingGiven,
      upcomingSessions,
    });
  } catch (err) {
    console.error("Get interviewer stats error:", err.message);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
};

export const getAllCandidates = async (req, res) => {
  const { search, topic, minScore, maxScore } = req.query;

  try {
    const sessions = await Session.find({ interviewerId: req.user._id });
    const candidateIds = [...new Set(sessions.map((s) => s.candidateId?.toString()).filter(Boolean))];

    if (candidateIds.length === 0) {
      return res.json([]);
    }

    const filter = { userId: { $in: candidateIds } };
    let profiles = await CandidateProfile.find(filter).populate("userId", "name email avatar");

    if (search) {
      profiles = profiles.filter((p) => 
        p.userId?.name?.toLowerCase().includes(search.toLowerCase()) || 
        p.userId?.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (topic) {
      profiles = profiles.filter((p) => {
        if (!p.skillScores) return false;
        const score = p.skillScores.get(topic);
        return score !== undefined;
      });
    }

    if (minScore) {
      profiles = profiles.filter((p) => (p.stats?.avgScore || 0) >= Number(minScore));
    }

    if (maxScore) {
      profiles = profiles.filter((p) => (p.stats?.avgScore || 0) <= Number(maxScore));
    }

    const candidateList = profiles.map((p) => ({
      _id: p.userId?._id,
      name: p.userId?.name || "Developer",
      email: p.userId?.email || "",
      avatar: p.userId?.avatar || "",
      avgScore: p.stats?.avgScore || 0,
      totalSessions: p.stats?.totalSessions || 0,
      xpPoints: p.xpPoints || 0,
      streak: p.stats?.currentStreak || 0,
      badges: p.badges || [],
      skillScores: p.skillScores || {}
    }));

    res.json(candidateList);
  } catch (err) {
    console.error("Get all candidates error:", err.message);
    res.status(500).json({ message: "Failed to fetch candidates directory" });
  }
};

export const scheduleInterview = async (req, res) => {
  const { candidateEmail, topic, difficulty, language, scheduledAt } = req.body;

  try {
    const candidate = await User.findOne({ email: candidateEmail, role: "candidate" });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found. They must register first." });
    }

    const sessionCode = await generateSessionCode();

    const candidateProfile = await CandidateProfile.findOne({ userId: candidate._id });
    const resumeParsed = candidateProfile?.resumeParsed || {};
    const tailored = await geminiService.generateTailoredQuestion(topic, difficulty, resumeParsed);

    const question = {
      title: tailored.title || `Collaborative ${topic} Session`,
      statement: tailored.statement || `Design an algorithm to resolve a ${topic} challenge.`,
      starterCode: tailored.starterCode || {
        javascript: "function solve() {\n  // Write code\n}",
        python: "def solve():\n    pass"
      },
      hints: tailored.hints || [],
      expectedComplexity: tailored.expectedComplexity || { time: "O(N)", space: "O(1)" }
    };

    const room = await createMeetingRoom(sessionCode);

    const session = await Session.create({
      sessionCode,
      type: "live_interview",
      candidateId: candidate._id,
      interviewerId: req.user._id,
      status: "scheduled",
      topic,
      difficulty,
      language: language || "javascript",
      question,
      scheduledFor: scheduledAt ? new Date(scheduledAt) : new Date(),
      meetingUrl: room.url,
      meetingName: room.name,
    });

    res.status(201).json(session);
  } catch (err) {
    console.error("Schedule interview error:", err.message);
    res.status(500).json({ message: "Failed to schedule live mock interview" });
  }
};

export const joinSession = async (req, res) => {
  const { sessionCode } = req.params;

  try {
    const session = await Session.findOne({ sessionCode });
    if (!session) {
      return res.status(404).json({ message: "Interview session code not found" });
    }

    session.interviewerId = req.user._id;
    session.status = "live";
    session.startedAt = new Date();
    await session.save();

    res.json(session);
  } catch (err) {
    console.error("Join session error:", err.message);
    res.status(500).json({ message: "Failed to join live sandbox room" });
  }
};

export const evaluateCandidate = async (req, res) => {
  const { id: sessionId } = req.params;
  const { scores, notes, recommendation } = req.body;

  try {
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.interviewerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to submit evaluation for this session" });
    }

    session.status = "completed";
    session.endedAt = new Date();
    session.interviewerNotes = `${notes}\n\nRecommendation: ${recommendation || "Neutral"}`;
    await session.save();

    const scoreValues = Object.values(scores || {});
    const overallScore = scoreValues.length > 0 
      ? Math.round(scoreValues.reduce((acc, curr) => acc + Number(curr), 0) / scoreValues.length)
      : 50;

    let report = await Report.findOne({ sessionId });
    if (!report) {
      report = new Report({
        sessionId,
        candidateId: session.candidateId,
      });
    }

    report.overallScore = overallScore;
    report.breakdown = {
      problemSolving: scores?.problemSolving !== undefined ? Number(scores.problemSolving) : 50,
      codeQuality: scores?.codeQuality !== undefined ? Number(scores.codeQuality) : 50,
      timeComplexity: scores?.timeComplexity !== undefined ? Number(scores.timeComplexity) : 50,
      spaceComplexity: scores?.spaceComplexity !== undefined ? Number(scores.spaceComplexity) : 50,
      communication: scores?.communication !== undefined ? Number(scores.communication) : 50,
      edgeCases: scores?.edgeCases !== undefined ? Number(scores.edgeCases) : 50,
    };
    report.strengths = ["Cooperative logic flow"];
    report.weaknesses = ["Could speed up basic structures selection"];
    report.tips = ["Keep practicing daily mock rounds."];
    report.estimatedLevel = overallScore >= 80 ? "Senior" : (overallScore >= 60 ? "Mid-Level" : "Junior");
    report.companyFitMap = {
      faang: Math.round(overallScore * 0.9),
      startup: Math.min(100, Math.round(overallScore * 1.1)),
      enterprise: overallScore,
    };
    report.studyResources = ["LeetCode Algorithms", "System Design Primer"];
    
    await report.save();

    // Update candidate profile stats
    const profile = await CandidateProfile.findOne({ userId: session.candidateId });
    if (profile) {
      profile.stats.totalSessions += 1;
      profile.stats.avgScore = Math.round(
        ((profile.stats.avgScore * (profile.stats.totalSessions - 1)) + overallScore) / profile.stats.totalSessions
      );
      if (session.topic) {
        if (!profile.skillScores) profile.skillScores = new Map();
        profile.skillScores.set(session.topic, overallScore);
      }
      await profile.save();
    }

    res.json({ success: true, report });
  } catch (err) {
    console.error("Evaluate candidate error:", err.message);
    res.status(500).json({ message: "Failed to submit evaluation feedback" });
  }
};

export const getCustomQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ createdBy: req.user._id });
    res.json(questions);
  } catch (err) {
    console.error("Get custom questions error:", err.message);
    res.status(500).json({ message: "Failed to fetch custom question list" });
  }
};

export const createCustomQuestion = async (req, res) => {
  const { title, statement, difficulty, topic, examples, constraints, hints, starterCode } = req.body;

  try {
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    
    const question = await Question.create({
      title,
      slug,
      statement,
      difficulty: difficulty.toLowerCase(),
      topic,
      examples: examples || [],
      constraints: constraints || [],
      hints: hints || [],
      starterCode: starterCode || {
        javascript: "function solve() {\n  // Write code\n}"
      },
      isPublic: false,
      createdBy: req.user._id,
    });

    res.status(201).json(question);
  } catch (err) {
    console.error("Create custom question error:", err.message);
    res.status(500).json({ message: "Failed to create custom question challenge" });
  }
};

export const updateCustomQuestion = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const question = await Question.findOneAndUpdate(
      { _id: id, createdBy: req.user._id },
      { $set: updates },
      { new: true }
    );
    if (!question) return res.status(404).json({ message: "Question not found or access denied" });
    res.json(question);
  } catch (err) {
    console.error("Update custom question error:", err.message);
    res.status(500).json({ message: "Failed to update custom question" });
  }
};

export const deleteCustomQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const question = await Question.findOneAndDelete({ _id: id, createdBy: req.user._id });
    if (!question) return res.status(404).json({ message: "Question not found or access denied" });
    res.json({ success: true });
  } catch (err) {
    console.error("Delete custom question error:", err.message);
    res.status(500).json({ message: "Failed to delete custom question" });
  }
};

export const getMeetingToken = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const isOwner = session.interviewerId?.toString() === req.user._id.toString();
    const token = await createMeetingToken(session.meetingName, req.user._id, isOwner);

    res.json({
      meetingUrl: session.meetingUrl,
      meetingName: session.meetingName,
      token,
    });
  } catch (err) {
    console.error("Get meeting token error:", err.message);
    res.status(500).json({ message: "Failed to generate meeting credentials" });
  }
};
