import React, { useState, useEffect } from "react";
import { Search, User, Filter, ChevronRight, Award } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

const TOPICS = [
  "Arrays",
  "Linked Lists",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "System Design",
  "Recursion",
  "Sorting"
];

export default function CandidatesList() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [minScore, setMinScore] = useState("");

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (topic) params.topic = topic;
      if (minScore) params.minScore = minScore;

      const res = await api.get("/interviewer/candidates", { params });
      setCandidates(res.data);
    } catch (err) {
      console.error("Fetch candidates error:", err);
      toast.error("Failed to load candidates list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [topic, minScore]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  const getInitials = (name) => {
    if (!name) return "DM";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6 select-none text-white">
      {/* Header Info */}
      <div>
        <h2 className="text-xl font-black text-white leading-tight mb-1">Candidates Directory</h2>
        <p className="text-xs text-[#94A3B8] font-medium">Browse and filter candidates that have completed mock interviews with you.</p>
      </div>

      {/* Filters bar */}
      <div className="glass-card p-4 border-white/5 flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full md:flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input-field pl-10 h-10"
            style={{ borderRadius: 8 }}
          />
          <button 
            type="submit" 
            className="absolute left-3.5 inset-y-0 flex items-center text-[#475569] hover:text-white bg-transparent border-0 cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        <div className="w-full md:w-48">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="input-field cursor-pointer h-10"
            style={{ borderRadius: 8 }}
          >
            <option value="">All Topics</option>
            {TOPICS.map((top) => (
              <option key={top} value={top}>{top}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <select
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            className="input-field cursor-pointer h-10"
            style={{ borderRadius: 8 }}
          >
            <option value="">Any Average Score</option>
            <option value="80">80% and Above</option>
            <option value="60">60% and Above</option>
            <option value="40">40% and Above</option>
          </select>
        </div>
      </div>

      {/* Table list */}
      <div className="glass-card p-6 border-white/5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
          <User className="w-4.5 h-4.5 text-[#06B6D4]" />
          <span>Active Applicants</span>
        </h3>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="py-12 text-center text-[#94A3B8] text-xs font-bold italic">
            No candidate logs matched the current queries.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header labels */}
            <div className="grid grid-cols-12 gap-4 px-4 text-[9px] font-bold text-[#475569] uppercase tracking-wider select-none">
              <div className="col-span-5">Candidate info</div>
              <div className="col-span-3 text-center">Conducted Rounds</div>
              <div className="col-span-2 text-center">Avg Rating</div>
              <div className="col-span-2 text-right">XP Points</div>
            </div>

            {/* List items */}
            {candidates.map((cand) => (
              <div 
                key={cand._id} 
                className="grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-lg border border-white/[0.02] bg-white/[0.01] hover:bg-white/[0.02] transition-colors"
              >
                {/* Details */}
                <div className="col-span-5 flex items-center gap-3">
                  {cand.avatar ? (
                    <img 
                      src={cand.avatar} 
                      alt={cand.name} 
                      className="w-8 h-8 rounded-full object-cover border border-[#06B6D4]/30"
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0"
                      style={{
                        backgroundImage: "linear-gradient(135deg, #06B6D4, #8B5CF6)",
                      }}
                    >
                      {getInitials(cand.name)}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white truncate max-w-[170px] block leading-tight">{cand.name}</span>
                    <span className="text-[9px] text-[#475569] font-mono block leading-none">{cand.email}</span>
                  </div>
                </div>

                {/* Conducted Sessions */}
                <div className="col-span-3 text-center text-xs font-bold text-white">
                  {cand.totalSessions || 0} Complete
                </div>

                {/* Avg Score */}
                <div className="col-span-2 text-center select-none font-bold text-xs">
                  <span className="pill text-[9px] bg-cyan/10 border border-cyan/20 text-[#06B6D4] font-mono">
                    {cand.avgScore || 0}%
                  </span>
                </div>

                {/* XP Points */}
                <div className="col-span-2 text-right font-mono font-bold text-xs text-[#8B5CF6]">
                  {cand.xpPoints || 0} XP
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
