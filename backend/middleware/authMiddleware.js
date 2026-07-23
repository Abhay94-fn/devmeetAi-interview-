import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Verify JWT access token from Authorization header or httpOnly cookie.
 * Attaches decoded user to req.user.
 */
export const protect = async (req, res, next) => {
  let token = null;

  // 1. Check Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. Fallback: check httpOnly cookie
  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized — no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-passwordHash -refreshTokens");
    if (!user) {
      return res.status(401).json({ message: "Not authorized — user not found" });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Account suspended" });
    }

    req.user = {
      _id: user._id,
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      tier: user.tier || "free",
      avatar: user.avatar,
      isVerified: user.isVerified,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ message: "Not authorized — invalid token" });
  }
};
