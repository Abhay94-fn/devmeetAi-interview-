import User from "../models/User.js";
import CandidateProfile from "../models/CandidateProfile.js";
import { uploadResume as uploadToCloudinary } from "../services/cloudinaryService.js";
import * as geminiService from "../services/geminiService.js";

export const getMyProfile = async (req, res) => {
  try {
    let profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await CandidateProfile.create({ userId: req.user._id });
    }
    res.json({ profile, user: req.user });
  } catch (err) {
    console.error("Get my profile error:", err.message);
    res.status(500).json({ message: "Failed to load candidate profile" });
  }
};

export const updateProfile = async (req, res) => {
  const { name, bio, github, linkedIn, company, tier } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) {
      user.name = name;
    }
    if (tier) {
      user.tier = tier;
    }
    if (name || tier) {
      await user.save();
    }

    let profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ userId: req.user._id });
    }

    profile.bio = bio !== undefined ? bio : profile.bio;
    profile.github = github !== undefined ? github : profile.github;
    profile.linkedIn = linkedIn !== undefined ? linkedIn : profile.linkedIn;
    profile.company = company !== undefined ? company : profile.company;

    await profile.save();
    res.json({ profile, user: { ...req.user, name: user.name, tier: user.tier } });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ message: "Failed to update profile parameters" });
  }
};

export const getPublicProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select("name email role avatar");
    if (!user) return res.status(404).json({ message: "Candidate not found" });

    const profile = await CandidateProfile.findOne({ userId });
    res.json({ profile, user });
  } catch (err) {
    console.error("Get public profile error:", err.message);
    res.status(500).json({ message: "Failed to fetch public card" });
  }
};

export const updateStats = async (req, res) => {
  const { score, topic } = req.body;

  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const total = profile.stats.totalSessions + 1;
    const oldAvg = profile.stats.avgScore || 0;
    profile.stats.totalSessions = total;
    profile.stats.avgScore = Math.round(((oldAvg * (total - 1)) + Number(score)) / total);

    // Topic skill map update
    if (topic) {
      if (!profile.skillScores) profile.skillScores = new Map();
      profile.skillScores.set(topic, Number(score));
    }

    // Streak logic
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

    // XP calculation
    const baseXP = 100;
    const scoreBonus = Math.floor(Number(score) / 10) * 5;
    const streakBonus = profile.stats.currentStreak * 2;
    profile.xpPoints += baseXP + scoreBonus + streakBonus;

    // Badges checks
    const badges = profile.badges || [];
    const addBadgeIfNew = (name, icon) => {
      if (!badges.some((b) => b.name === name)) {
        badges.push({ name, icon, earnedAt: new Date() });
      }
    };

    addBadgeIfNew("First Mock Interview", "🎓");

    if (profile.stats.currentStreak >= 7) {
      addBadgeIfNew("Weekly Warrior", "🔥");
    }
    if (profile.stats.currentStreak >= 30) {
      addBadgeIfNew("Month Strong", "🏆");
    }
    if (Number(score) === 100) {
      addBadgeIfNew("Absolute Perfection", "🌟");
    }
    if (total >= 50) {
      addBadgeIfNew("DevMeet Veteran", "👑");
    }

    profile.badges = badges;

    // Activity Calendar
    const calendar = profile.activityCalendar || [];
    const index = calendar.findIndex((c) => c.date === todayStr);
    if (index !== -1) {
      calendar[index].count += 1;
    } else {
      calendar.push({ date: todayStr, count: 1 });
    }
    profile.activityCalendar = calendar;

    await profile.save();

    // Update this candidate's rank efficiently with a single count query
    const betterCount = await CandidateProfile.countDocuments({ xpPoints: { $gt: profile.xpPoints } });
    profile.rank = betterCount + 1;
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error("Update profile stats error:", err.message);
    res.status(500).json({ message: "Failed to recalculate profiles" });
  }
};

export const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Resume file is required" });
  }

  try {
    let resumeUrl = "";
    try {
      const isConfigured = process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_CLOUD_NAME.startsWith("your_");
      if (isConfigured) {
        const uploadRes = await uploadToCloudinary(req.file.buffer, req.user._id);
        resumeUrl = uploadRes.secure_url;
      } else {
        console.warn("Cloudinary not configured. Falling back to inline base64 representation.");
        resumeUrl = `data:application/pdf;base64,${req.file.buffer.toString("base64")}`;
      }
    } catch (uploadErr) {
      console.warn("Cloudinary upload failed, falling back to inline base64 representation:", uploadErr.message);
      resumeUrl = `data:application/pdf;base64,${req.file.buffer.toString("base64")}`;
    }

    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    profile.resumeUrl = resumeUrl;

    // Parse resume with Gemini to get skills & techStack details
    try {
      const resumeParsed = await geminiService.parseResumePDF(req.file.buffer);
      profile.resumeParsed = {
        skills: resumeParsed.skills || [],
        experienceYears: resumeParsed.experienceYears || 0,
        level: resumeParsed.level || "Intermediate",
        techStack: resumeParsed.techStack || [],
        projects: resumeParsed.projects || [],
      };
    } catch (parseErr) {
      console.warn("Resume parse failed, fallback loaded:", parseErr.message);
      profile.resumeParsed = {
        skills: ["Software Engineering"],
        experienceYears: 1,
        level: "Junior",
        techStack: [],
        projects: [],
      };
    }

    await profile.save();
    res.json({ resumeUrl: profile.resumeUrl, resumeParsed: profile.resumeParsed });
  } catch (err) {
    console.error("Upload resume error:", err.message);
    res.status(500).json({ message: "Resume uploading failed" });
  }
};
