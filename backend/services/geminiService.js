import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";

let genAI = null;
let model = null;

// Initialize Google Generative AI safely
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log("Gemini Generative AI initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Google Generative AI client:", err.message);
  }
} else {
  console.warn("GEMINI_API_KEY not found in environment — running Gemini service in Mock mode.");
}

/**
 * Utility helper to call Gemini with a 25s timeout, falling back gracefully.
 */
async function callGemini(prompt, fallbackData, _retryCount = 0) {
  const MAX_RETRIES = 3;

  if (!model) {
    return fallbackData;
  }
  try {
    // Race Gemini against a 5s timeout so session creation is instant and never hangs
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini timeout")), 5000)
    );
    const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);
    const text = result.response.text();
    // Try to extract JSON if requested
    if (prompt.includes("JSON")) {
      // First try: parse the entire text as JSON
      try {
        return JSON.parse(text.trim());
      } catch (_) {}
      // Second try: extract JSON object from text
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}") + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonStr = text.substring(jsonStart, jsonEnd);
        try {
          return JSON.parse(jsonStr);
        } catch (_) {}
      }
      // Third try: extract JSON array from text
      const arrStart = text.indexOf("[");
      const arrEnd = text.lastIndexOf("]") + 1;
      if (arrStart !== -1 && arrEnd > arrStart) {
        const arrStr = text.substring(arrStart, arrEnd);
        try {
          return JSON.parse(arrStr);
        } catch (_) {}
      }
    }
    return text;
  } catch (err) {
    // Retry on 429 rate limit with exponential backoff
    const is429 = err.message?.includes("429") || err.message?.includes("Too Many Requests") || err.message?.includes("quota");
    if (is429 && _retryCount < MAX_RETRIES) {
      const delayMs = Math.pow(2, _retryCount + 1) * 1000; // 2s, 4s, 8s
      console.log(`Gemini: Rate-limited, retrying in ${delayMs / 1000}s (attempt ${_retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise((r) => setTimeout(r, delayMs));
      return callGemini(prompt, fallbackData, _retryCount + 1);
    }
    console.warn("Gemini API call failed, using graceful fallback:", err.message);
    return fallbackData;
  }
}

/**
 * 1. ATS Resume Parser (PDF Buffer -> Structured Profile JSON)
 */
export const parseResumePDF = async (pdfBuffer) => {
  try {
    let extractedText = "React, Node, Express, Javascript, MongoDB, Python, HTML/CSS. 3 years exp.";
    
    if (pdfBuffer) {
      const parsedPdf = await pdfParse(pdfBuffer);
      extractedText = parsedPdf.text || extractedText;
    }

    const prompt = `
      You are an expert resume parser. Analyze the following text extracted from a resume PDF.
      Extract the details and return a raw JSON object with the following fields (no markdown formatting, just the raw JSON):
      {
        "skills": ["string"],
        "experienceYears": number,
        "level": "string" (e.g. Junior, Intermediate, Senior),
        "techStack": ["string"],
        "projects": ["string"]
      }
      
      Resume text:
      ${extractedText}
    `;

    const fallback = {
      skills: ["React", "JavaScript", "Node.js", "Express", "Tailwind CSS", "MongoDB"],
      experienceYears: 3,
      level: "Intermediate",
      techStack: ["MERN Stack", "TailwindCSS"],
      projects: ["Collaborative Editor", "Mock Interview Platform"],
    };

    return await callGemini(prompt, fallback);
  } catch (err) {
    console.error("Resume parsing service error:", err.message);
    return {
      skills: ["React", "JavaScript", "Node.js", "Express"],
      experienceYears: 2,
      level: "Junior-Intermediate",
      techStack: ["Fullstack JS"],
      projects: ["Personal Portfolio"],
    };
  }
};

/**
 * 2. Question Generator (Topic + Difficulty + Resume tailors)
 */
export const generateTailoredQuestion = async (topic, difficulty, resumeParsed = {}) => {
  const skillsStr = resumeParsed.skills ? resumeParsed.skills.join(", ") : "JavaScript";
  
  const prompt = `
    You are an elite interviewer. Generate a technical coding question on the topic of ${topic} with a difficulty level of ${difficulty}.
    Tailor the scenario slightly to align with the developer's skills: [${skillsStr}].
    Return a raw JSON object with exactly the following fields (no markdown wrapper, just the JSON):
    {
      "title": "string",
      "statement": "string (problem statement with inputs, outputs, and constraints)",
      "starterCode": {
        "javascript": "string (starter function/class structure)",
        "python": "string",
        "java": "string",
        "cpp": "string"
      },
      "expectedComplexity": {
        "time": "string (e.g. O(N))",
        "space": "string"
      },
      "hints": ["string", "string", "string"]
    }
  `;

  const fallback = {
    title: `Optimal ${topic} Resolution`,
    statement: `Design a data structure or algorithm that solves a classic ${topic} challenge.\n\nExample:\nInput: data = [2, 7, 11, 15]\nOutput: true\n\nConstraints:\n- Size < 1000\n- Time complexity target: ${difficulty === "senior" ? "O(N)" : "O(N log N)"}`,
    starterCode: {
      javascript: "function solve(data) {\n  // Write code here\n  return false;\n}",
      python: "def solve(data):\n    # Write code here\n    return False",
      java: "public class Solution {\n    public boolean solve(int[] data) {\n        return false;\n    }\n}",
      cpp: "class Solution {\npublic:\n    bool solve(vector<int>& data) {\n        return false;\n    }\n};",
    },
    expectedComplexity: {
      time: difficulty === "senior" ? "O(N)" : "O(N log N)",
      space: "O(1)",
    },
    hints: [
      "Review the boundary cases first.",
      "Can sorting reduce the problem dimensionality?",
      "Use a hash index to search elements in constant time.",
    ],
  };

  return await callGemini(prompt, fallback);
};

/**
 * 3. Real-time Code Analyzer (Debounced code check)
 */
export const analyzeCurrentCode = async (code, language, problemStatement) => {
  const prompt = `
    Analyze the following code snippet written in ${language} for the problem statement:
    "${problemStatement}"
    
    Code:
    ${code}
    
    Assess time/space complexity, overall code quality, and spot any syntax or logical bugs.
    Return a raw JSON object (no markdown):
    {
      "timeComplexity": "string",
      "spaceComplexity": "string",
      "qualityScore": number (0 to 100),
      "bugs": ["string"]
    }
  `;

  const fallback = {
    timeComplexity: "O(N^2) - suboptimal",
    spaceComplexity: "O(1) - optimal",
    qualityScore: 75,
    bugs: ["Missed handling null inputs", "Inefficient nested loops"],
  };

  return await callGemini(prompt, fallback);
};

/**
 * 3.5 getHint (Topic/Question + Code + Hint level)
 */
export const getHint = async (question, code, level) => {
  const levelNum = parseInt(level, 10) || 1;
  
  const prompt = `
    You are an expert technical interviewer.
    The candidate is solving the following question:
    "${question}"
    
    Their current code is:
    ${code}
    
    Provide a hint at level ${levelNum} (1 = subtle nudge, 2 = conceptual guidance, 3 = code structure or approach hint).
    Keep the hint concise, encouraging, and under 3 sentences. Do not write the full code solution.
    Return a raw JSON object (no markdown wrapper):
    {
      "hint": "string"
    }
  `;

  const fallbacks = {
    1: { hint: "Start by thinking about the brute force approach first. What data structure could help you avoid redundant lookups?" },
    2: { hint: "Consider using a hash map to store previously seen elements. This can reduce your time complexity from O(N²) to O(N) by enabling constant-time lookups." },
    3: { hint: "Try iterating through the array once. For each element, check if the complement (target - current) exists in your hash map. If yes, return the indices. If not, store the current element and its index." },
  };

  return await callGemini(prompt, fallbacks[levelNum] || fallbacks[1]);
};

/**
 * 4. Post-Interview Report Generator (Full scorecard feedback)
 */
export const generatePostInterviewReport = async (session) => {
  const codeStr = session.codeHistory ? JSON.stringify(session.codeHistory.slice(-1)) : "";
  const chatStr = session.chatHistory ? JSON.stringify(session.chatHistory) : "";

  // ── Determine code changes deterministically ────────────────────────
  const langKey = session.language || "javascript";
  const starterCode = session.question?.starterCode?.[langKey] || "";
  const lastHistory = session.codeHistory && session.codeHistory.length > 0
    ? session.codeHistory[session.codeHistory.length - 1]
    : null;
  const finalCode = lastHistory ? lastHistory.code : "";

  const trimmedFinal = finalCode.replace(/\s+/g, "");
  const trimmedStarter = starterCode.replace(/\s+/g, "");
  const noCodeWritten = !trimmedFinal || trimmedFinal === trimmedStarter;

  if (noCodeWritten) {
    console.log(`[Report Evaluation] No code changes detected for session ${session._id}. Scoring as 0.`);
    return {
      overallScore: 0,
      breakdown: {
        problemSolving: 0,
        codeQuality: 0,
        timeComplexity: 0,
        spaceComplexity: 0,
        communication: 0,
        edgeCases: 0,
      },
      strengths: ["None — no code was submitted for evaluation"],
      weaknesses: [
        "Candidate did not write or modify the starter code template",
        "No problem-solving attempt detected",
      ],
      tips: [
        "Be sure to write your solution in the Monaco editor workspace before ending the session.",
        "Communicate your logic and thought process clearly.",
      ],
      estimatedLevel: "Unrated / No Submission",
      companyFitMap: {
        faang: 0,
        startup: 0,
        enterprise: 0,
      },
      studyResources: [
        "Developer Practice Path",
        "Coding Interview Fundamentals Guide",
      ],
    };
  }

  // Calculate dynamic baseline score if falling back
  let baselineScore = 78;
  if (trimmedFinal.length < trimmedStarter.length + 30) {
    baselineScore = 35; // Very brief attempt
  } else if (trimmedFinal.length < trimmedStarter.length + 100) {
    baselineScore = 55; // Minor edits
  }

  const prompt = `
    Generate a full technical feedback scorecard for a completed mock interview session.
    Topic: ${session.topic}
    Difficulty: ${session.difficulty}
    Code: ${codeStr}
    Chat log: ${chatStr}
    
    Calculate scores, spot strengths, weaknesses, estimate their level, evaluate fit, and provide study links.
    Return a raw JSON object:
    {
      "overallScore": number (0 to 100),
      "breakdown": {
        "problemSolving": number,
        "codeQuality": number,
        "timeComplexity": number,
        "spaceComplexity": number,
        "communication": number,
        "edgeCases": number
      },
      "strengths": ["string"],
      "weaknesses": ["string"],
      "tips": ["string"],
      "estimatedLevel": "string",
      "companyFitMap": {
        "faang": number (0 to 100),
        "startup": number,
        "enterprise": number
      },
      "studyResources": ["string"]
    }

    CRITICAL RULES:
    1. If the final code matches the starter template exactly or has no meaningful changes, the overallScore and breakdown scores MUST be 0.
    2. Be rigorous. Do not inflate scores. If the code is incomplete or fails basic logic, score it appropriately (under 40).
  `;

  const fallback = {
    overallScore: baselineScore,
    breakdown: {
      problemSolving: Math.min(100, baselineScore + 3),
      codeQuality: Math.min(100, baselineScore - 2),
      timeComplexity: Math.min(100, baselineScore - 5),
      spaceComplexity: Math.min(100, baselineScore + 8),
      communication: 70,
      edgeCases: Math.min(100, baselineScore - 4),
    },
    strengths: [
      "Successfully modified starter template structures",
      "Drafted basic algorithmic flow loops",
    ],
    weaknesses: [
      "Suboptimal implementation depth",
      "Did not validate extreme edge inputs or overflows",
    ],
    tips: [
      "Focus on optimization of array indices and hash map mappings.",
      "Include assertions and test conditions explicitly.",
    ],
    estimatedLevel: baselineScore < 45 ? "Junior Software Engineer" : baselineScore < 70 ? "Associate Software Engineer" : "Mid-Level Software Engineer",
    companyFitMap: {
      faang: Math.max(0, baselineScore - 10),
      startup: Math.min(100, baselineScore + 10),
      enterprise: baselineScore,
    },
    studyResources: [
      "LeetCode Practice Paths",
      "System Design Fundamentals Guide",
    ],
  };

  return await callGemini(prompt, fallback);
};

/**
 * 5. AI Voice Assistant Response (Generates follow-up interview prompts)
 */
export const generateVoiceInterviewerPrompt = async (chatHistory, currentCode) => {
  const historyStr = JSON.stringify(chatHistory.slice(-4));
  const prompt = `
    You are a professional mock interviewer conducting a live coding interview.
    Review the recent conversation transcript and the current candidate code:
    History: ${historyStr}
    Code: ${currentCode}
    
    Draft a concise, encouraging, but technical follow-up question or hint. Keep it under 2 sentences.
    Return plain text.
  `;

  const fallback = "Your current approach looks good. How would you handle an empty list as an input constraint?";
  return await callGemini(prompt, fallback);
};

// cleanLeetCodeQuestion is implemented below in section 8

/**
 * 7. Conversational AI Interviewer Chat Responses
 */
export const generateAIChatResponse = async (questionText, currentCode, chatHistory) => {
  const historyStr = JSON.stringify(chatHistory.slice(-6));
  const prompt = `
    You are a professional mock interviewer conducting a coding interview.
    The candidate is solving this problem:
    ${questionText}

    Current Candidate Code:
    ${currentCode}

    Chat History:
    ${historyStr}

    Respond as the interviewer to the candidate's last message.
    Guidelines:
    1. Be concise, technical, and encouraging (1-3 sentences).
    2. Guide them using hints/questions; DO NOT give the complete code solution.
    3. Respond directly and naturally. Do not include prefixes like "Interviewer:".
  `;
  const fallback = "Let's review the problem statement and focus on parsing target bounds first. What approach are you planning to take?";
  return await callGemini(prompt, fallback);
};

/**
 * 8. Clean and structure LeetCode HTML content and snippets using Gemini
 */
export const cleanLeetCodeQuestion = async (title, htmlContent, codeSnippets = []) => {
  // Normalize code snippets mapping
  const mappedStarter = {};
  if (Array.isArray(codeSnippets)) {
    codeSnippets.forEach((snippet) => {
      const slug = snippet.langSlug || "";
      if (slug === "javascript") mappedStarter.javascript = snippet.code;
      if (slug === "python" || slug === "python3") mappedStarter.python = snippet.code;
      if (slug === "java") mappedStarter.java = snippet.code;
      if (slug === "cpp") mappedStarter.cpp = snippet.code;
      if (slug === "c") mappedStarter.c = snippet.code;
      if (slug === "golang" || slug === "go") mappedStarter.go = snippet.code;
    });
  }

  // Pre-clean HTML tags for safety
  const cleanTextFallback = (htmlContent || "")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();

  const prompt = `
    You are a technical editor. Clean up and structure this LeetCode challenge content into a strict JSON format.
    
    TITLE: ${title}
    HTML_CONTENT:
    ${htmlContent}

    Return EXACTLY a JSON object with these keys:
    {
      "title": "Clean Title",
      "difficulty": "beginner" or "intermediate" or "senior" (map LeetCode's Easy->beginner, Medium->intermediate, Hard->senior),
      "topic": "Arrays" or "Strings" or "Linked Lists" or "Trees" or "Graphs" or "Dynamic Programming" or "Binary Search" (pick the best matching topic),
      "statement": "Clear problem statement in clean markdown text (no html tags)",
      "examples": [
        {
          "input": "string input description",
          "output": "string output description",
          "explanation": "string explanation"
        }
      ],
      "constraints": [
        "Constraint 1",
        "Constraint 2"
      ],
      "hints": [
        "Hint 1 (general)",
        "Hint 2 (algorithmic)",
        "Hint 3 (implementation detail)"
      ],
      "expectedComplexity": {
        "time": "O(N)",
        "space": "O(1)"
      }
    }

    Response must be valid raw JSON only. Do not wrap in markdown blocks.
  `;

  const fallback = {
    title,
    difficulty: "intermediate",
    topic: "General",
    statement: cleanTextFallback || "Solve this challenge.",
    examples: [],
    constraints: [],
    starterCode: mappedStarter,
    hints: [
      "Analyze constraints and edge cases.",
      "Consider using helper data structures.",
      "Check time and space complexity bounds."
    ],
    expectedComplexity: { time: "O(N)", space: "O(1)" },
    starterCode: mappedStarter
  };

  try {
    const parsed = await callGemini(prompt, fallback);
    // Ensure starter code is merged back to prevent loss
    if (parsed && typeof parsed === "object") {
      parsed.starterCode = { ...mappedStarter, ...(parsed.starterCode || {}) };
      // Fallback complexity values if missing
      if (parsed.expectedComplexity) {
        parsed.timeComplexityExpected = parsed.expectedComplexity.time || "O(N)";
        parsed.spaceComplexityExpected = parsed.expectedComplexity.space || "O(1)";
      }
      return parsed;
    }
    return fallback;
  } catch (err) {
    return fallback;
  }
};

/**
 * 9. AI Error Diagnostic Assistant
 * Explains code runtime/syntax errors in clear 1-3 sentence guidance.
 */
export const explainCodeError = async (code, language, errorMsg, problemStatement = "") => {
  const prompt = `
    You are an expert software developer and compiler tutor.
    The candidate ran the following ${language} code for the challenge:
    "${problemStatement}"

    CODE:
    ${code}

    COMPILER / RUNTIME ERROR:
    ${errorMsg}

    Identify:
    1. Which specific line or variable caused the error.
    2. Why the error occurred in plain, encouraging language.
    3. Exactly how to fix it in 2-3 short sentences.

    Return raw text response without markdown code formatting wrappers.
  `;

  const fallback = `Syntax or runtime error detected: "${errorMsg.slice(0, 150)}...". Please review your variable declarations and line boundaries around the indicated location.`;
  return await callGemini(prompt, fallback);
};

