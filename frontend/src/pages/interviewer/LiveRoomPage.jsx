import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Send, Sparkles, Brain, 
  Code as CodeIcon, ClipboardCheck, Play, Users, BookOpen
} from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";
import useSessionStore from "../../store/sessionStore";
import { getSocket, disconnectSocket } from "../../utils/socket";
import api from "../../utils/api";

export default function LiveRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    currentSession,
    code,
    language,
    timerSeconds,
    chatMessages,
    integrityFlags,
    setSession,
    setCode,
    setLanguage,
    tickTimer,
    addChatMessage,
    addIntegrityFlag,
    resetSession
  } = useSessionStore();

  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [consoleOutput, setConsoleOutput] = useState("");

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    resetSession();

    const initRoom = async () => {
      try {
        const { data } = await api.get(`/sessions/${sessionId}`);
        setSession(data);
        setCode(data.question?.starterCode?.[data.language] || "// Syncing candidate code...");
        setLanguage(data.language || "javascript");

        // Camera feed access
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (mediaErr) {
          console.warn("Could not capture camera streams:", mediaErr.message);
          toast.error("Camera or microphone access denied");
        }

        // Connect sockets
        const socket = getSocket();
        socketRef.current = socket;

        socket.emit("session:join", { sessionId });

        // Event hooks
        socket.on("code:update", ({ code }) => {
          setCode(code);
        });

        socket.on("chat:message", (msg) => {
          addChatMessage(msg);
        });

        socket.on("integrity:flagged", ({ type }) => {
          addIntegrityFlag(type);
          toast.error(`Cheating Warning: Candidate ${type}!`, { icon: "⚠️" });
        });

        socket.on("session:ended", () => {
          toast.success("Interview session concluded");
          navigate(`/interviewer/evaluate/${sessionId}`);
        });

      } catch (err) {
        console.error("Join room error:", err);
        toast.error("Failed to load interview room workspace");
        navigate("/interviewer/dashboard");
      }
    };

    initRoom();

    const timer = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => {
      clearInterval(timer);
      disconnectSocket();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [sessionId, navigate]);

  useEffect(() => {
    if (localStreamRef.current) {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = camActive ? localStreamRef.current : null;
      }
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = camActive;
      });
    }
  }, [camActive]);

  // Synchronize interviewer edits back if needed (or keep read-only). Usually interviewer can also edit to explain logic!
  const handleCodeChange = (newVal) => {
    setCode(newVal);
    if (socketRef.current) {
      socketRef.current.emit("code:change", { sessionId, code: newVal, language });
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (socketRef.current) {
      socketRef.current.emit("chat:message", { sessionId, content: chatInput });
      setChatInput("");
    }
  };

  // Compile Code action mock
  const handleRunCode = () => {
    setConsoleOpen(true);
    setConsoleOutput("Compiling files...\n");
    setTimeout(() => {
      setConsoleOutput(
        (prev) => prev + "✔ Compiled candidate source files successfully.\nAll tests ready."
      );
    }, 800);
  };

  const handleFinishRound = () => {
    navigate(`/interviewer/evaluate/${sessionId}`);
  };

  // Clock format
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#030310] select-none text-white font-sans overflow-hidden">
      
      {/* Top Hub Control */}
      <header className="h-[54px] flex items-center justify-between px-6 border-b bg-[#060612]/95 border-white/5 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] text-white flex items-center justify-center font-black text-sm">
            D
          </div>
          <span className="text-white font-black text-sm tracking-tight hidden sm:inline">DevMeet Inter</span>
          <span className="pill text-[9px] bg-white/5 border border-white/10 text-white font-mono font-bold uppercase tracking-wider px-2 py-0.5">
            Interviewer View
          </span>
        </div>

        <div className="flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider text-[#06B6D4]">Collaborative Live</span>
          <span className="text-white/20 px-1">|</span>
          <span className="font-mono text-xs font-bold text-white">{formatTimer(timerSeconds)}</span>
        </div>

        <div className="flex items-center gap-2 select-none">
          <button 
            onClick={handleFinishRound}
            className="btn-primary text-xs py-1.5 px-4 font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            style={{ backgroundImage: "linear-gradient(135deg, #06B6D4, #8B5CF6)" }}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Evaluate Loop</span>
          </button>
        </div>
      </header>

      {/* Main Workspace panels */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* LEFT COLUMN PANEL: Camera stream boxes and chats */}
        <aside className="w-[280px] bg-[#030310]/95 border-r border-white/5 flex flex-col justify-between shrink-0 p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Candidate stream */}
            <div className="glass-card p-2 border-white/5 relative overflow-hidden h-[180px] flex items-center justify-center bg-black/40">
              <div className="absolute inset-0 flex items-center justify-center bg-[#060612] text-xs text-[#94A3B8] font-bold">
                Streaming Feed...
              </div>
            </div>

            {/* Interviewer local camera */}
            <div className="glass-card p-2 border-white/5 relative overflow-hidden h-[130px] flex items-center justify-center bg-black/40">
              <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Cheating alerts monitor */}
          <div className="flex-1 mt-4 border-t border-white/5 pt-4 flex flex-col justify-between max-h-[220px]">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">Integrity logs</h5>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-2 p-2 rounded-lg bg-black/30 border border-white/5 max-h-[140px] text-[10px]">
              {integrityFlags.length === 0 ? (
                <span className="text-[#475569] italic">No integrity warnings flagged for the candidate.</span>
              ) : (
                integrityFlags.map((flag, index) => (
                  <div key={index} className="text-rose-400 font-semibold">
                    ⚠️ Cheating Alert: {flag}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Chat with candidate..."
                className="input-field h-8 text-[11px] px-2.5 py-0 flex-1"
                style={{ borderRadius: 6 }}
              />
              <button 
                type="submit" 
                className="w-8 h-8 bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] border-0 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </form>
          </div>
        </aside>

        {/* CENTER COLUMN: CODE EDITOR & CONSOLE */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="h-10 border-b border-white/5 bg-[#060612] flex items-center justify-between px-4 select-none shrink-0 z-10">
            <div className="flex items-center gap-2">
              <CodeIcon className="w-4 h-4 text-[#06B6D4]" />
              <span className="text-xs font-bold text-white">candidate_solution.{language === "python" ? "py" : "js"}</span>
            </div>
            
            <button
              onClick={handleRunCode}
              className="btn-ghost text-[10px] py-1 px-3 border border-white/10 hover:bg-white/5 text-white rounded cursor-pointer"
            >
              Test Compiler Output
            </button>
          </div>

          <div className="flex-1 w-full bg-[#030310]">
            <Editor
              height="100%"
              defaultLanguage={language.toLowerCase()}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "Fira Code, monospace",
                lineHeight: 20,
                padding: { top: 12 },
              }}
            />
          </div>

          {/* Console logs */}
          {consoleOpen && (
            <div className="h-[120px] border-t border-white/5 bg-[#040410] flex flex-col shrink-0">
              <div className="h-8 px-4 flex justify-between items-center bg-[#070717]/85 border-b border-white/5 text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase">
                <span>Interviewer Shell Console</span>
                <button 
                  onClick={() => setConsoleOpen(false)}
                  className="bg-transparent border-0 text-[#475569] hover:text-white cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>
              <pre className="flex-1 p-4 overflow-y-auto text-[11px] font-mono text-cyan/90 leading-relaxed whitespace-pre-wrap select-text">
                {consoleOutput || "Compiler synced. Ready to receive outputs."}
              </pre>
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: Question challenge details */}
        <aside className="w-[320px] bg-[#060630]/20 border-l border-white/5 shrink-0 flex flex-col p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="glass-card p-4 border-white/5 space-y-2.5">
              <div className="flex justify-between items-center select-none">
                <span className="pill text-[8px] bg-[#06B6D4]/10 border border-[#06B6D4]/25 text-[#06B6D4] font-bold px-2 py-0.5 uppercase">
                  {currentSession?.topic || "Arrays"}
                </span>
                <span className="pill text-[8px] border border-[#8B5CF6]/25 bg-[#8B5CF6]/5 text-[#8B5CF6] font-bold px-2 py-0.5 uppercase">
                  {currentSession?.difficulty || "medium"}
                </span>
              </div>
              <h3 className="text-white text-xs font-bold leading-tight">{currentSession?.question?.title || "Challenge Statement"}</h3>
              <p className="text-[#94A3B8] text-[10px] leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-wrap font-medium">
                {currentSession?.question?.statement || "No statement compiled."}
              </p>
            </div>

            {/* Expected complexity indicator */}
            <div className="glass-card p-4 border-white/5 space-y-2 select-none">
              <span className="text-[8px] text-[#475569] font-bold uppercase">Expected Targets</span>
              <div className="grid grid-cols-2 gap-2 text-center text-[10px] mt-1">
                <div className="p-2 rounded bg-white/5 border border-white/5 font-mono text-white">
                  Time: {currentSession?.question?.expectedComplexity?.time || "O(N)"}
                </div>
                <div className="p-2 rounded bg-white/5 border border-white/5 font-mono text-white">
                  Space: {currentSession?.question?.expectedComplexity?.space || "O(1)"}
                </div>
              </div>
            </div>

            {/* Hints list preview */}
            <div className="glass-card p-4 border-white/5 space-y-3">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/5 select-none">
                <BookOpen className="w-4 h-4 text-[#F59E0B]" />
                <span>Reference Hints</span>
              </h4>

              {currentSession?.question?.hints && currentSession.question.hints.length > 0 ? (
                <div className="space-y-2">
                  {currentSession.question.hints.map((hint, idx) => (
                    <div key={idx} className="p-2.5 rounded border border-white/5 bg-white/[0.01] text-[10px] text-[#94A3B8] leading-relaxed font-semibold">
                      <span className="block text-[8px] uppercase tracking-wider text-[#475569] mb-1 font-bold">Hint {idx + 1}</span>
                      {hint}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] text-[#475569] italic">No reference hints compiled for this challenge.</p>
              )}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
