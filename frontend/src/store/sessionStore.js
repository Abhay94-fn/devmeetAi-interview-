import { create } from "zustand";

const useSessionStore = create((set, get) => ({
  currentSession: null,
  code: "",
  language: "javascript",
  aiAnalysis: null,
  hints: [],
  isLive: false,
  timerSeconds: 0,
  chatMessages: [],
  integrityFlags: [],
  participants: [],

  // Judge0 execution state
  output: "",
  isRunning: false,
  executionStatus: "",

  setSession: (session) => set({ currentSession: session }),
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setAiAnalysis: (aiAnalysis) => set({ aiAnalysis }),
  addHint: (hint) => set((s) => ({ hints: [...s.hints, hint] })),
  setLive: (isLive) => set({ isLive }),
  tickTimer: () => set((s) => ({ timerSeconds: s.timerSeconds + 1 })),
  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  addIntegrityFlag: (flag) => set((s) => ({ integrityFlags: [...s.integrityFlags, flag] })),
  setParticipants: (participants) => set({ participants }),

  // Judge0 actions — support both direct values and functional updaters
  setOutput: (outputOrFn) => {
    if (typeof outputOrFn === "function") {
      set({ output: outputOrFn(get().output) });
    } else {
      set({ output: outputOrFn });
    }
  },
  setRunning: (isRunning) => set({ isRunning }),
  setExecutionStatus: (executionStatus) => set({ executionStatus }),

  // Voice AI
  voiceMode: false,
  aiSpeaking: false,
  setVoiceMode: (voiceMode) => set({ voiceMode }),
  setAiSpeaking: (aiSpeaking) => set({ aiSpeaking }),

  resetSession: () =>
    set({
      currentSession: null,
      code: "",
      language: "javascript",
      aiAnalysis: null,
      hints: [],
      isLive: false,
      timerSeconds: 0,
      chatMessages: [],
      integrityFlags: [],
      participants: [],
      output: "",
      isRunning: false,
      executionStatus: "",
      voiceMode: false,
      aiSpeaking: false,
    }),
}));

export default useSessionStore;
