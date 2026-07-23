import mongoose from "mongoose";

const candidateProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bio: { type: String, default: "" },
    github: { type: String, default: "" },
    linkedIn: { type: String, default: "" },
    company: { type: String, default: "" },
    lastSessionDate: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    resumeParsed: {
      skills: { type: [String], default: [] },
      experienceYears: { type: Number, default: 0 },
      level: { type: String, default: "" },
      techStack: { type: [String], default: [] },
      projects: { type: [String], default: [] },
    },
    stats: {
      totalSessions: { type: Number, default: 0 },
      avgScore: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
    },
    xpPoints: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    badges: {
      type: [
        {
          name: String,
          icon: String,
          earnedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    skillScores: {
      type: Map,
      of: Number,
      default: {},
    },
    activityCalendar: {
      type: [
        {
          date: String,
          count: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("CandidateProfile", candidateProfileSchema);
