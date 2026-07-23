import { createAriaSession } from "../services/ariaService.js";

// Map: sessionId → Aria session object
const ariaSessions = new Map();

/**
 * Register all Aria-related socket events on the given socket.
 * Called once per connected socket inside the main socket handler.
 *
 * @param {import('socket.io').Socket} socket
 * @param {Map} activeSessions - shared in-memory session map from socket/index.js
 */
export function registerAriaHandlers(socket, activeSessions) {
  // ── aria:start ────────────────────────────────────────────────────────
  // Payload: { sessionId, sessionContext }
  // sessionContext: { candidateName, questionTitle, questionStatement,
  //   difficulty, topic, language, skills, experienceLevel, currentCode }
  socket.on("aria:start", ({ sessionId, sessionContext }) => {
    try {
      if (!sessionId || !sessionContext) return;

      // Only candidates can start an Aria session
      if (socket.user.role !== "candidate") {
        socket.emit("aria:error", { message: "Only candidates can start an Aria session." });
        return;
      }

      // Clean up any existing session for this socket
      const existingKey = `${sessionId}_${socket.id}`;
      if (ariaSessions.has(existingKey)) {
        ariaSessions.get(existingKey).endSession();
        ariaSessions.delete(existingKey);
      }

      // Enrich context with current code from shared activeSessions if not provided
      const liveSession = activeSessions.get(sessionId);
      const enrichedContext = {
        candidateName: socket.user.name,
        currentCode: liveSession?.code || "",
        language: liveSession?.language || "javascript",
        ...sessionContext,
      };

      const ariaSession = createAriaSession(socket, enrichedContext);
      ariaSessions.set(existingKey, ariaSession);

      console.log(`Aria session started: ${socket.user.name} in session ${sessionId}`);
    } catch (err) {
      console.error("aria:start error:", err.message);
      socket.emit("aria:error", { message: "Failed to start Aria session." });
    }
  });

  // ── aria:audio ───────────────────────────────────────────────────────
  // Payload: { sessionId, audioChunk } — audioChunk is base64 PCM 16kHz
  socket.on("aria:audio", ({ sessionId, audioChunk }) => {
    try {
      if (!sessionId || !audioChunk) return;
      const key = `${sessionId}_${socket.id}`;
      const ariaSession = ariaSessions.get(key);
      if (ariaSession && typeof ariaSession.sendAudio === "function") {
        ariaSession.sendAudio(audioChunk);
      } else if (ariaSession) {
        console.warn("ariaSession does not support sendAudio on this session");
      }
    } catch (err) {
      console.error("aria:audio error:", err.message);
    }
  });

  // ── aria:text ────────────────────────────────────────────────────────
  // Payload: { sessionId, text }
  socket.on("aria:text", ({ sessionId, text }) => {
    try {
      if (!sessionId || !text?.trim()) return;
      const key = `${sessionId}_${socket.id}`;
      const ariaSession = ariaSessions.get(key);
      if (ariaSession) ariaSession.sendText(text.trim());
    } catch (err) {
      console.error("aria:text error:", err.message);
      socket.emit("aria:error", { message: "Failed to send message to Aria." });
    }
  });

  // ── aria:code-update ─────────────────────────────────────────────────
  // Payload: { sessionId, code, language }
  // Called whenever the candidate's code changes so Aria always has the latest snapshot.
  socket.on("aria:code-update", ({ sessionId, code, language }) => {
    try {
      if (!sessionId) return;

      // Also update the shared live session map so analysis events stay in sync
      const liveSession = activeSessions.get(sessionId);
      if (liveSession) {
        if (code !== undefined) liveSession.code = code;
        if (language) liveSession.language = language;
      }

      const key = `${sessionId}_${socket.id}`;
      const ariaSession = ariaSessions.get(key);
      if (ariaSession && code !== undefined) ariaSession.updateCode(code);
    } catch (err) {
      console.error("aria:code-update error:", err.message);
    }
  });

  // ── aria:stop ────────────────────────────────────────────────────────
  // Payload: { sessionId }
  socket.on("aria:stop", ({ sessionId }) => {
    try {
      if (!sessionId) return;
      const key = `${sessionId}_${socket.id}`;
      const ariaSession = ariaSessions.get(key);
      if (ariaSession) {
        ariaSession.endSession();
        ariaSessions.delete(key);
      }
      socket.emit("aria:stopped");
      console.log(`Aria session stopped: ${socket.user.name} in session ${sessionId}`);
    } catch (err) {
      console.error("aria:stop error:", err.message);
    }
  });
}

/**
 * Clean up all Aria sessions belonging to a disconnected socket.
 * Called from the disconnect handler in socket/index.js.
 */
export function cleanupAriaSessionsForSocket(socketId) {
  for (const [key, session] of ariaSessions.entries()) {
    if (key.endsWith(`_${socketId}`)) {
      try {
        session.endSession();
      } catch (_) {}
      ariaSessions.delete(key);
    }
  }
}

export { ariaSessions };
