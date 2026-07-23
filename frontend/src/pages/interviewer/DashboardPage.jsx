import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Calendar, Sparkles, Trophy, History, Brain, Award, BookOpen, Users, Video, RefreshCw 
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import useAuthStore from "../../store/authStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/interviewer/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error("Fetch interviewer stats error:", err);
      toast.error("Failed to load interviewer dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleStartSession = async (sessionId, sessionCode) => {
    toast.loading("Opening collaborative room sandbox...", { id: "room-load" });
    try {
      await api.post(`/interviewer/join/${sessionCode}`);
      toast.dismiss("room-load");
      toast.success("Joined interview room!");
      navigate(`/interviewer/room/${sessionId}`);
    } catch (err) {
      toast.dismiss("room-load");
      console.error("Failed to join session:", err);
      toast.error("Failed to join live sandbox room");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const upcomingSessions = stats?.upcomingSessions || [];

  return (
    <div className="space-y-8 select-none text-white">
      {/* Welcome Banner */}
      <div 
        className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
        style={{ borderLeft: "4px solid #06B6D4" }}
      >
        <div className="space-y-2 relative z-10 text-center md:text-left">
          <div className="pill bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20 py-0.5 px-3.5 text-[10px] font-bold tracking-wider uppercase select-none w-max mx-auto md:mx-0">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>Interviewer Control Panel</span>
          </div>
          <h2 className="text-xl font-black text-white leading-tight">
            Welcome back, {user?.name || "Interviewer"}!
          </h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed max-w-xl font-medium">
            Schedule mock interview rounds, evaluate candidate submissions in live sandboxes, or configure custom question sets.
          </p>
        </div>
        <div className="flex gap-3 relative z-10 shrink-0 self-center">
          <button
            onClick={() => navigate("/interviewer/questions")}
            className="btn-ghost text-xs py-2.5 px-5 font-bold border border-white/10 text-white rounded-xl hover:bg-white/5 cursor-pointer"
          >
            Custom Questions
          </button>
          <button
            onClick={() => navigate("/interviewer/schedule")}
            className="btn-primary text-xs py-2.5 px-5 font-bold shadow-glow shadow-cyan/10 flex items-center gap-1.5 cursor-pointer rounded-xl"
            style={{ backgroundImage: "linear-gradient(135deg, #06B6D4, #8B5CF6)" }}
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Round</span>
          </button>
        </div>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-card p-4 border-white/5 flex flex-col justify-between min-h-[90px]">
          <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider">Total Conducted</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-white">{stats?.totalConducted || 0}</span>
            <span className="text-[8px] text-[#475569] font-bold uppercase">Rounds</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card p-4 border-white/5 flex flex-col justify-between min-h-[90px]">
          <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider">Upcoming Scheduled</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-white">{stats?.scheduledCount || 0}</span>
            <span className="text-[8px] text-[#475569] font-bold uppercase">Pending</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card p-4 border-white/5 flex flex-col justify-between min-h-[90px]">
          <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider">Active Live Rooms</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-[#10B981]">{stats?.liveCount || 0}</span>
            <span className="text-[8px] text-[#475569] font-bold uppercase">Streaming</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card p-4 border-white/5 flex flex-col justify-between min-h-[90px]">
          <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider">Avg Score Given</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span 
              className="text-2xl font-black text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #06B6D4, #8B5CF6)" }}
            >
              {stats?.avgRatingGiven || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming live rounds list */}
      <div className="glass-card p-5 border-white/5 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#06B6D4]" />
            <span>Scheduled Interview Loop Rounds</span>
          </h3>
          <button 
            onClick={fetchDashboardStats} 
            className="text-xs text-[#94A3B8] hover:text-white bg-transparent border-0 cursor-pointer flex items-center gap-1 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#94A3B8] font-bold italic">
            No upcoming interview sessions found. Click Schedule to add a candidate.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((sess) => (
              <div 
                key={sess._id}
                className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="pill text-[8px] bg-[#06B6D4]/10 border border-[#06B6D4]/25 text-[#06B6D4] font-bold px-2 py-0.5 uppercase">
                      {sess.topic}
                    </span>
                    <span className={`pill text-[8px] border font-bold px-2 py-0.5 uppercase ${
                      sess.status === "live" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse" : "bg-white/5 border-white/10 text-[#94A3B8]"
                    }`}>
                      {sess.status}
                    </span>
                  </div>
                  <h4 className="text-white text-xs font-bold leading-tight mt-1.5">
                    Candidate: {sess.candidateId?.name || "Applicant"}
                  </h4>
                  <div className="flex gap-2 text-[8px] text-[#475569] font-bold uppercase">
                    <span className="text-[#8B5CF6]">{sess.difficulty}</span>
                    <span>•</span>
                    <span>{sess.candidateId?.email || ""}</span>
                    <span>•</span>
                    <span>Scheduled for: {new Date(sess.scheduledFor || sess.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto select-none">
                  {sess.status === "completed" ? (
                    <button
                      onClick={() => navigate(`/report/${sess._id}`)}
                      className="btn-ghost text-[10px] py-2 px-4 border border-white/10 text-white rounded-lg cursor-pointer"
                    >
                      View Report
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartSession(sess._id, sess.sessionCode)}
                      className="btn-primary text-[10px] py-2 px-4 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                      style={{ backgroundImage: "linear-gradient(135deg, #06B6D4, #8B5CF6)" }}
                    >
                      <Video className="w-3.5 h-3.5 fill-current" />
                      <span>Start Round</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
