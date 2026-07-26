import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import CandidateProfile from "../models/CandidateProfile.js";
import InterviewerProfile from "../models/InterviewerProfile.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import axios from "axios";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const setRefreshCookie = (res, token) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  } catch (err) {
    console.warn("Cookie setting skipped:", err.message);
  }
};

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  tier: user.tier || "free",
});

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const userRole = role === "interviewer" ? "interviewer" : "candidate";

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash: password,
      role: userRole,
      isVerified: true,
    });

    if (userRole === "candidate") {
      await CandidateProfile.create({ userId: user._id });
    } else {
      await InterviewerProfile.create({ userId: user._id });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push(refreshToken);
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      user: userResponse(user),
      accessToken,
    });
  } catch (err) {
    console.error("Register controller error:", err.message);
    res.status(500).json({ message: "Registration failed: " + err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ message: "This account uses Google sign-in. Please click the Google button." });
    }

    // Using mongoose pre-seeded user's schema methods if they exist, or manual comparison here
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Account suspended" });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Clean expired tokens, keep max 5 refresh tokens
    user.refreshTokens = [...user.refreshTokens.slice(-4), refreshToken];
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      user: userResponse(user),
      accessToken,
    });
  } catch (err) {
    console.error("Login controller error:", err.message);
    res.status(500).json({ message: "Login failed: " + err.message });
  }
};

export const googleAuth = async (req, res) => {
  const { credential, role } = req.body;

  if (!credential) {
    return res.status(400).json({ message: "Google credential is required" });
  }

  try {
    let payload;
    if (process.env.GOOGLE_CLIENT_ID) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (err) {
        console.warn("Google ticket verification failed, decoding payload directly:", err.message);
        payload = jwt.decode(credential);
      }
    } else {
      payload = jwt.decode(credential);
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }

    const { sub: googleId, email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }],
    });

    const userRole = role === "interviewer" ? "interviewer" : "candidate";

    if (!user) {
      user = await User.create({
        googleId,
        email: normalizedEmail,
        name,
        avatar: picture || "",
        role: userRole,
        isVerified: true,
      });

      if (userRole === "candidate") {
        await CandidateProfile.create({ userId: user._id });
      } else {
        await InterviewerProfile.create({ userId: user._id });
      }
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
      }
      await user.save();
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens = [...user.refreshTokens.slice(-4), refreshToken];
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      user: userResponse(user),
      accessToken,
    });
  } catch (err) {
    console.error("Google authentication error:", err.message);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

export const googleAuthToken = async (req, res) => {
  const { googleId, email, name, picture, role } = req.body;

  if (!email || !googleId) {
    return res.status(400).json({ message: "Missing Google token details" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }],
    });

    const userRole = role === "interviewer" ? "interviewer" : "candidate";

    if (!user) {
      user = await User.create({
        googleId,
        email: normalizedEmail,
        name,
        avatar: picture || "",
        role: userRole,
        isVerified: true,
      });

      if (userRole === "candidate") {
        await CandidateProfile.create({ userId: user._id });
      } else {
        await InterviewerProfile.create({ userId: user._id });
      }
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
      }
      await user.save();
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens = [...user.refreshTokens.slice(-4), refreshToken];
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      user: userResponse(user),
      accessToken,
    });
  } catch (err) {
    console.error("Google token authentication error:", err.message);
    res.status(500).json({ message: "Google authentication failed" });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(token)) {
      if (user) {
        user.refreshTokens = [];
        await user.save();
      }
      res.clearCookie("refreshToken");
      return res.status(401).json({ message: "Token reuse detected. All sessions revoked." });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token).concat(newRefreshToken).slice(-5);
    await user.save();

    setRefreshCookie(res, newRefreshToken);

    res.json({
      accessToken: newAccessToken,
    });
  } catch (err) {
    res.clearCookie("refreshToken");
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
        await user.save();
      }
    } catch (_) {}
  }

  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};

export const getMe = async (req, res) => {
  res.json(req.user);
};
