import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { temperature: 0.5, maxOutputTokens: 300 },
    systemInstruction: {
      parts: [{ text: "You are Aria, a senior technical interviewer at DevMeet." }],
    },
  });
}

// ── System prompt builder ─────────────────────────────────────────────────────
function buildSystemPrompt(ctx) {
  const {
    candidateName = "Candidate",
    questionTitle = "General Coding Question",
    questionStatement = "",
    difficulty = "intermediate",
    topic = "General",
    language = "javascript",
    skills = [],
    experienceLevel = "Intermediate",
    currentCode = "",
  } = ctx;

  const firstName = candidateName.split(" ")[0];
  const skillsStr = skills.length ? skills.join(", ") : "Not provided";
  const codeSection = currentCode.trim()
    ? `CURRENT CODE (${language}):\n\`\`\`\n${currentCode}\n\`\`\``
    : "CURRENT CODE: Empty — the candidate hasn't written code yet.";

  return `You are Aria, a senior technical interviewer at DevMeet conducting a live coding interview with ${firstName}.

QUESTION: ${questionTitle}
${questionStatement ? `STATEMENT: ${questionStatement}` : ""}
DIFFICULTY: ${difficulty} | TOPIC: ${topic} | LANGUAGE: ${language}

CANDIDATE: ${candidateName} | SKILLS: ${skillsStr} | LEVEL: ${experienceLevel}

${codeSection}

RULES:
- Always address ${firstName} by name at least once per reply
- Be concise: 1-3 sentences for most replies, up to 6 for explanations
- Always reference ACTUAL variable/function names from the code above — never invent names
- If asked a direct question, answer it directly and completely first, then ask one follow-up
- If the code has a bug, name the exact line/variable and explain why it is wrong
- Never give vague answers like "good job" without specifics
- If code is empty, ask the candidate to describe their approach
- NEVER reveal the complete solution — guide with hints only`;
}

// ── Session factory ───────────────────────────────────────────────────────────
export function createAriaSession(clientSocket, sessionContext) {
  const conversationHistory = []; // { role: "user"|"model", parts: [{ text }] }
  let lastCodeSnapshot = sessionContext.currentCode || "";
  const sessionStartTime = new Date();

  // ── Core: call Gemini and stream reply back to client ─────────────────
  async function askAria(userText, _retryCount = 0) {
    const MAX_RETRIES = 3;

    if (!model) {
      clientSocket.emit("aria:transcript", {
        text: "Aria is offline — GEMINI_API_KEY is not configured.",
        role: "aria",
      });
      clientSocket.emit("aria:done-speaking");
      return;
    }

    // Add current code snapshot to user message for context
    const codeContext = lastCodeSnapshot.trim()
      ? `\n\n[Current code snapshot]\n\`\`\`\n${lastCodeSnapshot}\n\`\`\``
      : "";

    const userMessage = userText + codeContext;

    // Only push to history on the first attempt (not retries)
    if (_retryCount === 0) {
      conversationHistory.push({ role: "user", parts: [{ text: userMessage }] });
    }

    // Keep last 20 turns so context stays fresh without ballooning
    const recentHistory = conversationHistory.slice(-20);

    try {
      const chat = model.startChat({
        history: recentHistory.slice(0, -1), // everything except the last user turn
        systemInstruction: {
          parts: [{ text: buildSystemPrompt({ ...sessionContext, currentCode: lastCodeSnapshot }) }],
        },
      });

      // Use streaming so first words arrive fast
      const result = await chat.sendMessageStream(userMessage);

      let fullReply = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullReply += chunkText;
          // Stream each chunk to the frontend so it feels instant
          clientSocket.emit("aria:chunk", { text: chunkText });
        }
      }

      // Push Aria's complete reply to history
      conversationHistory.push({ role: "model", parts: [{ text: fullReply }] });

      // Emit the full transcript once done (for the transcript panel)
      clientSocket.emit("aria:transcript", { text: fullReply, role: "aria" });
      clientSocket.emit("aria:done-speaking");
    } catch (err) {
      console.error("Aria Gemini error (using local mock fallback):", err.message);

      // Programmatic interactive mock interviewer responses (quota fallback)
      let mockReply = "That is a solid point. How would you handle potential edge cases or empty inputs in your current code structure?";
      const text = (userText || "").toLowerCase();
      if (text.includes("hello") || text.includes("hi ") || text.includes("ready") || text.includes("start")) {
        mockReply = "Hello! I am ready to begin the interview. To start off, could you please walk me through your initial thoughts on this problem?";
      } else if (text.includes("hint") || text.includes("help") || text.includes("stuck")) {
        mockReply = "Sure! Try to think about the brute force approach first. How can we optimize it using a map or two-pointers technique?";
      } else if (text.includes("complexity") || text.includes("time") || text.includes("space")) {
        mockReply = "Excellent question. The optimal time complexity for this topic is typically O(N) or O(N log N). How does your current code match that?";
      } else if (text.includes("run") || text.includes("compile") || text.includes("test")) {
        mockReply = "Great step. Let's run your code using the compiler button and analyze the output against the expected results.";
      } else if (text.includes("done") || text.includes("finish") || text.includes("completed")) {
        mockReply = "Perfect. Once you are confident with your code, feel free to end the session using the End Session button to view your scorecard.";
      }

      clientSocket.emit("aria:transcript", { text: mockReply, role: "aria" });
      clientSocket.emit("aria:done-speaking");
    }
  }

  // ── Public API ────────────────────────────────────────────────────────
  function sendText(text) {
    if (!text?.trim()) return;
    askAria(text.trim());
  }

  function updateCode(codeSnapshot) {
    lastCodeSnapshot = codeSnapshot;
  }

  async function startGreeting() {
    await askAria(
      "The interview is starting now. Greet the candidate warmly, introduce yourself as Aria, confirm they can see the question, and ask if they have any clarifying questions before they start coding."
    );
  }

  function endSession() {
    // nothing to close for HTTP-based Gemini
  }

  function getHistory() {
    return conversationHistory;
  }

  // Fire greeting automatically
  startGreeting();

  // Signal frontend that Aria is ready
  clientSocket.emit("aria:ready");

  return { sendText, updateCode, endSession, getHistory };
}
