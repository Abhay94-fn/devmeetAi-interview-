import { useState, useRef, useCallback, useEffect } from "react";
import toast from "react-hot-toast";

/**
 * useAria — Aria AI interview assistant.
 *
 * Fixes applied:
 *  - All socket listeners re-register whenever `socket` prop changes (no stale null)
 *  - All mutable values accessed via refs inside callbacks (no stale closures)
 *  - Mic permission requested explicitly before SpeechRecognition starts (Edge fix)
 *  - Wake-word and active-listen use separate SR instances (no conflicts)
 *  - SpeechSynthesis plays Aria's reply out loud
 */
export default function useAria({ socket, sessionId, onTranscript }) {
  const [ariaActive, setAriaActive]       = useState(false);
  const [ariaStatus, setAriaStatus]       = useState("idle");
  const [ariaTranscript, setAriaTranscript] = useState([]);
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);

  // ── Stable refs (never go stale inside callbacks) ──────────────────
  const socketRef         = useRef(socket);
  const sessionIdRef      = useRef(sessionId);
  const onTranscriptRef   = useRef(onTranscript);
  const ariaStatusRef     = useRef("idle");
  const wakeEnabledRef    = useRef(false);
  const isListeningRef    = useRef(false);
  const wakeRecRef        = useRef(null);
  const listenRecRef      = useRef(null);
  const micStreamRef      = useRef(null);  // reused mic stream

  // Keep refs in sync on every render
  useEffect(() => { socketRef.current     = socket; },      [socket]);
  useEffect(() => { sessionIdRef.current  = sessionId; },   [sessionId]);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);

  // Wrap setAriaStatus so the ref stays current too
  const setStatus = useCallback((s) => {
    ariaStatusRef.current = s;
    setAriaStatus(s);
  }, []);

  // ── SpeechSynthesis — Aria speaks ────────────────────────────────────
  const speakText = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    // Small delay to allow browser to clear speech queue before playing new utterance (Chrome/Edge fix)
    setTimeout(() => {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate   = 1.0;
      utter.pitch  = 1.1;
      utter.volume = 1;

      // Pick best English voice (prefer Google voices in Chrome/Edge)
      const voices = window.speechSynthesis.getVoices();
      const voice  =
        voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
        voices.find((v) => v.lang.startsWith("en-US")) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (voice) utter.voice = voice;

      utter.onstart = () => setStatus("speaking");
      utter.onend   = () => {
        setStatus("idle");
        // Re-arm wake-word after Aria finishes
        if (wakeEnabledRef.current) _restartWakeWord();
      };
      utter.onerror = (err) => {
        console.error("SpeechSynthesis error:", err);
        setStatus("idle");
      };

      setStatus("speaking");
      window.speechSynthesis.speak(utter);
    }, 100);
  }, [setStatus]);

  // ── Mic permission helper ─────────────────────────────────────────────
  // Edge blocks SpeechRecognition if mic permission hasn't been granted via
  // getUserMedia first. We request a silent mic stream to trigger the prompt.
  const ensureMicPermission = useCallback(async () => {
    if (micStreamRef.current) return true; // already have it
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;
      return true;
    } catch (err) {
      if (err.name === "NotAllowedError") {
        toast.error("Microphone access denied. Please allow mic access and try again.");
      } else {
        toast.error("Microphone unavailable. You can still type to Aria.");
      }
      return false;
    }
  }, []);

  // ── Wake-word detection ───────────────────────────────────────────────
  function _restartWakeWord() {
    if (!wakeEnabledRef.current || !wakeRecRef.current) return;
    setTimeout(() => {
      if (wakeEnabledRef.current && wakeRecRef.current && !isListeningRef.current && ariaStatusRef.current !== "speaking") {
        try { wakeRecRef.current.start(); } catch (_) {}
      }
    }, 300);
  }

  // ── Send text to Aria ─────────────────────────────────────────────────
  const sendTextToAria = useCallback((text) => {
    const sock = socketRef.current;
    const sid  = sessionIdRef.current;
    if (!sock || !text?.trim()) return;

    const turn = { role: "candidate", text: text.trim(), timestamp: new Date() };
    setAriaTranscript((prev) => [...prev, turn]);
    if (onTranscriptRef.current) onTranscriptRef.current(turn);

    setStatus("thinking");
    sock.emit("aria:text", { sessionId: sid, text: text.trim() });
  }, [setStatus]);

  // ── Active listening — mic → speech → text → Aria ────────────────────
  const activateAria = useCallback(async () => {
    if (isListeningRef.current || ariaStatusRef.current === "speaking") return;

    // Stop wake-word while actively listening
    try { wakeRecRef.current?.abort(); } catch (_) {}

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast("Speech recognition not available in this browser. Type your message to Aria below.", { icon: "⌨️", duration: 3000 });
      setStatus("idle");
      setTimeout(() => document.querySelector("input[placeholder*='ria']")?.focus(), 100);
      return;
    }

    const granted = await ensureMicPermission();
    if (!granted) return;

    isListeningRef.current = true;

    const rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = "en-US";

    let capturedText = "";
    let silenceTimer = null;

    setStatus("listening");

    rec.onresult = (e) => {
      let currentFinal = "";
      let currentInterim = "";

      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          currentFinal += e.results[i][0].transcript;
        } else {
          currentInterim += e.results[i][0].transcript;
        }
      }

      const spoken = (currentFinal + " " + currentInterim).trim();
      if (spoken) {
        capturedText = spoken;
        if (silenceTimer) clearTimeout(silenceTimer);

        // Auto-send after 1.5 seconds of silence post-speech
        silenceTimer = setTimeout(() => {
          if (isListeningRef.current && capturedText.trim()) {
            try { rec.stop(); } catch (_) {}
            const toSend = capturedText.trim();
            capturedText = "";
            sendTextToAria(toSend);
          }
        }, 1500);
      }
    };

    rec.onerror = (e) => {
      if (silenceTimer) clearTimeout(silenceTimer);
      console.warn("Aria listen error:", e.error);
      if (e.error === "not-allowed") {
        toast.error("Microphone permission denied or blocked by browser settings.", { id: "sr-err" });
      } else if (e.error === "service-not-allowed") {
        toast.error("Speech Recognition is restricted on this browser origin.", { id: "sr-err" });
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        toast.error(`Aria voice warning: ${e.error}`, { id: "sr-err" });
      }
      isListeningRef.current = false;
      setStatus("idle");
      if (wakeEnabledRef.current) _restartWakeWord();
    };

    rec.onend = () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      isListeningRef.current = false;

      // If text was captured before ending, submit it
      if (capturedText.trim()) {
        const toSend = capturedText.trim();
        capturedText = "";
        sendTextToAria(toSend);
      } else {
        if (ariaStatusRef.current !== "speaking" && ariaStatusRef.current !== "thinking") {
          setStatus("idle");
        }
      }
      if (wakeEnabledRef.current) _restartWakeWord();
    };

    listenRecRef.current = rec;
    try { rec.start(); }
    catch (_) { isListeningRef.current = false; setStatus("idle"); }
  }, [ensureMicPermission, sendTextToAria, setStatus]);

  // ── Wake-word detection ───────────────────────────────────────────────
  const startWakeWordDetection = useCallback(async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    // Must have mic permission before SpeechRecognition works
    const granted = await ensureMicPermission();
    if (!granted) return;

    // Clean up previous instance
    if (wakeRecRef.current) {
      try { wakeRecRef.current.abort(); } catch (_) {}
    }

    const rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = "en-US";

    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        const transcript = (e.results[i]?.[0]?.transcript || "").toLowerCase().trim();
        if (
          (transcript.includes("aria") ||
           transcript.includes("arya") ||
           transcript.includes("area") ||
           transcript.includes("hey") ||
           transcript.includes("hi")) &&
          !isListeningRef.current &&
          ariaStatusRef.current !== "speaking"
        ) {
          toast("Hey Aria detected! Listening...", { icon: "🎙️", id: "wakeword-toast" });
          activateAria();
          break;
        }
      }
    };

    rec.onerror = (e) => {
      if (e.error !== "no-speech" && e.error !== "aborted") {
        console.warn("Wake-word error:", e.error);
      }
    };

    // Auto-restart so detection never lapses
    rec.onend = _restartWakeWord;

    wakeRecRef.current  = rec;
    wakeEnabledRef.current = true;
    setWakeWordEnabled(true);

    try { rec.start(); } catch (_) {}
  }, [ensureMicPermission, activateAria]);

  const stopWakeWordDetection = useCallback(() => {
    wakeEnabledRef.current = false;
    setWakeWordEnabled(false);
    try { wakeRecRef.current?.abort(); } catch (_) {}
  }, []);

  const deactivateAria = useCallback(() => {
    if (listenRecRef.current) {
      try { listenRecRef.current.stop(); } catch (_) {}
    }
    isListeningRef.current = false;
    window.speechSynthesis?.cancel();
    setStatus("idle");
  }, [setStatus]);

  // ── Socket event listeners ────────────────────────────────────────────
  // This effect re-runs every time `socket` changes, so listeners are
  // always registered on the real connected socket, never on null.
  useEffect(() => {
    if (!socket) return;

    const handleReady = () => {
      setAriaActive(true);
      setStatus("idle");
      // Delay wake-word so Aria's greeting doesn't immediately trigger it
      setTimeout(startWakeWordDetection, 3000);
    };

    const handleTranscript = ({ text, role }) => {
      const turn = { role, text, timestamp: new Date() };
      setAriaTranscript((prev) => [...prev, turn]);
      if (onTranscriptRef.current) onTranscriptRef.current(turn);
      if (role === "aria") speakText(text);
    };

    // Streaming chunks — update status to thinking while Gemini streams
    const handleChunk = () => setStatus("thinking");

    const handleDoneSpeaking = () => {
      // speakText's onend handles setting status back to idle
    };

    const handleError = ({ message }) => {
      toast.error(`Aria: ${message}`, { duration: 4000 });
      setStatus("idle");
    };

    const handleStopped = () => {
      setAriaActive(false);
      setStatus("idle");
      deactivateAria();
      stopWakeWordDetection();
    };

    socket.on("aria:ready",       handleReady);
    socket.on("aria:transcript",  handleTranscript);
    socket.on("aria:chunk",       handleChunk);
    socket.on("aria:done-speaking", handleDoneSpeaking);
    socket.on("aria:error",       handleError);
    socket.on("aria:stopped",     handleStopped);

    return () => {
      socket.off("aria:ready",       handleReady);
      socket.off("aria:transcript",  handleTranscript);
      socket.off("aria:chunk",       handleChunk);
      socket.off("aria:done-speaking", handleDoneSpeaking);
      socket.off("aria:error",       handleError);
      socket.off("aria:stopped",     handleStopped);
    };
  }, [socket, speakText, setStatus, startWakeWordDetection, deactivateAria, stopWakeWordDetection]);

  // ── Load voices early (Chrome/Edge lazy-load them) ────────────────────
  useEffect(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

  // ── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      deactivateAria();
      stopWakeWordDetection();
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
      const sock = socketRef.current;
      const sid  = sessionIdRef.current;
      if (sock && sid) sock.emit("aria:stop", { sessionId: sid });
    };
  }, []); // intentionally empty — runs only on unmount

  return {
    ariaActive,
    ariaStatus,
    ariaTranscript,
    wakeWordEnabled,
    startWakeWordDetection,
    stopWakeWordDetection,
    activateAria,
    deactivateAria,
    sendTextToAria,
  };
}
