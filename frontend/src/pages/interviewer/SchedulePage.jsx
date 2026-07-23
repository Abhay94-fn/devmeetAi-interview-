import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Video, Clock, User, Check, ArrowLeft } from "lucide-react";
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
  "Sorting",
  "Binary Search",
  "Strings"
];

export default function ScheduleInterview() {
  const navigate = useNavigate();

  const [candidateEmail, setCandidateEmail] = useState("");
  const [topic, setTopic] = useState("Arrays");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Success Results
  const [createdSession, setCreatedSession] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/interviewer/schedule", {
        candidateEmail,
        topic,
        difficulty,
        language: "javascript",
        scheduledAt: scheduledAt || new Date().toISOString()
      });
      setCreatedSession(res.data);
      toast.success("Interview session scheduled successfully!");
    } catch (err) {
      console.error("Schedule error:", err);
      toast.error(err.response?.data?.message || "Failed to schedule session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 select-none text-white">
      {/* Header Back Link */}
      <button 
        onClick={() => navigate("/interviewer/dashboard")}
        className="text-xs font-bold text-[#06B6D4] hover:text-white bg-transparent border-0 cursor-pointer flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      {/* Main schedule card */}
      <div className="glass-card p-6 border-white/5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
          <Calendar className="w-4.5 h-4.5 text-[#06B6D4]" />
          <span>Schedule Mock Interview Round</span>
        </h3>

        {createdSession ? (
          <div className="space-y-6 text-center select-text">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white leading-tight">Mock Loop Scheduled!</h4>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
                Provide this session code to your candidate. They can input it on their practice portal to join.
              </p>
            </div>

            <div 
              className="p-5 rounded-xl border border-dashed border-white/10 text-center space-y-2 bg-[#0c0c1b]/60"
              style={{ borderLeft: "3.5px solid #10B981" }}
            >
              <span className="text-[9px] text-[#475569] font-bold uppercase tracking-wider">Session Access Code</span>
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#06B6D4] tracking-widest uppercase">
                {createdSession.sessionCode}
              </p>
            </div>

            <button
              onClick={() => {
                setCreatedSession(null);
                setCandidateEmail("");
                setScheduledAt("");
              }}
              className="btn-ghost text-xs py-2 px-5 border border-white/10 text-white rounded-lg cursor-pointer"
            >
              Schedule Another Round
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 select-text">
            {/* Candidate Email */}
            <div>
              <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Candidate Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="candidate@gmail.com"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    padding: "12px 16px 12px 40px",
                    color: "#fff",
                    width: "100%",
                    outline: "none",
                    fontSize: 14,
                  }}
                  className="focus:border-[#06B6D4] transition-colors"
                />
                <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#475569]" />
              </div>
            </div>

            {/* Topic Select */}
            <div>
              <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Topic Set</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input-field cursor-pointer h-10"
                style={{ borderRadius: 8 }}
              >
                {TOPICS.map((top) => (
                  <option key={top} value={top}>{top}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Preset */}
            <div>
              <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Difficulty Preset</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input-field cursor-pointer h-10"
                style={{ borderRadius: 8 }}
              >
                <option value="beginner">Easy</option>
                <option value="intermediate">Medium</option>
                <option value="senior">Hard</option>
              </select>
            </div>

            {/* Scheduled Datetime */}
            <div>
              <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Scheduled Datetime</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    padding: "12px 16px 12px 40px",
                    color: "#fff",
                    width: "100%",
                    outline: "none",
                    fontSize: 14,
                  }}
                  className="focus:border-[#06B6D4] transition-colors"
                />
                <Clock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#475569]" />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3.5 justify-center rounded-xl mt-6 shadow-glow shadow-cyan/10 cursor-pointer flex items-center justify-center gap-2"
              style={{ backgroundImage: "linear-gradient(135deg, #06B6D4, #8B5CF6)" }}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>Generate scheduled round</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
