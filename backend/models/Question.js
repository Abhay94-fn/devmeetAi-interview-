import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: { type: String, enum: ["beginner", "intermediate", "senior"], required: true },
    topic: { type: String, required: true },
    companies: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    statement: { type: String, required: true },
    examples: {
      type: [
        {
          input: String,
          output: String,
          explanation: String,
        },
      ],
      default: [],
    },
    constraints: { type: [String], default: [] },
    starterCode: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      java: { type: String, default: "" },
      cpp: { type: String, default: "" },
      c: { type: String, default: "" },
      go: { type: String, default: "" },
    },
    hints: { type: [String], default: [] },
    expectedComplexity: {
      time: { type: String, default: "" },
      space: { type: String, default: "" },
    },
    timeComplexityExpected: { type: String, default: "" },
    spaceComplexityExpected: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isPublic: { type: Boolean, default: true },
    stats: {
      attempts: { type: Number, default: 0 },
      avgScore: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

questionSchema.index({ topic: 1, difficulty: 1 });
// slug is already indexed via unique:true in the field definition above

export default mongoose.model("Question", questionSchema);
