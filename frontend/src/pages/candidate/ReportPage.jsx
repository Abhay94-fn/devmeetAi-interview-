import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CheckCircle, Award, TrendingUp, Brain, AlertCircle, ChevronRight, Code, BookOpen, ArrowRight, Share2 
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export default function ReportPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let socket = null;
    const fetchReport = async () => {
      try {
        const res = await api.get(`/reports/${sessionId}`);
        if (res.data && res.data.status === "processing") {
          // Connect to socket and join report room
          const { getSocket } = await import("../../utils/socket");
          socket = getSocket();
          socket.emit("join:report-room", { sessionId });
          socket.on("report:ready", async () => {
            try {
              const finalRes = await api.get(`/reports/${sessionId}`);
              setReport(finalRes.data);
              setLoading(false);
              toast.success("AI interview report card ready!");
            } catch (err) {
              console.error("Refetch report error:", err);
            }
          });
          return;
        }
        setReport(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch report error:", err);
        if (err.response?.status === 404) {
          try {
            const finalCode = sessionStorage.getItem(`finalCode_${sessionId}`) || "";
            await api.post("/reports/generate", { sessionId, finalCode });
            setTimeout(fetchReport, 2000); // retry after 2s
            return;
          } catch (genErr) {
            console.error("Failed to auto-generate report:", genErr);
          }
        }
        toast.error("Failed to load interview report card");
        navigate("/dashboard");
      }
    };

    fetchReport();

    return () => {
      if (socket) {
        socket.off("report:ready");
      }
    };
  }, [sessionId, navigate]);

  // Score Count-up Animation
  useEffect(() => {
    if (!report || loading) return;

    const targetScore = report.overallScore || 0;
    if (targetScore === 0) return;

    let current = 0;
    const duration = 1200; // ms
    const stepTime = Math.max(Math.floor(duration / targetScore), 15);

    const timer = setInterval(() => {
      current += 1;
      if (current >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [report, loading]);

  const handleShareReport = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Report scorecard link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[#94A3B8] font-bold animate-pulse">Compiling post-interview AI analysis scorecard...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-xs text-[#94A3B8]">Scorecard could not be loaded.</p>
        <button onClick={() => navigate("/dashboard")} className="btn-primary text-xs py-2 px-5 rounded-lg">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { breakdown, companyFitMap, strengths, weaknesses, tips, studyResources, estimatedLevel } = report;

  const breakdownFields = [
    { key: "problemSolving", label: "Problem Solving", color: "#8B5CF6" },
    { key: "codeQuality", label: "Code Quality", color: "#06B6D4" },
    { key: "timeComplexity", label: "Time Complexity", color: "#F59E0B" },
    { key: "spaceComplexity", label: "Space Complexity", color: "#EC4899" },
    { key: "communication", label: "Communication", color: "#10B981" },
    { key: "edgeCases", label: "Edge Cases Check", color: "#6366F1" }
  ];

  const getReadinessStatus = (score) => {
    if (score >= 80) return { label: "Ready", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    if (score >= 60) return { label: "Almost Ready", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
    return { label: "Not Ready", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 select-none">
      
      {/* SECTION 1: Header Summary */}
      <div 
        className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
        style={{ borderLeft: "4px solid #8B5CF6" }}
      >
        <div className="space-y-2 relative z-10 text-center md:text-left">
          <div className="pill bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-0.5 px-2.5 text-[10px] font-bold tracking-wider uppercase select-none w-max mx-auto md:mx-0">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            <span>Interview Complete</span>
          </div>
          <h2 className="text-xl font-black text-white leading-tight">
            Mock Interview Scorecard
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
            <span className="text-white font-mono bg-white/5 border border-white/5 py-0.5 px-2 rounded">
              Topic: {report.sessionId?.topic || "Arrays"}
            </span>
            <span>•</span>
            <span className="text-white font-mono bg-white/5 border border-white/5 py-0.5 px-2 rounded">
              Difficulty: {report.sessionId?.difficulty || "medium"}
            </span>
            <span>•</span>
            <span>Date: {new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: Score radial circle + Breakdown grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Score Circle Card */}
        <div className="glass-card p-6 border-white/5 md:col-span-5 flex flex-col items-center justify-center text-center">
          <h3 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-6">Overall Score</h3>

          {/* Radial score circle */}
          <div className="relative w-36 h-36 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="42" 
                stroke="rgba(255,255,255,0.03)" 
                strokeWidth="6" 
                fill="transparent" 
              />
              <circle 
                cx="50" 
                cy="50" 
                r="42" 
                stroke="url(#reportScoreGrad)" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray="263.8"
                strokeDashoffset={263.8 - (263.8 * animatedScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient id="reportScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span 
                className="text-3xl font-black text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
              >
                {animatedScore}%
              </span>
            </div>
          </div>

          <span className="pill text-[8px] font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 py-0.5 px-3 uppercase tracking-wider mb-2">
            Estimated level
          </span>
          <h4 className="text-white text-xs font-bold leading-tight">{estimatedLevel || "Mid-Level Software Engineer"}</h4>
        </div>

        {/* Breakdown progress bar items */}
        <div className="glass-card p-6 border-white/5 md:col-span-7 space-y-4 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#8B5CF6]" />
            <span>Assessed Metrics Breakdown</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {breakdownFields.map((field) => {
              const scoreVal = breakdown?.[field.key] || 50;
              return (
                <div key={field.key} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-semibold text-[#94A3B8]">{field.label}</span>
                    <span className="font-bold text-white">{scoreVal}/100</span>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="w-full h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${scoreVal}%`,
                        backgroundColor: field.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 4: Company readiness match */}
      <div className="glass-card p-6 border-white/5 space-y-5">
        <h3 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-4.5 h-4.5 text-[#06B6D4]" />
          <span>Hiring Readiness Benchmark Index</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["faang", "startup", "enterprise"].map((type) => {
            const fitScore = companyFitMap?.[type] || 50;
            const fitStatus = getReadinessStatus(fitScore);

            return (
              <div 
                key={type} 
                className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col justify-between min-h-[90px]"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider capitalize">
                    {type === "faang" ? "Big Tech / FAANG" : type}
                  </span>
                  <span className={`pill text-[8px] font-bold px-2 py-0.5 border ${fitStatus.color}`}>
                    {fitStatus.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-xl font-extrabold text-white">{fitScore}%</span>
                  <span className="text-[8px] text-[#475569] font-bold uppercase">Match</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: Strengths & Weaknesses side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-white/5 space-y-4">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Key Strengths</span>
          </h4>

          {strengths?.length === 0 ? (
            <p className="text-[10px] text-[#475569] italic">No strengths compiled.</p>
          ) : (
            <ul className="space-y-2.5 pl-0 m-0 list-none text-xs text-[#94A3B8] leading-relaxed">
              {strengths?.map((str, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="text-emerald-400 font-extrabold shrink-0 mt-0.5">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card p-6 border-white/5 space-y-4">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/5">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Areas to Improve</span>
          </h4>

          {weaknesses?.length === 0 ? (
            <p className="text-[10px] text-[#475569] italic">No critical improvement needs compiled.</p>
          ) : (
            <ul className="space-y-2.5 pl-0 m-0 list-none text-xs text-[#94A3B8] leading-relaxed">
              {weaknesses?.map((weak, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="text-amber-400 font-extrabold shrink-0 mt-0.5">!</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* SECTION 6: AI Personalized Tips */}
      <div className="glass-card p-6 border-white/5 space-y-5">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
          <Brain className="w-4.5 h-4.5 text-[#8B5CF6]" />
          <span>Personalized Action Tips</span>
        </h4>

        {tips?.length === 0 ? (
          <p className="text-xs text-[#475569] italic font-semibold">No additional tips compiled.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips?.map((tip, idx) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-lg border border-white/5 bg-white/[0.01] flex items-start gap-3"
              >
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-white shrink-0 mt-0.5 animate-pulse"
                  style={{ backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
                >
                  {idx + 1}
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed font-semibold">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 7: Recommended Study Resources */}
      <div className="glass-card p-6 border-white/5 space-y-5">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
          <BookOpen className="w-4.5 h-4.5 text-[#06B6D4]" />
          <span>Recommended Study Resources</span>
        </h4>

        {studyResources?.length === 0 ? (
          <p className="text-xs text-[#475569] italic font-semibold">No resource links compiled.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyResources?.map((resource, idx) => (
              <a 
                key={idx}
                href="https://github.com/donnemartin/system-design-primer" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3.5 rounded-lg border border-white/5 hover:border-[#8B5CF6]/30 bg-white/[0.01] hover:bg-[#8B5CF6]/5 transition-all flex items-center justify-between text-xs font-bold text-white no-underline group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center shrink-0">
                    <Code className="w-4 h-4" />
                  </div>
                  <span>{resource}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#475569] group-hover:text-white transition-colors" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 8: Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3.5 pt-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="btn-ghost text-xs py-2.5 px-6 rounded-lg font-bold border border-white/10 hover:bg-white/5 text-white cursor-pointer"
        >
          Back to Dashboard
        </button>
        <button
          onClick={handleShareReport}
          className="btn-ghost text-xs py-2.5 px-6 rounded-lg font-bold border border-white/10 hover:bg-white/5 text-white cursor-pointer flex items-center gap-2"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Result</span>
        </button>
        <button
          onClick={() => navigate("/interview/setup")}
          className="btn-primary text-xs py-2.5 px-6 rounded-lg font-bold shadow-glow shadow-purple/10 flex items-center gap-2 cursor-pointer"
          style={{ backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
        >
          <span>Practice Again</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
