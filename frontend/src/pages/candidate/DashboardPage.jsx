import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Play, Calendar, Sparkles, Trophy, History, Brain, Award, BookOpen, User, Flame 
} from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from "recharts";
import toast from "react-hot-toast";
import api from "../../utils/api";
import useAuthStore from "../../store/authStore";
import { PinContainer } from "../../components/ui/3DPinCard.jsx";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { EncryptedText } from "../../components/ui/EncryptedText.jsx";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const x = useMotionValue(200);
  const y = useMotionValue(100);

  const rotateX = useTransform(y, [0, 200], [8, -8]);
  const rotateY = useTransform(x, [0, 600], [-8, 8]);

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
    x.set(200);
    y.set(100);
  }

  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, sessionsRes] = await Promise.all([
          api.get("/profile/me"),
          api.get("/sessions/my")
        ]);
        setProfile(profileRes.data.profile);
        setSessions(sessionsRes.data.slice(0, 5)); // show latest 5
      } catch (err) {
        console.error("Dashboard data load error:", err);
        toast.error("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Map skill scores
  const skillScores = profile?.skillScores || {};
  const radarData = Object.entries(skillScores).map(([skill, score]) => ({
    subject: skill,
    A: score,
    fullMark: 100,
  }));

  // Activity contribution helper
  const activityData = profile?.activityCalendar || [];
  const today = new Date();
  const last28Days = Array.from({ length: 28 }).map((_, idx) => {
    const d = new Date();
    d.setDate(today.getDate() - (27 - idx));
    const dStr = d.toISOString().split("T")[0];
    const match = activityData.find((a) => a.date === dStr);
    return {
      date: dStr,
      count: match ? match.count : 0,
    };
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div 
        className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden cursor-pointer"
        style={{ 
          borderLeft: "4px solid #8B5CF6",
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          perspective: 1000
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="space-y-2 relative z-10 text-center md:text-left">
          <div className="pill bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 py-0.5 px-3.5 text-[10px] font-bold tracking-wider uppercase select-none w-max mx-auto md:mx-0">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            <span>Ready for your next challenge?</span>
          </div>
          <h2 className="text-xl font-black text-white leading-tight">
            <EncryptedText 
              text={`Welcome back, ${user?.name || "Developer"}!`}
              revealedClassName="text-white font-extrabold"
              encryptedClassName="text-[#8B5CF6]/60 font-mono"
              revealDelayMs={40}
            />
          </h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed max-w-xl font-medium">
            Your mock interview environment is ready. Start a sandbox practice room or solve questions to gain XP and streaks.
          </p>
        </div>
        <div className="flex gap-3 relative z-10 shrink-0 self-center">
          <button
            onClick={() => navigate("/questions")}
            className="btn-ghost text-xs py-2.5 px-5 font-bold border border-white/10 text-white rounded-xl hover:bg-white/5 cursor-pointer"
          >
            Browse Questions
          </button>
          <button
            onClick={() => navigate("/interview/setup")}
            className="btn-primary text-xs py-2.5 px-5 font-bold shadow-glow shadow-purple/10 flex items-center gap-1.5 cursor-pointer rounded-xl"
            style={{ backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Practice</span>
          </button>
        </div>
      </motion.div>

      {/* 3D Pin Cards for Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 pb-8 select-none">
        <PinContainer title="Start Practice" href="/interview/setup" containerClassName="w-full h-48 flex justify-center items-center">
          <div className="flex flex-col p-4 w-60 h-40 justify-between">
            <div>
              <Sparkles className="w-7 h-7 text-[#8B5CF6] mb-2" />
              <h3 className="font-bold text-sm text-slate-100 mb-1">AI Practice Room</h3>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Initialize tailored mock interviews with real-time speech AI.
              </p>
            </div>
            <span className="text-[9px] text-[#8B5CF6] font-bold uppercase tracking-wider">Configure setup →</span>
          </div>
        </PinContainer>

        <PinContainer title="Question Bank" href="/questions" containerClassName="w-full h-48 flex justify-center items-center">
          <div className="flex flex-col p-4 w-60 h-40 justify-between">
            <div>
              <BookOpen className="w-7 h-7 text-[#06B6D4] mb-2" />
              <h3 className="font-bold text-sm text-slate-100 mb-1">Question Bank</h3>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Browse through industry-level challenges tailored by topic.
              </p>
            </div>
            <span className="text-[9px] text-[#06B6D4] font-bold uppercase tracking-wider">Browse challenges →</span>
          </div>
        </PinContainer>

        <PinContainer title="Leaderboard" href="/leaderboard" containerClassName="w-full h-48 flex justify-center items-center">
          <div className="flex flex-col p-4 w-60 h-40 justify-between">
            <div>
              <Trophy className="w-7 h-7 text-amber-500 mb-2" />
              <h3 className="font-bold text-sm text-slate-100 mb-1">Global Rankings</h3>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Track your progress, earn badges, and rank up globally.
              </p>
            </div>
            <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">View ratings →</span>
          </div>
        </PinContainer>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-card p-4 border-white/5 flex flex-col justify-between min-h-[90px]">
          <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider">Total Sessions</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-white">{profile?.stats?.totalSessions || 0}</span>
            <span className="text-[8px] text-[#475569] font-bold uppercase">completed</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card p-4 border-white/5 flex flex-col justify-between min-h-[90px]">
          <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider">Average Score</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span 
              className="text-2xl font-black text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
            >
              {profile?.stats?.avgScore || 0}%
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card p-4 border-white/5 flex flex-col justify-between min-h-[90px]">
          <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#F59E0B]" /> Active Streak
          </span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-white">{profile?.stats?.currentStreak || 0} Days</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card p-4 border-white/5 flex flex-col justify-between min-h-[90px]">
          <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider">XP Points</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span 
              className="text-2xl font-black text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #F59E0B, #EC4899)" }}
            >
              {profile?.xpPoints || 0} XP
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Skill Radar + Activity progressions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar skill chart */}
        <div className="glass-card p-5 border-white/5 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-[#06B6D4]" />
              <span>Assessed Skill index</span>
            </h3>
            <span className="pill text-[8px] font-bold border border-[#06B6D4]/20 bg-[#06B6D4]/5 text-[#06B6D4]">Radar Mapping</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    stroke="#94a3b8" 
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }}
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 100]} 
                    stroke="rgba(255,255,255,0.1)"
                    tick={{ fill: "#475569", fontSize: 8 }}
                  />
                  <Radar 
                    name="Skills" 
                    dataKey="A" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-[#94A3B8] font-bold italic">No skills evaluated yet. Start interviews to construct radar indices!</p>
            )}
          </div>
        </div>

        {/* Profile Stats / XP status */}
        <div className="space-y-6 lg:col-span-1">
          {/* XP progress */}
          <div className="glass-card p-5 border-white/5 space-y-3">
            <h4 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Progression Level</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-white">Level {Math.floor((profile?.xpPoints || 0) / 1000) + 1}</span>
              <span className="text-[10px] text-[#475569] font-bold">({profile?.xpPoints || 0} Total XP)</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]"
                style={{ width: `${((profile?.xpPoints || 0) % 1000) / 10}%` }}
              />
            </div>
            <p className="text-[9px] text-[#94A3B8] font-medium leading-none">
              {(profile?.xpPoints || 0) % 1000} / 1000 XP to next level rank.
            </p>
          </div>

          {/* Practice Activity Calendar Map */}
          <div className="glass-card p-5 border-white/5 space-y-4">
            <h4 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#06B6D4]" />
              <span>Practice Activity (Last 28 Days)</span>
            </h4>

            <div className="grid grid-cols-7 gap-1.5 w-max mx-auto select-none">
              {last28Days.map((day) => {
                const colors = [
                  "bg-white/[0.02] border border-white/5",
                  "bg-[#8B5CF6]/20 border border-[#8B5CF6]/30",
                  "bg-[#8B5CF6]/40 border border-[#8B5CF6]/55",
                  "bg-[#06B6D4]/60 border border-[#06B6D4]/70",
                ];
                const activeColor = colors[Math.min(day.count, 3)];
                return (
                  <div 
                    key={day.date}
                    className={`w-[18px] h-[18px] rounded-[4px] transition ${activeColor}`}
                    title={`${day.date}: ${day.count} mocks completed`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions & Milestone Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table/List of recent sessions */}
        <div className="glass-card p-5 border-white/5 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#8B5CF6]" />
              <span>Recent Sessions</span>
            </h3>
            <span className="pill text-[8px] font-bold border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 text-[#8B5CF6]">Completed Rounds</span>
          </div>

          {sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#94A3B8] font-bold italic">
              No sessions conducted yet. Launch your first practice sandbox!
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((sess) => (
                <div 
                  key={sess._id}
                  className="p-3.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <h4 className="text-white text-xs font-bold leading-tight">{sess.topic}</h4>
                    <div className="flex gap-2 text-[8px] text-[#475569] font-bold uppercase">
                      <span className="text-[#8B5CF6]">{sess.difficulty}</span>
                      <span>•</span>
                      <span>{sess.language}</span>
                      <span>•</span>
                      <span>{new Date(sess.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {sess.aiReport?.overallScore !== undefined && (
                      <span className="text-[#06B6D4] font-mono font-bold text-xs">{sess.aiReport.overallScore}% Score</span>
                    )}
                    <button
                      onClick={() => navigate(`/report/${sess._id}`)}
                      className="btn-ghost text-[9px] py-1.5 px-3 border border-white/10 text-white rounded cursor-pointer"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Milestone badges */}
        <div className="glass-card p-5 border-white/5 lg:col-span-1 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-3 border-b border-white/5">
            <Award className="w-4.5 h-4.5 text-[#F59E0B]" />
            <span>Milestone Badges</span>
          </h3>

          <div className="space-y-3 select-none">
            {profile?.badges && profile.badges.length > 0 ? (
              profile.badges.map((badge) => (
                <div key={badge.name} className="p-3 rounded-lg border border-white/5 bg-[#8b5cf6]/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {badge.icon || "🏆"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{badge.name}</h4>
                    <p className="text-[9px] text-[#94A3B8] font-medium">Claimed milestone unlock</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-lg border border-white/5 bg-white/[0.01] flex items-center gap-3 opacity-50">
                <div className="w-8 h-8 rounded-full bg-white/5 text-[#475569] flex items-center justify-center font-bold text-xs shrink-0">
                  🔒
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">First Milestone</h4>
                  <p className="text-[9px] text-[#94A3B8] font-medium">Solve challenges to unlock</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
