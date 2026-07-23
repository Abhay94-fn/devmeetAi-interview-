import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

/**
 * Custom hook to manage socket connection and lifecycle.
 * Reuses a single socket instance per page.
 */
export default function useSocket(roomId, { onUserJoined, onUserLeft, onCodeUpdate, onChatMessage }) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    // Connect to socket.io
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`Connected to room socket: ${socket.id}`);
      socket.emit("join-room", { roomId });
    });

    if (onUserJoined) socket.on("user-joined", onUserJoined);
    if (onUserLeft) socket.on("user-left", onUserLeft);
    if (onCodeUpdate) socket.on("code-update", onCodeUpdate);
    if (onChatMessage) socket.on("chat-message", onChatMessage);

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [roomId]);

  const emitCodeChange = (code, language) => {
    if (socketRef.current) {
      socketRef.current.emit("code-change", { roomId, code, language });
    }
  };

  const emitChatMessage = (role, text) => {
    if (socketRef.current) {
      socketRef.current.emit("chat-message", { roomId, role, text });
    }
  };

  return {
    socket: socketRef.current,
    emitCodeChange,
    emitChatMessage,
  };
}
