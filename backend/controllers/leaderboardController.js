import CandidateProfile from "../models/CandidateProfile.js";
import Session from "../models/Session.js";

export const getLeaderboard = async (req, res) => {
  const { type = "alltime" } = req.query;

  try {
    if (type === "weekly" || type === "monthly") {
      const days = type === "weekly" ? 7 : 30;
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      // Aggregate session metrics in timeframe grouped by candidateId
      const sessions = await Session.aggregate([
        { $match: { status: "completed", endedAt: { $gte: dateLimit } } },
        {
          $group: {
            _id: "$candidateId",
            totalSessions: { $sum: 1 },
            topic: { $first: "$topic" }
          }
        },
        { $sort: { totalSessions: -1 } },
        { $limit: 100 }
      ]);

      const candidateIds = sessions.map((s) => s._id);
      const profiles = await CandidateProfile.find({ userId: { $in: candidateIds } })
        .populate("userId", "name email avatar");

      const entries = sessions.map((s, index) => {
        const prof = profiles.find((p) => p.userId?._id?.toString() === s._id?.toString());
        return {
          rank: index + 1,
          name: prof?.userId?.name || "Developer",
          avatar: prof?.userId?.avatar || "",
          xpPoints: prof?.xpPoints || 0,
          totalSessions: s.totalSessions,
          avgScore: prof?.stats?.avgScore || 0,
        };
      });

      return res.json({ entries });
    }

    // Default 'alltime' sorting by candidate profile XP points
    const profiles = await CandidateProfile.find({})
      .populate("userId", "name email avatar")
      .sort({ xpPoints: -1 })
      .limit(100);

    const entries = profiles.map((p, index) => ({
      rank: index + 1,
      name: p.userId?.name || "Developer",
      avatar: p.userId?.avatar || "",
      xpPoints: p.xpPoints || 0,
      totalSessions: p.stats?.totalSessions || 0,
      avgScore: p.stats?.avgScore || 0,
    }));

    res.json({ entries });
  } catch (err) {
    console.error("Get leaderboard error:", err.message);
    res.status(500).json({ message: "Failed to load leaderboard standings" });
  }
};

export const getMyRank = async (req, res) => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.json({ rank: 0, xpPoints: 0, percentile: 0 });
    }

    const totalCount = await CandidateProfile.countDocuments({});
    const betterCount = await CandidateProfile.countDocuments({ xpPoints: { $gt: profile.xpPoints } });
    const rank = betterCount + 1;

    const percentile = totalCount > 1
      ? Math.round(((totalCount - rank) / totalCount) * 100)
      : 100;

    res.json({
      rank,
      xpPoints: profile.xpPoints,
      percentile,
    });
  } catch (err) {
    console.error("Get my rank error:", err.message);
    res.status(500).json({ message: "Failed to locate candidate rank" });
  }
};
