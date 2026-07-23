import CandidateProfile from "../models/CandidateProfile.js";
import User from "../models/User.js";
import { parseResumePDF } from "../services/geminiService.js";

/**
 * Fetch candidate profile & details
 */
export const getProfile = async (req, res) => {
  try {
    let profile = await CandidateProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = await CandidateProfile.create({ userId: req.user.id });
    }

    const user = await User.findById(req.user.id).select("name email avatar");

    res.json({
      profile,
      user,
    });
  } catch (err) {
    console.error("Get candidate profile error:", err.message);
    res.status(500).json({ message: "Failed to fetch candidate profile" });
  }
};

/**
 * Update candidate profile
 */
export const updateProfile = async (req, res) => {
  const { resumeUrl, resumeParsed, skillScores, activityCalendar } = req.body;

  try {
    let profile = await CandidateProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new CandidateProfile({ userId: req.user.id });
    }

    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl;
    if (resumeParsed !== undefined) profile.resumeParsed = resumeParsed;
    if (skillScores !== undefined) profile.skillScores = skillScores;
    if (activityCalendar !== undefined) profile.activityCalendar = activityCalendar;

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error("Update candidate profile error:", err.message);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/**
 * Parse resume using Gemini AI
 */
export const parseResume = async (req, res) => {
  try {
    let profile = await CandidateProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = await CandidateProfile.create({ userId: req.user.id });
    }

    const pdfBuffer = req.file ? req.file.buffer : null;
    const parsed = await parseResumePDF(pdfBuffer);

    profile.resumeParsed = parsed;
    
    // Map skills to skill scores (default 75)
    const skillScores = {};
    if (parsed.skills && parsed.skills.length > 0) {
      parsed.skills.slice(0, 5).forEach((skill) => {
        skillScores[skill] = 75;
      });
    } else {
      skillScores["JavaScript"] = 75;
      skillScores["React"] = 70;
    }
    profile.skillScores = skillScores;

    // Add initial activity
    const today = new Date().toISOString().split("T")[0];
    profile.activityCalendar = [{ date: today, count: 1 }];

    // Earn an initial badge
    if (profile.badges.length === 0) {
      profile.badges.push({
        name: "Profile Complete",
        icon: "UserCheck",
      });
      profile.xpPoints += 100;
    }

    await profile.save();
    res.json({ message: "Resume parsed successfully", profile });
  } catch (err) {
    console.error("Resume parsing error:", err.message);
    res.status(500).json({ message: "Failed to parse resume" });
  }
};
