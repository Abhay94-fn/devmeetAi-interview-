import React, { useState, useEffect } from "react";
import { BookOpen, Search, ChevronRight, Users, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";

const cardStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
  backdropFilter: "blur(12px)",
};

const TOPICS = ["All", "Arrays", "Strings", "Linked Lists", "Stacks", "Trees", "Graphs", "Dynamic Programming", "Two Pointers", "Sliding Window", "Binary Search", "Backtracking", "Design", "Hash Maps", "Intervals"];
const DIFFS = ["All", "beginner", "intermediate", "senior"];

const diffColor = { beginner: "#22c55e", intermediate: "#eab308", senior: "#ef4444" };

export default function QuestionBankPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [loading, setLoading] = useState(true);

  // Import Modal State
  const [showModal, setShowModal] = useState(false);
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [importing, setImporting] = useState(false);

  // Launch Session State
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [startLanguage, setStartLanguage] = useState("javascript");
  const [launching, setLaunching] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);
      if (topic !== "All") params.set("topic", topic);
      if (difficulty !== "All") params.set("difficulty", difficulty);
      const { data } = await api.get(`/questions?${params}`);
      setQuestions(data.questions || []);
      setTotal(data.pagination?.total || data.total || 0);
    } catch (err) {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [page, search, topic, difficulty]);

  // Seed questions on first load if empty
  useEffect(() => {
    if (!loading && questions.length === 0 && page === 1 && !search && topic === "All" && difficulty === "All") {
      api.post("/questions/seed").then(() => {
        fetchQuestions();
      }).catch(() => {});
    }
  }, [loading, questions.length]);

  const handleImport = async (e) => {
    e.preventDefault();
    if (!leetcodeUrl) return toast.error("Please enter a LeetCode problem URL or slug");

    setImporting(true);
    const loadToast = toast.loading("🤖 Fetching and cleaning LeetCode problem data via Gemini...");

    try {
      const { data } = await api.post("/questions/import-leetcode", { url: leetcodeUrl });
      toast.dismiss(loadToast);
      toast.success(`Successfully imported "${data.title}"!`);
      
      // Clear inputs, close modal, and reload questions
      setLeetcodeUrl("");
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err.response?.data?.message || "Failed to import LeetCode question");
    } finally {
      setImporting(false);
    }
  };

  const handleLaunchPractice = async (e) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    setLaunching(true);
    const loadId = toast.loading(`🤖 Preparing practice room for "${selectedQuestion.title}"...`);
    try {
      const { data } = await api.post("/sessions/create", {
        topic: selectedQuestion.topic || "General",
        difficulty: selectedQuestion.difficulty || "intermediate",
        language: startLanguage,
        questionId: selectedQuestion._id,
      });
      toast.dismiss(loadId);
      toast.success("Practice workspace ready!");
      setSelectedQuestion(null);
      navigate(`/interview/${data._id}`);
    } catch (err) {
      toast.dismiss(loadId);
      toast.error(err.response?.data?.message || "Failed to create practice session");
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }} className="select-none text-white">
      {/* Header section with Import action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            Question Bank
          </h1>
          <p className="text-sm text-white/50 mt-1">{total} questions available • Filter by topic or import custom ones</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-2 cursor-pointer transition select-none border-0 shadow-glow"
          style={{ backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
        >
          <Upload className="w-4 h-4" />
          <span>Import LeetCode Question</span>
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search className="w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 text-white/30" style={{ left: 12 }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search questions..."
            style={{
              width: "100%", padding: "9px 12px 9px 36px", borderRadius: 10, fontSize: 13,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff", outline: "none",
            }}
          />
        </div>

        <select
          value={topic}
          onChange={(e) => { setTopic(e.target.value); setPage(1); }}
          style={{
            padding: "9px 12px", borderRadius: 10, fontSize: 12,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff", cursor: "pointer",
          }}
        >
          {TOPICS.map((t) => <option key={t} value={t} style={{ background: "#1e1e2e" }}>{t}</option>)}
        </select>

        <select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
          style={{
            padding: "9px 12px", borderRadius: 10, fontSize: 12,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff", cursor: "pointer",
          }}
        >
          {DIFFS.map((d) => <option key={d} value={d} style={{ background: "#1e1e2e" }}>{d === "All" ? "All Levels" : d}</option>)}
        </select>
      </div>

      {/* Questions Grid */}
      {loading ? (
        <div className="text-center text-white/30 py-16 text-sm">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="text-center text-white/30 py-16 text-sm">No questions found. Try different filters.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {questions.map((q) => (
            <div
              key={q._id}
              onClick={() => setSelectedQuestion(q)}
              className="hover:bg-white/[0.07] cursor-pointer"
              style={{ ...cardStyle, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, transition: "all 0.2s" }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span className="text-sm font-bold text-white">{q.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{
                    background: `${diffColor[q.difficulty] || "#888"}18`,
                    color: diffColor[q.difficulty] || "#888",
                    border: `0.5px solid ${diffColor[q.difficulty] || "#888"}30`,
                  }}>
                    {q.difficulty}
                  </span>
                </div>
                <div className="text-xs text-white/40 line-clamp-1">{q.statement?.substring(0, 120)}...</div>
                <div className="flex gap-3 mt-2">
                  {q.topic && <span className="text-[10px] text-purple-400 font-semibold">{q.topic}</span>}
                  {q.companies?.slice(0, 3).map((c) => (
                    <span key={c} className="text-[10px] text-cyan-400/60">{c}</span>
                  ))}
                </div>
              </div>
              <div className="text-xs text-white/30 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {q.stats?.attempts || 0}
              </div>
              <ChevronRight className="w-4 h-4 text-white/20" />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          {Array.from({ length: Math.ceil(total / 20) }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              style={{
                width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: page === i + 1 ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
                border: page === i + 1 ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.06)",
                color: page === i + 1 ? "#a78bfa" : "#64748b", cursor: "pointer",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Import Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card max-w-[500px] w-full p-6 border-white/10 bg-[#0c0c1b] select-text relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#475569] hover:text-white bg-transparent border-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-cyan-400" />
              <span>Import LeetCode Question</span>
            </h3>
            <p className="text-xs text-[#94A3B8] font-semibold mb-6">
              Paste the LeetCode URL or problem slug below. We will parse it and structure the starter code and challenges automatically.
            </p>

            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">LeetCode URL / Slug</label>
                <input
                  type="text"
                  required
                  value={leetcodeUrl}
                  onChange={(e) => setLeetcodeUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/longest-substring-without-repeating-characters/"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    color: "#fff",
                    width: "100%",
                    outline: "none",
                    fontSize: 13,
                  }}
                  className="focus:border-[#8B5CF6] transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="btn-primary px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer border-0"
                  style={{ backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
                >
                  {importing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Import Problem</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Launch Question Modal Overlay */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card max-w-[450px] w-full p-6 border-white/10 bg-[#0c0c1b] select-text relative">
            <button
              onClick={() => setSelectedQuestion(null)}
              className="absolute top-4 right-4 text-[#475569] hover:text-white bg-transparent border-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#8B5CF6]" />
              <span>Start Practice Session</span>
            </h3>
            <p className="text-xs text-[#94A3B8] font-semibold mb-6">
              You selected <span className="text-[#a78bfa]">"{selectedQuestion.title}"</span> ({selectedQuestion.difficulty}). Select your coding language to launch the workspace.
            </p>

            <form onSubmit={handleLaunchPractice} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">Programming Language</label>
                <select
                  value={startLanguage}
                  onChange={(e) => setStartLanguage(e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    color: "#fff",
                    width: "100%",
                    outline: "none",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                  className="focus:border-[#8B5CF6] transition-colors font-semibold"
                >
                  <option value="javascript" className="bg-[#101026]">JavaScript</option>
                  <option value="python" className="bg-[#101026]">Python</option>
                  <option value="java" className="bg-[#101026]">Java</option>
                  <option value="cpp" className="bg-[#101026]">C++</option>
                  <option value="c" className="bg-[#101026]">C</option>
                  <option value="go" className="bg-[#101026]">Go</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedQuestion(null)}
                  className="px-4 py-2 text-xs font-bold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={launching}
                  className="btn-primary px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer border-0 shadow-glow"
                  style={{ backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
                >
                  {launching ? "Preparing Room..." : "Launch Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
