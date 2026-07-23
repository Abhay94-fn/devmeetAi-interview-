import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClipboardCheck, Save, ArrowLeft, Star } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

const EVAL_METRICS = [
  { key: "problemSolving", label: "Problem Solving", desc: "Algorithmic thinking and approach selection" },
  { key: "codeQuality", label: "Code Quality", desc: "Clean, readable, modular structure" },
  { key: "timeComplexity", label: "Time Complexity", desc: "Efficiency and bounds optimisation" },
  { key: "spaceComplexity", label: "Space Complexity", desc: "Memory footprints tracking" },
  { key: "communication", label: "Communication", desc: "Spoke clearly, explained logic trade-offs" },
  { key: "edgeCases", label: "Edge Cases Check", desc: "Null, overflow, boundary condition validation" }
];

export default function EvaluatePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [scores, setScores] = useState({
    problemSolving: 70,
    codeQuality: 70,
    timeComplexity: 70,
    spaceComplexity: 70,
    communication: 70,
    edgeCases: 70
  });

  const [notes, setNotes] = useState("");
  const [recommendation, setRecommendation] = useState("Leaning Hire");
  const [submitting, setSubmitting] = useState(false);

  const handleScoreChange = (metric, val) => {
    setScores((prev) => ({
      ...prev,
      [metric]: Number(val)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/interviewer/evaluate/${sessionId}`, {
        scores,
        notes,
        recommendation
      });
      toast.success("Candidate evaluation submitted successfully!");
      navigate("/interviewer/dashboard");
    } catch (err) {
      console.error("Evaluation submit error:", err);
      toast.error(err.response?.data?.message || "Failed to submit evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 select-none text-white pb-12">
      {/* Back navigation */}
      <button 
        onClick={() => navigate(`/interviewer/room/${sessionId}`)}
        className="text-xs font-bold text-[#06B6D4] hover:text-white bg-transparent border-0 cursor-pointer flex items-center gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Workspace Sandbox</span>
      </button>

      {/* Main evaluate card */}
      <div className="glass-card p-6 border-white/5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
          <ClipboardCheck className="w-4.5 h-4.5 text-[#06B6D4]" />
          <span>Evaluate Candidate Loop Performance</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6 select-text">
          {/* Sliders breakdown */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Metrics Scores (0 to 100)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {EVAL_METRICS.map((metric) => (
                <div key={metric.key} className="space-y-2 border border-white/[0.03] bg-white/[0.01] p-3 rounded-lg">
                  <div className="flex justify-between items-center text-xs select-none">
                    <span className="font-bold text-white">{metric.label}</span>
                    <span className="font-mono font-bold text-[#06B6D4]">{scores[metric.key]}</span>
                  </div>
                  <p className="text-[9px] text-[#475569] font-semibold leading-relaxed leading-none">{metric.desc}</p>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={scores[metric.key]}
                    onChange={(e) => handleScoreChange(metric.key, e.target.value)}
                    className="w-full accent-[#06B6D4] cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Hiring recommendation select */}
          <div className="text-left">
            <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Hiring Recommendation</label>
            <select
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              className="input-field cursor-pointer h-10"
              style={{ borderRadius: 8 }}
            >
              <option value="Strong Hire">Strong Hire</option>
              <option value="Hire">Hire</option>
              <option value="Leaning Hire">Leaning Hire</option>
              <option value="No Hire">No Hire</option>
            </select>
          </div>

          {/* Detailed feedback notes */}
          <div>
            <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 font-bold">
              Interviewer Feedback Notes
            </label>
            <textarea
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide a constructive, detailed summary of their strengths, weaknesses, coding approach, and overall communication..."
              rows={4}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "12px 16px",
                color: "#fff",
                width: "100%",
                outline: "none",
                fontSize: 14,
              }}
              className="focus:border-[#06B6D4] transition-colors"
            />
          </div>

          {/* Action buttons */}
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
                <Save className="w-4 h-4" />
                <span>Submit Scorecard</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
