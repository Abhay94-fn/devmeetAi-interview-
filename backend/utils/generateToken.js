import jwt from 'jsonwebtoken';
export const generateAccessToken = (userId, role) =>
  jwt.sign({ id: userId.toString(), role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' });
export const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId.toString() }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' });
