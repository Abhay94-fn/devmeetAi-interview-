import { io } from "socket.io-client";

let socket = null;

/**
 * Read the auth token safely.
 * Edge's "Tracking Prevention" can block localStorage on some sites.
 * We fall back to sessionStorage so the socket can still authenticate.
 */
export function getToken() {
  try { return localStorage.getItem("accessToken"); } catch {}
  try { return sessionStorage.getItem("accessToken"); } catch {}
  return null;
}

/**
 * Returns a connected socket, always with the latest valid token.
 * If the token changed since the last connection (e.g. after a token
 * refresh or after Edge unblocked storage), the old socket is discarded
 * and a fresh one is created so the JWT middleware never sees a stale/null token.
 */
export const getSocket = () => {
  const token = getToken();

  // If we have a socket but it was created with no token and now we have one,
  // tear it down so we reconnect with the real credentials.
  if (socket && socket.auth?.token !== token) {
    socket.disconnect();
    socket = null;
  }

  if (!socket || !socket.connected) {
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
