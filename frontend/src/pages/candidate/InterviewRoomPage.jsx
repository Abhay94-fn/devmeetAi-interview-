// frontend/src/pages/candidate/InterviewRoomPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  Play, Square, Lightbulb, Send, Clock, ArrowLeft,
  Brain, Mic, MicOff, Video, VideoOff
} from "lucide-react";
import api from "../../utils/api";
import useSessionStore from "../../store/sessionStore";
import useAuthStore from "../../store/authStore";
import { getSocket } from "../../utils/socket";
import LANGUAGES, { getLanguageById, getStarterCode } from "../../utils/languages";
import toast from "react-hot-toast";
import AriaPanel from "../../components/interview/AriaPanel";
import useAria from "../../hooks/useAria";

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function InterviewRoomPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const editorRef = useRef(null);

  const user = useAuthStore((state) => state.user);

  const {
    currentSession, setSession, code, setCode, language, setLanguage,
    aiAnalysis, setAiAnalysis, hints, addHint,
    timerSeconds, tickTimer,
    output, setOutput, isRunning, setRunning, executionStatus, setExecutionStatus,
    chatMessages, addChatMessage,
    resetSession,
  } = useSessionStore();

  const [loading, setLoading] = useState(true);
  const [hintLevel, setHintLevel] = useState(0);
  const [hintLoading, setHintLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [activeTab, setActiveTab] = useState("problem");
  const [errorLineInfo, setErrorLineInfo] = useState(null);
  const [aiExplanationData, setAiExplanationData] = useState("");
  // socketInstance state lets useAria re-receive the socket once it connects
  const [socketInstance, setSocketInstance] = useState(null);

  // Media states
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);
  const isExternalUpdate = useRef(false);

  const debouncedAnalyze = useRef(
    debounce((codeVal, langVal, sidVal) => {
      if (socketRef.current && codeVal?.trim().length >= 10) {
        socketRef.current.emit("code:analyze", { sessionId: sidVal, code: codeVal, language: langVal });
      }
    }, 2000)
  ).current;

  // Aria hook — receives socket via state (not ref) so listeners register properly
  const aria = useAria({
    socket: socketInstance,
    sessionId,
    onTranscript: (turn) => {
      // Mirror Aria transcript turns into the chat panel
      addChatMessage({
        from: turn.role === "aria" ? "Aria" : user?.name || "You",
        role: turn.role === "aria" ? "interviewer" : "candidate",
        content: turn.text,
        timestamp: turn.timestamp,
      });
    },
  });

  // Keep a stable ref so aria can be called from event handlers below
  const ariaRef = useRef(aria);
  useEffect(() => { ariaRef.current = aria; }, [aria]);

  // ── Load session ────────────────────────────────────────────────────
  useEffect(() => {
    resetSession();
    const fetchSession = async () => {
      try {
        const { data } = await api.get(`/sessions/${sessionId}`);
        setSession(data);
        const lang = data.language || "javascript";
        setLanguage(lang);
        const starter = data.question?.starterCode?.[lang] || getStarterCode(lang);
        setCode(starter);
        setLoading(false);
        if (data.status === "waiting") {
          await api.patch(`/sessions/${sessionId}/start`);
        }
      } catch {
        toast.error("Failed to load interview session");
        navigate("/dashboard");
      }
    };
    fetchSession();
  }, [sessionId]);

  // ── Camera stream ───────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    let active = true;

    const startCamera = async () => {
      // Check permission first — avoids the console error in Edge when denied
      try {
        const perm = await navigator.permissions?.query({ name: "camera" });
        if (perm?.state === "denied") return; // silently skip, no error
      } catch {
        // permissions API not supported — proceed anyway
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err) {
        // NotAllowedError is expected when camera is blocked — no console.warn needed
        if (err.name !== "NotAllowedError" && err.name !== "NotFoundError") {
          console.warn("Camera unavailable:", err.message);
        }
      }
    };

    startCamera();
    return () => {
      active = false;
      setLocalStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop());
        return null;
      });
    };
  }, [loading]);

  // Ensure video element srcObject is attached whenever cameraEnabled or localStream updates
  useEffect(() => {
    if (cameraEnabled && localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = cameraEnabled;
      });
    }
  }, [cameraEnabled, localStream]);

  // ── Socket setup ────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const socket = getSocket();
    socketRef.current = socket;

    socket.emit("session:join", {
      sessionId,
      question: currentSession?.question,
      topic: currentSession?.topic,
      difficulty: currentSession?.difficulty,
    });

    socket.on("ai:analysis", (data) => {
      setAiAnalysis(data);
      toast.success("AI code metrics updated!");
    });
    socket.on("ai:hint-result", (data) => {
      addHint(data);
      setHintLoading(false);
      toast.success("New hint revealed!");
    });
    socket.on("code:update", ({ code: newCode, language: newLang }) => {
      isExternalUpdate.current = true;
      setCode(newCode);
      if (newLang) setLanguage(newLang);
    });
    socket.on("chat:message", (msg) => addChatMessage(msg));
    socket.on("session:ended", () => {
      toast("Interview completed!", { icon: "✅" });
      navigate(`/report/${sessionId}`);
    });

    // Expose socket to useAria AFTER all non-Aria listeners are registered.
    // useAria registers aria:ready in a useEffect that runs after this state update,
    // so we delay aria:start by one tick to guarantee the listener is attached first.
    setSocketInstance(socket);

    return () => {
      socket.off("ai:analysis");
      socket.off("ai:hint-result");
      socket.off("code:update");
      socket.off("chat:message");
      socket.off("session:ended");
      socket.emit("aria:stop", { sessionId });
    };
  }, [loading, sessionId]);

  // ── Timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // ── Sync code changes to Aria so it always sees the latest snapshot ──
  useEffect(() => {
    if (!socketRef.current || !sessionId || !code) return;
    socketRef.current.emit("aria:code-update", { sessionId, code, language });
  }, [code, language]);

  // ── Fire aria:start only after socketInstance is set (useAria listeners ready) ──
  useEffect(() => {
    if (!socketInstance || !currentSession) return;
    socketInstance.emit("aria:start", {
      sessionId,
      sessionContext: {
        questionTitle: currentSession?.question?.title || "Coding Challenge",
        questionStatement: currentSession?.question?.statement || "",
        difficulty: currentSession?.difficulty || "intermediate",
        topic: currentSession?.topic || "General",
        language: currentSession?.language || "javascript",
        skills: [],
        experienceLevel: "Intermediate",
        currentCode: "",
      },
    });
  // Run once when socketInstance first becomes available
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketInstance]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };

  // ── Monaco Error Marker Helpers ─────────────────────────────────────
  const applyMonacoErrorMarker = (line, col, message) => {
    if (editorRef.current && window.monaco && line) {
      const monaco = window.monaco;
      const model = editorRef.current.getModel();
      monaco.editor.setModelMarkers(model, "error", [
        {
          startLineNumber: line,
          startColumn: col || 1,
          endLineNumber: line,
          endColumn: 1000,
          message: message || "Error in code execution",
          severity: monaco.MarkerSeverity.Error,
        },
      ]);
      try {
        editorRef.current.revealLineInCenter(line);
      } catch (_) {}
    }
  };

  const clearMonacoErrorMarkers = () => {
    if (editorRef.current && window.monaco) {
      window.monaco.editor.setModelMarkers(editorRef.current.getModel(), "error", []);
    }
  };

  // ── In-browser code execution fallback ──────────────────────────────
  const executeCodeInBrowser = async () => {
    setErrorLineInfo(null);
    setAiExplanationData("");
    clearMonacoErrorMarkers();

    if (language === "javascript" || language === "typescript") {
      const logs = [];
      const captureConsole = {
        log: (...a) => logs.push(a.map((x) => (typeof x === "object" ? JSON.stringify(x, null, 2) : String(x))).join(" ")),
        error: (...a) => logs.push("[ERROR] " + a.map((x) => String(x)).join(" ")),
        warn: (...a) => logs.push("[WARN] " + a.map((x) => String(x)).join(" ")),
        info: (...a) => logs.push(a.map((x) => String(x)).join(" ")),
      };

      try {
        const runner = new Function("console", code);
        const res = runner(captureConsole);
        let out = logs.join("\n");
        if (res !== undefined && !out.includes(String(res))) {
          out = out ? `${out}\n-> ${typeof res === "object" ? JSON.stringify(res) : res}` : `-> ${res}`;
        }
        setOutput(out || "Code executed successfully with no output.");
        setExecutionStatus("Accepted");
      } catch (err) {
        const msg = err.stack || err.message || String(err);
        setOutput(msg);
        setExecutionStatus(err.name || "Runtime Error");

        // Extract line and column numbers
        let line = null;
        let col = null;
        const match = msg.match(/<anonymous>:(\d+):(\d+)/) || msg.match(/line (\d+)/i) || msg.match(/:(\d+):(\d+)/);
        if (match) {
          line = parseInt(match[1], 10);
          if (match[2]) col = parseInt(match[2], 10);
        }

        if (line) {
          setErrorLineInfo({ line, column: col });
          applyMonacoErrorMarker(line, col, err.message);
        }

        setAiExplanationData(
          `On Line ${line || "?"}: ${err.name || "Error"} occurred ("${err.message}"). Review variable declarations and syntax around line ${line || 1}.`
        );
      }
      return;
    }

    if (language === "python") {
      try {
        if (!window.loadPyodide) {
          setOutput("Downloading Pyodide WASM compiler...");
          await new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src = "https://cdn.jsdelivr.net/pyodide/v0.26.0/full/pyodide.js";
            s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
          });
        }
        const py = window.pyodideInstance || (window.pyodideInstance = await window.loadPyodide());
        let pyLogs = [];
        py.setStdout({ batched: (str) => pyLogs.push(str) });
        setOutput("Executing Python...\n");
        await py.runPythonAsync(code);
        setOutput(pyLogs.join("\n") || "Python code executed successfully.");
        setExecutionStatus("Accepted");
      } catch (err) {
        const msg = err.message || String(err);
        setOutput(msg);
        setExecutionStatus("Python Error");
        let line = null;
        const match = msg.match(/File "<exec>", line (\d+)/) || msg.match(/line (\d+)/i);
        if (match) {
          line = parseInt(match[1], 10);
          setErrorLineInfo({ line, column: 1 });
          applyMonacoErrorMarker(line, 1, msg);
        }
        setAiExplanationData(
          `Python Error on Line ${line || "?"}: ${msg.slice(0, 200)}. Check indentation and variable definitions.`
        );
      }
      return;
    }

    setOutput(`Browser execution not supported for ${language}. Server compilation available via Judge0.`);
    setExecutionStatus("Error");
  };

  const handleRunCode = async () => {
    setRunning(true);
    setShowOutput(true);
    setOutput("Executing code...");
    setExecutionStatus("");
    setErrorLineInfo(null);
    setAiExplanationData("");
    clearMonacoErrorMarkers();

    try {
      const { data } = await api.post(`/sessions/${sessionId}/run`, { code, language });
      if (data.status === "No Key") {
        await executeCodeInBrowser();
      } else {
        if (data.stderr) {
          setOutput(data.stderr);
          setExecutionStatus(data.status || "Error");
          if (data.line) {
            setErrorLineInfo({ line: data.line, column: data.column });
            applyMonacoErrorMarker(data.line, data.column, data.stderr);
          }
          if (data.aiExplanation) {
            setAiExplanationData(data.aiExplanation);
          }
        } else {
          setOutput(data.stdout || "Execution completed with no output.");
          setExecutionStatus(data.status || "Accepted");
        }
      }
    } catch {
      await executeCodeInBrowser();
    } finally {
      setRunning(false);
    }
  };

  const handleAnalyze = () => {
    socketRef.current?.emit("code:analyze", { sessionId, code, language });
  };

  const handleHint = () => {
    const next = Math.min(hintLevel + 1, 3);
    setHintLevel(next);
    setHintLoading(true);
    socketRef.current?.emit("ai:hint-request", { sessionId, code, hintLevel: next });
  };

  const handleSendChat = () => {
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit("chat:message", { sessionId, content: chatInput.trim() });
    setChatInput("");
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const starter = currentSession?.question?.starterCode?.[newLang] || getStarterCode(newLang);
    setCode(starter);
    socketRef.current?.emit("code:change", { sessionId, code: starter, language: newLang });
  };

  const handleEndSession = async () => {
    const id = toast.loading("Submitting session...");
    try {
      await api.post(`/sessions/${sessionId}/code`, { code, language });
      await api.post("/reports/generate", { sessionId });
      socketRef.current?.emit("session:end", { sessionId });
      toast.dismiss(id);
      toast.success("Session completed!");
      navigate(`/report/${sessionId}`);
    } catch {
      toast.dismiss(id);
      toast.error("Failed to end session");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030310] flex items-center justify-center">
        <div className="text-white/50 text-xs font-bold animate-pulse">Loading interview room...</div>
      </div>
    );
  }

  const question = currentSession?.question;
  const analysis = aiAnalysis || { timeComplexity: "N/A", spaceComplexity: "N/A", quality: 0, suggestions: [] };

  return (
    <div className="fixed inset-0 flex flex-col select-none bg-[#030310] text-white">

      {/* ── Top Bar ── */}
      <header className="h-[54px] w-full flex items-center justify-between px-6 border-b border-white/5 bg-white/[0.01] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-1.5 hover:bg-white/5 text-white/50 hover:text-white rounded-lg transition">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold">{question?.title || "Mock Sandbox"}</span>
          <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full px-2 py-0.5 font-bold uppercase">
            {currentSession?.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{formatTime(timerSeconds)}</span>
          </div>

          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg text-white text-xs px-2.5 py-1 outline-none cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id} className="bg-[#101026]">{l.icon} {l.name}</option>
            ))}
          </select>

          <button
            onClick={handleEndSession}
            className="py-1.5 px-4 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer bg-red-600/15 border border-red-500/20 text-red-400 hover:bg-red-500/25 transition"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            End Session
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left Sidebar: Aria + Camera + Controls ── */}
        <aside className="w-[280px] shrink-0 border-r border-white/5 bg-[#030310]/80 p-4 flex flex-col gap-4 overflow-y-auto">

          {/* Aria Panel — replaces old "DevMeet AI" card */}
          <AriaPanel
            ariaActive={aria.ariaActive}
            ariaStatus={aria.ariaStatus}
            ariaTranscript={aria.ariaTranscript}
            onActivate={aria.activateAria}
            onDeactivate={aria.deactivateAria}
            onSendText={aria.sendTextToAria}
          />

          {/* Local camera preview */}
          <div
            className="rounded-xl border border-white/5 bg-[#060616] aspect-video flex items-center justify-center overflow-hidden relative"
          >
            {cameraEnabled && localStream ? (
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundImage: "linear-gradient(135deg,#8B5CF6,#EC4899)" }}
              >
                {getInitials(user?.name)}
              </div>
            )}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
              <span className="text-[8px] bg-black/60 border border-white/5 rounded-full py-0.5 px-2 font-bold text-white">You</span>
              {!micEnabled && <MicOff className="w-3 h-3 text-red-400" />}
            </div>
          </div>

          {/* Mic / Camera toggles */}
          <div className="flex justify-center gap-3 pt-2 border-t border-white/5">
            <button
              onClick={() => setMicEnabled(!micEnabled)}
              className={`w-9 h-9 rounded-full flex items-center justify-center border cursor-pointer transition ${
                micEnabled ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-red-600/10 border-red-500/20 text-red-400"
              }`}
            >
              {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setCameraEnabled(!cameraEnabled)}
              className={`w-9 h-9 rounded-full flex items-center justify-center border cursor-pointer transition ${
                cameraEnabled ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-red-600/10 border-red-500/20 text-red-400"
              }`}
            >
              {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>
        </aside>

        {/* ── Center: Monaco Editor + Console ── */}
        <section className="flex-1 flex flex-col overflow-hidden bg-[#060612]">
          {/* Editor toolbar */}
          <div className="h-9 w-full flex items-center justify-between px-4 border-b border-white/5 bg-white/[0.005]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white/50 font-mono">solution.{language}</span>
              <span className="text-[8px] bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full px-2 font-mono">{language}</span>
            </div>
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="text-[10px] py-1 px-3.5 rounded flex items-center gap-1 cursor-pointer border-0 text-white font-bold"
              style={{ backgroundImage: "linear-gradient(135deg,#10B981,#06B6D4)" }}
            >
              {isRunning ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Play className="w-3 h-3 fill-current" /><span>Run Code</span></>
              )}
            </button>
          </div>

          {/* Monaco editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={getLanguageById(language)?.monacoId || "javascript"}
              value={code}
              onChange={(v) => {
                if (isExternalUpdate.current) {
                  isExternalUpdate.current = false;
                  return;
                }
                const newVal = v || "";
                setCode(newVal);
                socketRef.current?.emit("code:change", { sessionId, code: newVal, language });
                debouncedAnalyze(newVal, language, sessionId);
              }}
              onMount={(editor) => { editorRef.current = editor; }}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                lineNumbers: "on",
                cursorBlinking: "smooth",
                automaticLayout: true,
              }}
            />
          </div>

          {/* Console output & Error Diagnostics */}
          <div className="h-[220px] flex flex-col border-t border-white/5 bg-[#03030b]">
            <div className="h-9 flex items-center justify-between px-4 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowOutput(true)}
                  className={`text-[10px] font-bold uppercase tracking-wider bg-transparent border-0 cursor-pointer ${
                    showOutput ? "text-[#8B5CF6]" : "text-[#475569] hover:text-white"
                  }`}
                >
                  Console Output
                </button>
                {errorLineInfo?.line && (
                  <span
                    onClick={() => applyMonacoErrorMarker(errorLineInfo.line, errorLineInfo.column, output)}
                    className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded cursor-pointer hover:bg-amber-500/20 transition flex items-center gap-1"
                    title="Click to highlight and jump to error line in editor"
                  >
                    📍 Error on Line {errorLineInfo.line}{errorLineInfo.column ? `, Col ${errorLineInfo.column}` : ""} (Jump)
                  </span>
                )}
              </div>
              {executionStatus && (
                <span className={`text-[8px] rounded-full border font-bold uppercase px-2.5 py-0.5 ${
                  executionStatus === "Accepted" || executionStatus === "Done"
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                    : "border-red-500/20 bg-red-500/5 text-red-400"
                }`}>
                  {executionStatus}
                </span>
              )}
            </div>

            <div className="flex-1 p-3.5 font-mono text-xs overflow-y-auto space-y-3 text-[#94A3B8]">
              {showOutput ? (
                <>
                  {output ? (
                    <pre className={`whitespace-pre-wrap m-0 leading-relaxed p-3 rounded-lg border text-xs font-mono ${
                      executionStatus === "Accepted" || executionStatus === "Done"
                        ? "bg-white/[0.02] border-white/5 text-emerald-300"
                        : "bg-red-500/[0.04] border-red-500/10 text-red-300"
                    }`}>
                      {output}
                    </pre>
                  ) : (
                    <p className="text-[#475569] italic m-0">Run code to see output.</p>
                  )}

                  {/* 🤖 AI Error Breakdown Card */}
                  {aiExplanationData && (
                    <div className="p-3.5 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                        <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>🤖 AI Error Diagnostic Assistant</span>
                      </div>
                      <p className="text-[11px] text-white/90 leading-relaxed font-sans m-0 whitespace-pre-wrap">
                        {aiExplanationData}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-white">TEST CASES:</p>
                  <div className="text-emerald-400">✓ Test 1: Standard input</div>
                  <div className="text-emerald-400">✓ Test 2: Empty array edge case</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Right Sidebar: Problem / Hints / Chat + AI Analysis ── */}
        <aside className="w-[320px] shrink-0 border-l border-white/5 bg-white/[0.005] p-4 flex flex-col gap-4 overflow-y-auto">

          {/* Tab selector */}
          <div className="flex border-b border-white/5 pb-2">
            {["problem", "hints", "chat"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 text-[10px] font-bold uppercase tracking-wider bg-transparent border-0 cursor-pointer text-center py-1 ${
                  activeTab === tab ? "text-[#8B5CF6]" : "text-[#475569] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Problem tab */}
          {activeTab === "problem" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4 space-y-3">
                <h4 className="text-white text-xs font-bold">{question?.title}</h4>
                <p className="text-[#94A3B8] text-[10px] leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {question?.statement}
                </p>
              </div>
              {question?.expectedComplexity && (
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs text-[#94a3b8] space-y-1">
                  <span className="text-[8px] font-bold text-[#475569] uppercase block mb-1">Expected Complexity</span>
                  <div>Time: <span className="text-cyan-400 font-mono">{question.expectedComplexity.time}</span></div>
                  <div>Space: <span className="text-cyan-400 font-mono">{question.expectedComplexity.space}</span></div>
                </div>
              )}
            </div>
          )}

          {/* Hints tab */}
          {activeTab === "hints" && (
            <div className="space-y-4">
              <h5 className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Hints ({hintLevel}/3)</h5>
              <button
                onClick={handleHint}
                disabled={hintLevel >= 3 || hintLoading}
                className="w-full py-2 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-[#a78bfa] rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                {hintLoading ? "Revealing..." : hintLevel >= 3 ? "All hints used" : `Get Hint ${hintLevel + 1}`}
              </button>
              {hints.map((h, i) => (
                <div key={i} className="p-3 rounded-lg border border-amber-500/10 bg-amber-500/5 text-amber-400 text-[10px] leading-relaxed">
                  <strong className="block mb-1">Hint {h.level}:</strong>
                  {h.hint}
                </div>
              ))}
            </div>
          )}

          {/* Chat tab */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className="space-y-1">
                    <span className="text-[9px] font-bold" style={{ color: msg.role === "interviewer" ? "#06B6D4" : "#8B5CF6" }}>
                      {msg.from || msg.role}
                    </span>
                    <div className="text-xs text-white/80 leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5">
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 border-t border-white/5 pt-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Type to chat..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg text-xs px-3 py-2 outline-none text-white focus:border-[#8B5CF6]"
                />
                <button
                  onClick={handleSendChat}
                  className="p-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 hover:bg-[#8b5cf6]/20 text-[#a78bfa] rounded-lg cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Static AI code analysis */}
          <hr className="border-white/5" />
          <div className="space-y-3">
            <button
              onClick={handleAnalyze}
              className="w-full py-2 bg-[#06B6D4]/10 border border-[#06B6D4]/20 hover:bg-[#06B6D4]/20 text-[#06B6D4] rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 transition"
            >
              <Brain className="w-4 h-4" />
              Static Code Review
            </button>
            {analysis.quality > 0 && (
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold">
                {[
                  { label: "Time", val: analysis.timeComplexity, cls: "text-white font-mono" },
                  { label: "Space", val: analysis.spaceComplexity, cls: "text-white font-mono" },
                  { label: "Quality", val: `${analysis.quality}%`, cls: "text-emerald-400 font-bold" },
                ].map(({ label, val, cls }) => (
                  <div key={label} className="rounded-xl border border-white/5 bg-white/[0.03] p-2">
                    <span className="text-[7px] text-[#475569] font-bold block mb-1">{label}</span>
                    <span className={`block truncate ${cls}`}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </aside>
      </div>
    </div>
  );
}
