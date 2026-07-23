import { create } from "zustand";
import api from "../utils/api";

// Safe storage helpers — Edge tracking prevention can block localStorage
function safeGet() {
  try { return localStorage.getItem("accessToken"); }
  catch { try { return sessionStorage.getItem("accessToken"); } catch { return null; } }
}
function safeSet(token) {
  try { localStorage.setItem("accessToken", token); } catch {}
  try { sessionStorage.setItem("accessToken", token); } catch {}
}
function safeRemove() {
  try { localStorage.removeItem("accessToken"); } catch {}
  try { sessionStorage.removeItem("accessToken"); } catch {}
}

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  loadUser: async () => {
    const token = safeGet();
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data, accessToken: token, isAuthenticated: true, isLoading: false });
    } catch {
      safeRemove();
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  },

  register: async (name, email, password, role) => {
    const { data } = await api.post("/auth/register", { name, email, password, role });
    safeSet(data.accessToken);
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
    return data;
  },

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    safeSet(data.accessToken);
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
    return data;
  },

  loginWithGoogle: async (credential, role) => {
    const { data } = await api.post("/auth/google", { credential, role });
    safeSet(data.accessToken);
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
    return data;
  },

  loginWithGoogleToken: async (googleId, email, name, picture, role) => {
    const { data } = await api.post("/auth/google-token", { googleId, email, name, picture, role });
    safeSet(data.accessToken);
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
    return data;
  },

  logout: async () => {
    try { await api.post("/auth/logout"); } catch {}
    safeRemove();
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
