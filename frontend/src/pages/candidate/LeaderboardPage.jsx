import React, { useState, useEffect } from "react";
import { Trophy, Medal, Flame, Star, Award, ShieldAlert, Cpu } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("alltime"); // alltime, weekly, monthly

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const res = await api.get("/leaderboard", { params: { type } });
        setRankings(res.data.entries || []);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
        toast.error("Failed to load leaderboard rankings");
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [type]);

  const getRankBadge = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300 fill-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600 fill-amber-600" />;
    return <span className="text-xs font-mono font-bold text-[#475569]">{rank}</span>;
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none text-white">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white leading-tight mb-1">Developer Leaderboard</h2>
          <p className="text-xs text-[#94A3B8] font-medium">Review top candidates and developers ranked by mock practice XP credits.</p>
        </div>

        {/* Tab filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-white/5 border border-white/5 self-start sm:self-auto">
          {["alltime", "weekly", "monthly"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1 text-[10px] font-bold rounded-md border-0 cursor-pointer uppercase transition ${
                type === t ? "bg-[#8B5CF6] text-white" : "bg-transparent text-[#94A3B8] hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Rankings List Card */}
      <div className="glass-card p-6 border-white/5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
          <Trophy className="w-4.5 h-4.5 text-yellow-500" />
          <span>Global Rankings</span>
        </h3>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : rankings.length === 0 ? (
          <div className="py-12 text-center text-[#94A3B8] text-xs font-bold italic">
            No rankings logged yet. Start sessions to claim XP credits!
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header Labels */}
            <div className="grid grid-cols-12 gap-4 px-4 text-[9px] font-bold text-[#475569] uppercase tracking-wider select-none">
              <div className="col-span-2 flex items-center">Rank</div>
              <div className="col-span-6">Developer</div>
              <div className="col-span-2 text-right">Streak</div>
              <div className="col-span-2 text-right">XP Points</div>
            </div>

            {/* Rows list */}
            {rankings.map((candidate) => (
              <div 
                key={candidate.userId} 
                className="grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg border border-white/[0.02] bg-white/[0.01] hover:bg-white/[0.02] transition-colors"
              >
                {/* Rank */}
                <div className="col-span-2 flex items-center">
                  {getRankBadge(candidate.rank)}
                </div>

                {/* Avatar & Name */}
                <div className="col-span-6 flex items-center gap-3">
                  {candidate.avatar ? (
                    <img 
                      src={candidate.avatar} 
                      alt={candidate.name} 
                      className="w-7 h-7 rounded-full object-cover border border-[#8B5CF6]/30 shadow-sm"
                    />
                  ) : (
                    <div 
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm shrink-0"
                      style={{
                        backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
                      }}
                    >
                      {getInitials(candidate.name)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-white truncate max-w-[180px]">
                    {candidate.name}
                  </span>
                </div>

                {/* Streak */}
                <div className="col-span-2 text-right flex items-center justify-end gap-1 font-semibold text-xs text-[#F59E0B]">
                  <Flame className="w-3.5 h-3.5 fill-current animate-pulse" />
                  <span>{candidate.streak || 0}</span>
                </div>

                {/* XP points */}
                <div className="col-span-2 text-right font-mono font-bold text-xs text-[#06B6D4]">
                  {candidate.xpPoints || 0} XP
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
