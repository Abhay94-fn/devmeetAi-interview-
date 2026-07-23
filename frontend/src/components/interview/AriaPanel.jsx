import { useRef, useEffect, useState } from "react";
import { Mic, MicOff, Brain, User } from "lucide-react";
import AriaWaveform from "./AriaWaveform";

/**
 * AriaPanel — visual AI interviewer panel for the interview room.
 *
 * Props:
 *   ariaActive     {boolean}  — is Aria session alive
 *   ariaStatus     {string}   — "idle" | "listening" | "thinking" | "speaking"
 *   ariaTranscript {Array}    — [{ role, text, timestamp }]
 *   onActivate     {function} — called when user clicks "Talk to Aria"
 *   onDeactivate   {function} — called when user clicks "Mute Aria"
 *   onSendText     {function(text)} — text fallback submit
 */
export default function AriaPanel({
  ariaActive = false,
  ariaStatus = "idle",
  ariaTranscript = [],
  onActivate,
  onDeactivate,
  onSendText,
}) {
  const transcriptEndRef = useRef(null);
  const [textInput, setTextInput] = useState("");

  // Auto-scroll transcript to latest message
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ariaTranscript]);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    if (onSendText) onSendText(textInput.trim());
    setTextInput("");
  };

  // ── Avatar rendering based on status ──────────────────────────────────
  const avatarContent = () => {
    if (ariaStatus === "speaking") return <AriaWaveform />;
    if (ariaStatus === "thinking") return <ThinkingDots />;
    return (
      <span
        className="text-2xl font-bold text-white select-none"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        A
      </span>
    );
  };

  const avatarStyle = () => {
    const base = {
      width: 80,
      height: 80,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)",
      position: "relative",
      transition: "box-shadow 0.3s ease",
    };

    if (ariaStatus === "listening") {
      return {
        ...base,
        boxShadow: "0 0 0 8px rgba(6,182,212,0.25), 0 0 0 16px rgba(6,182,212,0.1)",
        animation: "ariaPulse 1.2s ease-in-out infinite",
      };
    }
    if (ariaStatus === "idle") {
      return {
        ...base,
        animation: "ariaBreath 2s ease-in-out infinite",
      };
    }
    return base;
  };

  const statusLabel = () => {
    switch (ariaStatus) {
      case "listening": return <ListeningLabel />;
      case "thinking":  return <span className="text-sm font-medium" style={{ color: "#8B5CF6" }}>Thinking...</span>;
      case "speaking":  return <span className="text-sm font-medium" style={{ color: "#22C55E" }}>Speaking...</span>;
      default:
        return (
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Say &ldquo;Hey Aria&rdquo; to activate
          </span>
        );
    }
  };

  return (
    <>
      {/* Keyframe animations — inline so no separate CSS file needed */}
      <style>{`
        @keyframes ariaBreath {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.03); }
        }
        @keyframes ariaPulse {
          0%, 100% { box-shadow: 0 0 0 8px rgba(6,182,212,0.25), 0 0 0 16px rgba(6,182,212,0.1); }
          50%       { box-shadow: 0 0 0 12px rgba(6,182,212,0.35), 0 0 0 24px rgba(6,182,212,0.15); }
        }
        @keyframes ariaDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1; }
        }
        @keyframes ariaListenDot {
          0%, 100% { opacity: 0.3; }
          50%      { opacity: 1; }
        }
      `}</style>

      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid #06B6D4",
          borderRadius: 16,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          position: "relative",
        }}
      >
        {/* Recording indicator — top-right corner */}
        {ariaStatus === "listening" && (
          <div
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#EF4444",
              animation: "ariaListenDot 1s ease-in-out infinite",
            }}
          />
        )}

        {/* Avatar */}
        <div style={avatarStyle()}>
          {avatarContent()}
        </div>

        {/* Name + badge */}
        <div style={{ textAlign: "center" }}>
          <p className="text-white font-bold text-base">Aria</p>
          <span
            style={{
              display: "inline-block",
              background: "rgba(6,182,212,0.15)",
              color: "#06B6D4",
              border: "1px solid rgba(6,182,212,0.3)",
              borderRadius: 20,
              padding: "2px 10px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.05em",
              marginTop: 4,
            }}
          >
            AI INTERVIEWER
          </span>
        </div>

        {/* Status label */}
        <div style={{ minHeight: 20 }}>{statusLabel()}</div>

        {/* Control buttons */}
        <div className="flex gap-2 w-full">
          {ariaStatus === "idle" && (
            <button
              onClick={onActivate}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-glow"
              style={{
                background: "linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)",
                color: "#ffffff",
                border: "none",
              }}
            >
              <Mic size={15} />
              <span>Talk to Aria</span>
            </button>
          )}

          {ariaStatus === "listening" && (
            <button
              onClick={onDeactivate}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer animate-pulse"
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid #EF4444",
                color: "#EF4444",
              }}
            >
              <MicOff size={15} />
              <span>Stop & Send Voice</span>
            </button>
          )}

          {ariaStatus === "thinking" && (
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all"
              style={{
                background: "rgba(139, 92, 246, 0.15)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                color: "#8B5CF6",
                cursor: "not-allowed",
              }}
            >
              <Brain size={15} className="animate-spin" />
              <span>Thinking...</span>
            </button>
          )}

          {ariaStatus === "speaking" && (
            <button
              onClick={onDeactivate}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid #EF4444",
                color: "#EF4444",
              }}
            >
              <MicOff size={15} />
              <span>Mute Aria</span>
            </button>
          )}
        </div>

        {/* Text fallback input */}
        <form onSubmit={handleTextSubmit} className="w-full flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type to Aria..."
            className="flex-1 text-sm rounded-lg px-3 py-2 outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "white",
            }}
          />
          <button
            type="submit"
            disabled={!textInput.trim()}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: textInput.trim() ? "#06B6D4" : "rgba(6,182,212,0.2)",
              color: textInput.trim() ? "white" : "rgba(255,255,255,0.3)",
              border: "none",
              cursor: textInput.trim() ? "pointer" : "not-allowed",
            }}
          >
            Send
          </button>
        </form>

        {/* Conversation transcript */}
        {ariaTranscript.length > 0 && (
          <div
            style={{
              width: "100%",
              maxHeight: 200,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 4,
            }}
          >
            {ariaTranscript.map((turn, idx) => (
              <TranscriptMessage key={idx} turn={turn} />
            ))}
            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function TranscriptMessage({ turn }) {
  const isAria = turn.role === "aria";
  const time = turn.timestamp
    ? new Date(turn.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="flex items-start gap-2">
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: isAria
            ? "linear-gradient(135deg, #06B6D4, #8B5CF6)"
            : "linear-gradient(135deg, #8B5CF6, #6366F1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {isAria ? <Brain size={11} color="white" /> : <User size={11} color="white" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 12,
            color: isAria ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.65)",
            lineHeight: 1.4,
            wordBreak: "break-word",
          }}
        >
          {turn.text}
        </p>
      </div>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0, marginTop: 2 }}>
        {time}
      </span>
    </div>
  );
}

function ThinkingDots() {
  const dots = [0, 0.15, 0.3];
  return (
    <div className="flex items-center gap-1">
      {dots.map((delay, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#8B5CF6",
            animation: `ariaDot 1.2s ${delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

function ListeningLabel() {
  return (
    <span className="flex items-center gap-1 text-sm font-medium" style={{ color: "#06B6D4" }}>
      Listening
      {[0, 0.2, 0.4].map((delay, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            animation: `ariaListenDot 1s ${delay}s ease-in-out infinite`,
          }}
        >
          .
        </span>
      ))}
    </span>
  );
}
