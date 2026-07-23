import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionCode: { type: String, required: true, unique: true },
    type: { type: String, enum: ["ai_solo", "peer", "live_interview"], default: "ai_solo" },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: ["scheduled", "waiting", "in_progress", "generating_report", "completed", "cancelled"],
      default: "waiting",
    },
    topic: { type: String, default: "" },
    difficulty: { type: String, enum: ["beginner", "intermediate", "senior"], default: "intermediate" },
    language: { type: String, default: "javascript" },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", default: null },
    question: {
      title: { type: String, default: "" },
      statement: { type: String, default: "" },
      starterCode: { type: mongoose.Schema.Types.Mixed, default: {} },
      hints: { type: [String], default: [] },
      expectedComplexity: {
        time: { type: String, default: "" },
        space: { type: String, default: "" },
      },
    },
    questions: { type: [String], default: [] },
    currentQuestionIndex: { type: Number, default: 0 },
    meetingUrl: { type: String, default: "" },
    meetingName: { type: String, default: "" },
    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
    scheduledFor: { type: Date, default: null },
    duration: { type: Number, default: 0 },
    codeHistory: {
      type: [
        {
          code: String,
          language: String,
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    chatHistory: {
      type: [
        {
          role: { type: String, enum: ["interviewer", "candidate", "system"] },
          text: String,
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    interviewerNotes: { type: String, default: "" },
    recommendation: {
      type: String,
      enum: ["strong_yes", "yes", "neutral", "no", "strong_no", ""],
      default: "",
    },
    integrityFlags: {
      type: [
        {
          type: { type: String },
          detail: String,
          timestamp: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    recordings: { type: [String], default: [] },
    aiReport: { type: mongoose.Schema.Types.ObjectId, ref: "Report", default: null },
  },
  { timestamps: true }
);

// sessionCode is already indexed via unique:true in the field definition above
sessionSchema.index({ candidateId: 1, status: 1 });
sessionSchema.index({ interviewerId: 1, status: 1 });

export default mongoose.model("Session", sessionSchema);
