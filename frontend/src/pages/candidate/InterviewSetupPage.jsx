// frontend/src/pages/candidate/InterviewSetupPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Code2, Zap, ArrowRight, ArrowLeft, Sparkles, FileText, Upload, Check } from "lucide-react";
import api from "../../utils/api";
import LANGUAGES, { getLanguageById } from "../../utils/languages";
import toast from "react-hot-toast";

const TOPICS = [
  { id: "Arrays", label: "Arrays & Hashing", icon: "📊" },
  { id: "Strings", label: "Strings", icon: "🔤" },
  { id: "Linked Lists", label: "Linked Lists", icon: "🔗" },
  { id: "Stacks", label: "Stacks & Queues", icon: "📚" },
  { id: "Trees", label: "Trees & BST", icon: "🌳" },
  { id: "Graphs", label: "Graphs", icon: "🕸️" },
  { id: "Dynamic Programming", label: "Dynamic Programming", icon: "🧮" },
  { id: "Two Pointers", label: "Two Pointers", icon: "👈👉" },
  { id: "Sliding Window", label: "Sliding Window", icon: "🪟" },
  { id: "Binary Search", label: "Binary Search", icon: "🔍" },
  { id: "leetcode_custom", label: "Custom LeetCode", icon: "🌐" },
];

const DIFFICULTIES = [
  { id: "beginner", label: "Beginner", color: "#10B981", desc: "Easy fundamentals" },
  { id: "intermediate", label: "Intermediate", color: "#F59E0B", desc: "Medium complexity" },
  { id: "senior", label: "Senior", color: "#EF4444", desc: "Hard challenges" },
];

const cardStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  backdropFilter: "blur(12px)",
};

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [language, setLanguage] = useState("javascript");
  const [isCreating, setIsCreating] = useState(false);
  const [leetcodeUrl, setLeetcodeUrl] = useState("");

  // Resume Upload
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedResumeName, setUploadedResumeName] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile) {
      return toast.error("Please select a file first");
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const { data } = await api.post("/profile/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUploadedResumeName(resumeFile.name);
      toast.success("Resume uploaded and parsed successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  const handleStart = async () => {
    if (!topic) return toast.error("Select a topic first");
    setIsCreating(true);

    if (topic === "leetcode_custom") {
      if (!leetcodeUrl) {
        setIsCreating(false);
        return toast.error("Please enter a LeetCode URL or problem slug first");
      }
      const loadId = toast.loading("🤖 Fetching and parsing LeetCode details via Gemini...");
      try {
        const importRes = await api.post("/questions/import-leetcode", { url: leetcodeUrl });
        const importedQuestion = importRes.data;

        // Now create session using the imported questionId
        const { data } = await api.post("/sessions/create", {
          topic: importedQuestion.topic || "LeetCode",
          difficulty: importedQuestion.difficulty || difficulty,
          language,
          questionId: importedQuestion._id,
        });

        toast.dismiss(loadId);
        toast.success("LeetCode sandbox created!");
        navigate(`/interview/${data._id}`);
      } catch (err) {
        toast.dismiss(loadId);
        toast.error(err.response?.data?.message || "Failed to import LeetCode question");
      } finally {
        setIsCreating(false);
      }
      return;
    }

    const loadId = toast.loading("🤖 Personalizing your coding sandbox question...");
    try {
      const { data } = await api.post("/sessions/create", {
        topic,
        difficulty,
        language,
      });
      toast.dismiss(loadId);
      toast.success("Interview sandbox created!");
      navigate(`/interview/${data._id}`);
    } catch (err) {
      toast.dismiss(loadId);
      toast.error(err.response?.data?.message || "Failed to create session");
    } finally {
      setIsCreating(false);
    }
  };

  const canNext = () => {
    if (step === 1) {
      if (topic === "leetcode_custom") {
        return !!leetcodeUrl && !!language;
      }
      return !!topic && !!difficulty && !!language;
    }
    return true;
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }} className="select-none py-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          AI Mock Interview Setup
        </h1>
        <p className="text-sm text-white/50 mt-1">Configure your mock interview sandbox in 3 steps</p>
      </div>

      {/* Progress Steps */}
      <div className="flex gap-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 99,
              background: s <= step ? "linear-gradient(90deg, #8B5CF6, #06B6D4)" : "rgba(255,255,255,0.08)",
              transition: "background 0.4s",
            }}
          />
        ))}
      </div>

      {/* Step 1: Topic + Difficulty + Language */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Choose Topic</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTopic(t.id)}
                  style={{
                    ...cardStyle,
                    padding: "16px 14px",
                    cursor: "pointer",
                    textAlign: "left",
                    outline: topic === t.id ? "2px solid #8B5CF6" : "none",
                    background: topic === t.id ? "rgba(139,92,246,0.1)" : cardStyle.background,
                    transition: "all 0.2s",
                  }}
                  className="hover:border-[#8B5CF6]/30"
                >
                  <span className="text-2xl">{t.icon}</span>
                  <div className="text-sm font-semibold text-white mt-2">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Difficulty Tier</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  style={{
                    ...cardStyle,
                    padding: "18px 16px",
                    cursor: "pointer",
                    textAlign: "center",
                    outline: difficulty === d.id ? `2px solid ${d.color}` : "none",
                    background: difficulty === d.id ? `${d.color}15` : cardStyle.background,
                    transition: "all 0.2s",
                  }}
                >
                  <div className="text-sm font-bold" style={{ color: d.color }}>{d.label}</div>
                  <div className="text-xs text-white/40 mt-1">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Coding Language</h2>
            <div className="flex flex-wrap gap-2.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className="pill cursor-pointer font-bold text-xs"
                  style={{
                    outline: language === lang.id ? "1.5px solid #8B5CF6" : "none",
                    background: language === lang.id ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)",
                    color: language === lang.id ? "#8B5CF6" : "#94A3B8",
                  }}
                >
                  <span className="mr-1">{lang.icon}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {topic === "leetcode_custom" && (
            <div className="mt-4 glass-card p-5 border-white/5 space-y-2" style={{ background: "rgba(255,255,255,0.01)" }}>
              <label className="block text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1.5">LeetCode URL / Problem Slug</label>
              <input
                type="text"
                required
                value={leetcodeUrl}
                onChange={(e) => setLeetcodeUrl(e.target.value)}
                placeholder="e.g. https://leetcode.com/problems/longest-substring-without-repeating-characters/"
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
          )}
        </div>
      )}

      {/* Step 2: Resume PDF upload dropzone */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Step 2 — Personalize with Resume</h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
              Upload your PDF resume so the Gemini AI model can parse your background stack, experience level, and generate tailored challenge questions.
            </p>

            <div 
              className="glass-card p-8 border-dashed border-2 border-white/10 hover:border-[#8B5CF6]/50 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition relative"
              style={{ background: "rgba(255,255,255,0.01)" }}
            >
              <input 
                type="file" 
                accept=".pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <Upload className="w-8 h-8 text-[#8B5CF6] mb-3" />
              <h4 className="text-xs font-bold text-white mb-1">
                {resumeFile ? resumeFile.name : "Select or Drop PDF Resume"}
              </h4>
              <p className="text-[10px] text-[#475569]">Supports PDF formats up to 5MB.</p>
            </div>

            {resumeFile && !uploadedResumeName && (
              <button
                onClick={handleUploadResume}
                disabled={uploading}
                className="btn-primary mt-4 py-2 px-6 text-xs font-bold w-full rounded-xl cursor-pointer"
                style={{ backgroundImage: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
              >
                {uploading ? "Analyzing resume context..." : "Upload & Parse Context"}
              </button>
            )}

            {uploadedResumeName && (
              <div className="mt-4 p-3.5 rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 text-[#10B981] text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Uploaded and mapped: {uploadedResumeName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Summary + Start */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Step 3 — Verification Summary</h2>

          <div style={{ ...cardStyle, padding: 24 }} className="space-y-4">
            <div className="grid grid-cols-3 gap-6 text-center select-none">
              <div>
                <span className="text-[10px] text-[#475569] font-bold uppercase">Topic</span>
                <h4 className="text-sm font-bold text-white mt-1.5">{topic}</h4>
              </div>
              <div>
                <span className="text-[10px] text-[#475569] font-bold uppercase">Difficulty</span>
                <h4 className="text-sm font-bold text-white mt-1.5 capitalize">{difficulty}</h4>
              </div>
              <div>
                <span className="text-[10px] text-[#475569] font-bold uppercase">IDE Language</span>
                <h4 className="text-sm font-bold text-white mt-1.5">{getLanguageById(language)?.name}</h4>
              </div>
            </div>

            {uploadedResumeName && (
              <div className="p-3 border-t border-white/5 mt-4 text-xs text-[#94A3B8] font-medium flex items-center gap-2 justify-center">
                <FileText className="w-4 h-4 text-[#8B5CF6]" />
                <span>Tailoring questions based on: {uploadedResumeName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between mt-8 select-none">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            cursor: step === 1 ? "not-allowed" : "pointer",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: step === 1 ? "rgba(255,255,255,0.2)" : "#fff",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {step < 3 ? (
          <button
            onClick={() => canNext() && setStep(step + 1)}
            disabled={!canNext()}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              cursor: canNext() ? "pointer" : "not-allowed",
              background: canNext() ? "linear-gradient(135deg, #8B5CF6, #06B6D4)" : "rgba(255,255,255,0.06)",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              opacity: canNext() ? 1 : 0.4,
            }}
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isCreating}
            style={{
              padding: "10px 28px",
              borderRadius: 10,
              cursor: "pointer",
              background: "linear-gradient(135deg, #22c55e, #06B6D4)",
              border: "none",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 700,
              opacity: isCreating ? 0.6 : 1,
            }}
          >
            {isCreating ? "Personalizing..." : "Start Practice Session"} <Zap className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
