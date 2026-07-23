import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Trash2, Check, Star, Settings } from "lucide-react";
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

export default function QuestionManager() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [statement, setStatement] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [topic, setTopic] = useState("Arrays");
  const [timeComplexity, setTimeComplexity] = useState("O(N)");
  const [spaceComplexity, setSpaceComplexity] = useState("O(1)");
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/interviewer/questions");
      setQuestions(res.data);
    } catch (err) {
      console.error("Fetch custom questions error:", err);
      toast.error("Failed to load custom questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/interviewer/questions", {
        title,
        statement,
        difficulty,
        topic,
        expectedComplexity: {
          time: timeComplexity,
          space: spaceComplexity
        },
        starterCode: {
          javascript: `function solve() {\n  // Write your code here...\n}`
        }
      });
      toast.success("Custom challenge created successfully!");
      setShowModal(false);
      
      // Clear form
      setTitle("");
      setStatement("");
      setTimeComplexity("O(N)");
      setSpaceComplexity("O(1)");

      fetchQuestions();
    } catch (err) {
      console.error("Create custom question error:", err);
      toast.error(err.response?.data?.message || "Failed to create custom question");
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyBadge = (diff) => {
    if (diff === "beginner" || diff === "easy") return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (diff === "intermediate" || diff === "medium") return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-rose-400 border-rose-500/20 bg-rose-500/5";
  };

  const getDifficultyLabel = (diff) => {
    if (diff === "beginner") return "Easy";
    if (diff === "intermediate") return "Medium";
    if (diff === "senior") return "Hard";
    return diff;
  };

  return (
    <div className="space-y-6 select-none text-white pb-12">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white leading-tight mb-1">Custom Question Manager</h2>
          <p className="text-xs text-[#94A3B8] font-medium">Create and customize technical challenge questions to use in scheduled rounds.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-xs py-2.5 px-5 font-bold shadow-glow shadow-cyan/10 flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto rounded-xl"
          style={{ backgroundImage: "linear-gradient(135deg, #06B6D4, #8B5CF6)" }}
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Challenge</span>
        </button>
      </div>

      {/* Questions list card */}
      <div className="glass-card p-6 border-white/5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
          <BookOpen className="w-4.5 h-4.5 text-[#06B6D4]" />
          <span>Custom Challenges Pool</span>
        </h3>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-12 text-center text-[#94A3B8] text-xs font-bold italic">
            No custom challenges created yet. Click New Custom Challenge to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {questions.map((q) => (
              <div 
                key={q._id} 
                className="glass-card p-5 border-white/5 flex flex-col justify-between min-h-[170px]"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center select-none">
                    <span className={`pill text-[8px] font-bold border uppercase ${getDifficultyBadge(q.difficulty)}`}>
                      {getDifficultyLabel(q.difficulty)}
                    </span>
                    <span className="pill text-[8px] font-bold bg-[#06B6D4]/10 border border-[#06B6D4]/25 text-[#06B6D4]">
                      {q.topic}
                    </span>
                  </div>
                  
                  <h3 className="text-white text-xs font-bold leading-tight">{q.title}</h3>
                  <p className="text-[10px] text-[#94A3B8] leading-relaxed line-clamp-3 select-text font-medium">
                    {q.statement}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5 select-none text-[8px] font-bold text-[#475569] uppercase font-mono">
                  <span>Complexity Target: {q.expectedComplexity?.time || "O(N)"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-card max-w-lg w-full p-6 border-white/15 relative overflow-hidden bg-[#0c0c1b] max-h-[90vh] overflow-y-auto">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#06B6D4]/10 rounded-full blur-xl pointer-events-none" />

            <div className="text-center mb-6">
              <h3 className="text-white text-sm font-bold mb-1">Create Custom challenge</h3>
              <p className="text-[9px] text-[#94A3B8] font-semibold">Define custom coding questions statement for mocks.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 select-text">
              {/* Title */}
              <div>
                <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Challenge Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Reverse Binary Tree Inplace"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    color: "#sm",
                    width: "100%",
                    outline: "none",
                    fontSize: 14,
                  }}
                  className="focus:border-[#06B6D4] transition-colors"
                />
              </div>

              {/* Statement */}
              <div>
                <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5 font-bold">
                  Problem Statement
                </label>
                <textarea
                  required
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Define inputs, outputs, expectations, and limits..."
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

              {/* Topic & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Topic</label>
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
              </div>

              {/* Complexities target */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Target Time complexity</label>
                  <input
                    type="text"
                    required
                    value={timeComplexity}
                    onChange={(e) => setTimeComplexity(e.target.value)}
                    placeholder="e.g. O(N)"
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

                <div>
                  <label className="block text-[9px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Target Space complexity</label>
                  <input
                    type="text"
                    required
                    value={spaceComplexity}
                    onChange={(e) => setSpaceComplexity(e.target.value)}
                    placeholder="e.g. O(1)"
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
              </div>

              {/* Actions select */}
              <div className="flex gap-3 pt-4 select-none justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost text-xs py-2 px-5 border border-white/10 text-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2 px-5 rounded-lg text-white font-bold cursor-pointer"
                  style={{ backgroundImage: "linear-gradient(135deg, #06B6D4, #8B5CF6)" }}
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Create challenge</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
