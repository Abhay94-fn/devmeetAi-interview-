import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["candidate", "interviewer", "admin"],
      default: "candidate",
    },
    googleId: { type: String, default: null, sparse: true },
    passwordHash: { type: String, default: "" },
    tier: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "pro", // Defaulting to pro locally so all features are unlocked, but can be switched
    },
    refreshTokens: { type: [String], default: [] },
    isVerified: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// email already indexed via unique:true in the schema field definition above
// googleId sparse index is defined via sparse:true in the schema field definition above

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash") || this.passwordHash.startsWith("$2")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("User", userSchema);
