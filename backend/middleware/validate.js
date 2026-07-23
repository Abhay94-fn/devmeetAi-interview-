import { validationResult } from "express-validator";
import mongoose from "mongoose";

/**
 * Express middleware that checks express-validator results.
 * If validation fails, returns 400 with error messages array.
 */
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

/**
 * Middleware that validates a named route param is a valid MongoDB ObjectId.
 * Usage: validateObjectId("id")  or  validateObjectId("sessionId")
 */
export const validateObjectId = (paramName) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
    return res.status(400).json({ message: `Invalid ${paramName}: must be a valid ObjectId` });
  }
  next();
};
