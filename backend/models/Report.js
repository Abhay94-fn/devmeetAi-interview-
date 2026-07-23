import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    overallScore: { type: Number, default: 0 },
    breakdown: {
      problemSolving: { type: Number, default: 0 },
      codeQuality: { type: Number, default: 0 },
      timeComplexity: { type: Number, default: 0 },
      spaceComplexity: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      edgeCases: { type: Number, default: 0 },
    },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    tips: { type: [String], default: [] },
    estimatedLevel: { type: String, default: "" },
    companyFitMap: {
      faang: { type: Number, default: 0 },
      startup: { type: Number, default: 0 },
      enterprise: { type: Number, default: 0 },
    },
    studyResources: { type: [String], default: [] },
    integrityScore: { type: Number, default: 100 },
    transcriptFeedback: {
      type: [
        {
          question: String,
          candidateAnswer: String,
          score: Number,
          feedback: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

reportSchema.index({ candidateId: 1 });
reportSchema.index({ sessionId: 1 });

export default mongoose.model("Report", reportSchema);
