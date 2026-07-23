import Question from "../models/Question.js";
import * as geminiService from "../services/geminiService.js";
import axios from "axios";
import { seedQuestionsData } from "../utils/questionsSeedData.js";


export const getQuestions = async (req, res) => {
  const { topic, difficulty, search, company, page = 1, limit = 50 } = req.query;

  try {
    const query = {};

    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty.toLowerCase();
    if (company) query.companies = company;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { statement: { $regex: search, $options: "i" } },
      ];
    }

    const skipIndex = (Number(page) - 1) * Number(limit);
    const questions = await Question.find(query).skip(skipIndex).limit(Number(limit));
    const total = await Question.countDocuments(query);

    res.json({
      questions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Get questions error:", err.message);
    res.status(500).json({ message: "Failed to load coding questions" });
  }
};

export const getQuestionById = async (req, res) => {
  const { id } = req.params;

  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Increment stats attempts
    question.stats = question.stats || { attempts: 0, avgScore: 0 };
    question.stats.attempts += 1;
    await question.save();

    res.json(question);
  } catch (err) {
    console.error("Get question by id error:", err.message);
    res.status(500).json({ message: "Failed to fetch question details" });
  }
};

export const generateAIQuestion = async (req, res) => {
  const { topic, difficulty } = req.body;

  try {
    const questionData = await geminiService.generateTailoredQuestion(topic, difficulty, {});
    res.json(questionData);
  } catch (err) {
    console.error("Generate AI question error:", err.message);
    res.status(500).json({ message: "AI question generator failed" });
  }
};

export const seedQuestions = async (req, res) => {
  try {
    // Delete existing to prevent collisions on seed
    await Question.deleteMany({ isPublic: true });
    await Question.insertMany(seedQuestionsData);

    res.json({ message: `Seeded ${seedQuestionsData.length} coding questions successfully`, count: seedQuestionsData.length });
  } catch (err) {
    console.error("Seed questions error:", err.message);
    res.status(500).json({ message: "Failed to seed coding questions" });
  }
};

export const importLeetCodeQuestion = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: "Please provide a LeetCode URL or problem slug" });
  }

  try {
    // Extract slug from LeetCode URL
    // Standard URL format: https://leetcode.com/problems/two-sum/description/
    const cleanedUrl = url.trim();
    const match = cleanedUrl.match(/problems\/([a-z0-9\-]+)/i);
    const slug = match ? match[1] : cleanedUrl.toLowerCase().replace(/[^a-z0-9\-]+/g, "-");

    // Call LeetCode GraphQL API
    // Note: LeetCode blocks unauthenticated server-side requests in some regions.
    // We set a short timeout and provide a clear error if blocked.
    const graphqlQuery = {
      query: `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            title
            content
            difficulty
            codeSnippets {
              lang
              langSlug
              code
            }
          }
        }
      `,
      variables: { titleSlug: slug },
    };

    let leetcodeRes;
    try {
      leetcodeRes = await axios.post("https://leetcode.com/graphql", graphqlQuery, {
        headers: {
          "Content-Type": "application/json",
          "Referer": "https://leetcode.com",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        timeout: 10000, // 10 second timeout
      });
    } catch (axiosErr) {
      const status = axiosErr.response?.status;
      if (status === 403 || status === 429) {
        return res.status(502).json({
          message: "LeetCode blocked the request (rate-limit or region restriction). Try again later or enter the question manually.",
        });
      }
      return res.status(502).json({
        message: "Could not reach LeetCode. Check your internet connection and try again.",
      });
    }

    const leetcodeQuestion = leetcodeRes.data?.data?.question;
    if (!leetcodeQuestion) {
      return res.status(404).json({ message: "LeetCode problem not found. Make sure the URL or slug is correct." });
    }

    const { title, content, difficulty, codeSnippets } = leetcodeQuestion;

    // Use Gemini to clean and structure the question details
    const parsedData = await geminiService.cleanLeetCodeQuestion(title, content, codeSnippets);

    // Save or update in database
    let question = await Question.findOne({ slug });

    if (question) {
      question.title = parsedData.title || title;
      question.difficulty = parsedData.difficulty || "intermediate";
      question.topic = parsedData.topic || "General";
      question.statement = parsedData.statement || "Solve this challenge.";
      question.examples = parsedData.examples || [];
      question.constraints = parsedData.constraints || [];
      question.starterCode = parsedData.starterCode || {};
      question.hints = parsedData.hints || [];
      question.expectedComplexity = parsedData.expectedComplexity || { time: "O(N)", space: "O(1)" };
      question.timeComplexityExpected = parsedData.timeComplexityExpected || parsedData.expectedComplexity?.time || "O(N)";
      question.spaceComplexityExpected = parsedData.spaceComplexityExpected || parsedData.expectedComplexity?.space || "O(1)";
      await question.save();
    } else {
      question = await Question.create({
        title: parsedData.title || title,
        slug,
        difficulty: parsedData.difficulty || "intermediate",
        topic: parsedData.topic || "General",
        statement: parsedData.statement || "Solve this challenge.",
        examples: parsedData.examples || [],
        constraints: parsedData.constraints || [],
        starterCode: parsedData.starterCode || {},
        hints: parsedData.hints || [],
        expectedComplexity: parsedData.expectedComplexity || { time: "O(N)", space: "O(1)" },
        timeComplexityExpected: parsedData.timeComplexityExpected || parsedData.expectedComplexity?.time || "O(N)",
        spaceComplexityExpected: parsedData.spaceComplexityExpected || parsedData.expectedComplexity?.space || "O(1)",
        isPublic: true,
      });
    }

    res.status(201).json(question);
  } catch (err) {
    console.error("Import LeetCode question error:", err.message);
    res.status(500).json({ message: "Failed to import LeetCode question. Please try again." });
  }
};
