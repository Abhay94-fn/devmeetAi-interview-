import mongoose from "mongoose";

const interviewerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    company: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    linkedIn: { type: String, default: "" },
    stats: {
      totalConducted: { type: Number, default: 0 },
      avgRatingGiven: { type: Number, default: 0 },
    },
    questionSets: {
      type: [
        {
          name: String,
          questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
          isPublic: { type: Boolean, default: false },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("InterviewerProfile", interviewerProfileSchema);
