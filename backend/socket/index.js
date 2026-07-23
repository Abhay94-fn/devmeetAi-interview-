import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { analyzeCurrentCode, getHint, generateAIChatResponse } from "../services/geminiService.js";
import { createGeminiLiveSession } from "../services/geminiLiveService.js";
import { registerAriaHandlers, cleanupAriaSessionsForSocket } from "./ariaHandler.js";
import { setIO } from "./store.js";

const activeSessions = new Map();
const geminiSessions = new Map(); // key: sessionId_socketId -> liveSession

export default function registerSocketHandlers(io) {
  setIO(io);
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("No token provided"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id name role avatar");
      if (!user) {
        return next(new Error("User not found"));
      }
      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket authentication error:", err.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Connected: ${socket.user.name} (${socket.user.role}) via socket: ${socket.id}`);

    // Register Aria voice assistant handlers for this socket
    registerAriaHandlers(socket, activeSessions);

    socket.on("session:join", ({ sessionId, question, topic, difficulty }) => {
      socket.join(sessionId);

      if (!activeSessions.has(sessionId)) {
        activeSessions.set(sessionId, {
          question: question || null,
          participants: {},
          code: "",
          language: "javascript"
        });
      }

      const sess = activeSessions.get(sessionId);
      sess.participants[socket.user._id.toString()] = {
        socketId: socket.id,
        role: socket.user.role,
        name: socket.user.name
      };

      if (question) {
        sess.question = question;
      }

      socket.to(sessionId).emit("session:user-joined", {
        userId: socket.user._id,
        name: socket.user.name,
        role: socket.user.role,
        socketId: socket.id,
      });

      socket.emit("session:state", {
        question: sess.question,
        code: sess.code,
        language: sess.language,
      });
    });

    // GEMINI LIVE VOICE — Start voice interview mode
    socket.on("voice:start", ({ sessionId }) => {
      const sess = activeSessions.get(sessionId);
      if (!sess || socket.user.role !== "candidate") return;

      const key = `${sessionId}_${socket.id}`;
      // Clean up existing if any
      if (geminiSessions.has(key)) {
        geminiSessions.get(key).disconnect();
      }

      const geminiSession = createGeminiLiveSession(socket, {
        question: sess.question,
        topic: sess.question?.topic || "General",
        difficulty: sess.question?.difficulty || "Medium",
        candidateName: socket.user.name,
      });

      geminiSessions.set(key, geminiSession);
      socket.emit("voice:started");
    });

    // Candidate microphone audio chunk → Gemini
    socket.on("voice:audio", ({ sessionId, audio }) => {
      const key = `${sessionId}_${socket.id}`;
      const geminiSession = geminiSessions.get(key);
      if (geminiSession) {
        geminiSession.sendAudioChunk(audio);
      }
    });

    // Stop voice mode
    socket.on("voice:stop", ({ sessionId }) => {
      const key = `${sessionId}_${socket.id}`;
      const geminiSession = geminiSessions.get(key);
      if (geminiSession) {
        geminiSession.disconnect();
        geminiSessions.delete(key);
      }
      socket.emit("voice:stopped");
    });

    // Text query to AI (voice mode fallback)
    socket.on("voice:text", ({ sessionId, text }) => {
      const key = `${sessionId}_${socket.id}`;
      const geminiSession = geminiSessions.get(key);
      if (geminiSession) {
        geminiSession.sendTextMessage(text);
      }
    });

    // Code changes sync
    socket.on("code:change", ({ sessionId, code, language }) => {
      const sess = activeSessions.get(sessionId);
      if (sess) {
        sess.code = code;
        sess.language = language;
      }
      socket.to(sessionId).emit("code:update", { code, language });
    });

    // AI Static analysis debounced checker
    socket.on("code:analyze", async ({ sessionId, code, language }) => {
      try {
        if (!code || code.trim().length < 5) return;
        const sess = activeSessions.get(sessionId);
        const questionText = sess?.question?.statement || "Write standard code functions.";
        const analysis = await analyzeCurrentCode(code, language, questionText);

        const result = {
          timeComplexity: analysis.timeComplexity || "O(N)",
          spaceComplexity: analysis.spaceComplexity || "O(1)",
          quality: analysis.qualityScore || 80,
          suggestions: analysis.bugs || [],
          bugs: analysis.bugs || [],
        };

        socket.emit("ai:analysis", result);
        socket.to(sessionId).emit("ai:analysis:broadcast", result);
      } catch (err) {
        socket.emit("ai:analysis", {
          timeComplexity: "N/A",
          spaceComplexity: "N/A",
          quality: 0,
          suggestions: ["AI analysis temporarily unavailable."],
          bugs: [],
        });
      }
    });

    // Progressive Hints
    socket.on("ai:hint-request", async ({ sessionId, code, hintLevel }) => {
      try {
        const sess = activeSessions.get(sessionId);
        const questionText = sess?.question?.statement || "";
        const hintData = await getHint(questionText, code, hintLevel);
        socket.emit("ai:hint-result", { hint: hintData.hint, level: hintLevel });
      } catch (err) {
        socket.emit("ai:hint-result", {
          hint: "Focus on splitting the logic into smaller helper functions.",
          level: hintLevel,
        });
      }
    });

    socket.on("chat:message", async ({ sessionId, content }) => {
      // Broadcast candidate's message to the session room immediately
      io.to(sessionId).emit("chat:message", {
        from: socket.user.name,
        role: socket.user.role,
        content,
        timestamp: new Date()
      });

      try {
        const sess = activeSessions.get(sessionId);
        if (sess) {
          sess.chatHistory = sess.chatHistory || [];
          sess.chatHistory.push({
            role: socket.user.role,
            text: content,
            timestamp: new Date()
          });

          // Fetch the session from the DB to inspect session type
          const dbSession = await Session.findById(sessionId);
          if (dbSession && dbSession.type === "ai_solo") {
            const currentCode = sess.code || "";
            const questionText = sess.question?.statement || dbSession.question?.statement || "";

            // Call Gemini to generate a professional interviewer response
            const aiResponseText = await generateAIChatResponse(questionText, currentCode, sess.chatHistory);

            const aiMessage = {
              from: "AI Interviewer",
              role: "interviewer",
              content: aiResponseText,
              timestamp: new Date()
            };

            sess.chatHistory.push({
              role: "interviewer",
              text: aiResponseText,
              timestamp: new Date()
            });
            io.to(sessionId).emit("chat:message", aiMessage);
          }
        }
      } catch (err) {
        console.error("AI chat responder error:", err.message);
      }
    });

    socket.on("integrity:flag", ({ sessionId, type }) => {
      socket.to(sessionId).emit("integrity:flagged", {
        type,
        timestamp: new Date(),
        userId: socket.user._id
      });
    });

    socket.on("speaking:update", ({ sessionId, isSpeaking }) => {
      socket.to(sessionId).emit("speaking:update", {
        userId: socket.user._id,
        isSpeaking
      });
    });

    // WebRTC signaling relay endpoints
    socket.on("webrtc:offer", ({ to, sdp }) => {
      io.to(to).emit("webrtc:offer", { from: socket.id, sdp });
    });

    socket.on("webrtc:answer", ({ to, sdp }) => {
      io.to(to).emit("webrtc:answer", { from: socket.id, sdp });
    });

    socket.on("webrtc:ice", ({ to, candidate }) => {
      io.to(to).emit("webrtc:ice", { from: socket.id, candidate });
    });

    // Join room to receive async report notification events
    socket.on("join:report-room", ({ sessionId }) => {
      socket.join(`report_${sessionId}`);
    });

    socket.on("session:end", ({ sessionId }) => {
      io.to(sessionId).emit("session:ended", { endedBy: socket.user.name });
      
      const key = `${sessionId}_${socket.id}`;
      if (geminiSessions.has(key)) {
        geminiSessions.get(key).disconnect();
        geminiSessions.delete(key);
      }
      activeSessions.delete(sessionId);
    });

    socket.on("disconnect", () => {
      // Clean up Aria sessions for this socket
      cleanupAriaSessionsForSocket(socket.id);

      const key = `${socket.id}`;
      geminiSessions.forEach((sess, sessKey) => {
        if (sessKey.endsWith(`_${key}`)) {
          sess.disconnect();
          geminiSessions.delete(sessKey);
        }
      });

      activeSessions.forEach((sess, sessionId) => {
        const uid = socket.user?._id?.toString();
        if (uid && sess.participants[uid]) {
          delete sess.participants[uid];
          socket.to(sessionId).emit("session:user-left", {
            userId: socket.user._id,
            name: socket.user.name
          });
        }
      });
    });
  });

  return io;
}
export { activeSessions, geminiSessions };
