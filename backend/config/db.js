import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import CandidateProfile from "../models/CandidateProfile.js";
import InterviewerProfile from "../models/InterviewerProfile.js";

export default async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ CRITICAL: MONGO_URI is missing in Environment Variables!");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB Atlas connected successfully: ${mongoose.connection.host}`);
    await seedDefaultUsers();
  } catch (err) {
    console.error(`❌ MongoDB connection failed (${err.message}). Check MONGO_URI username and password in Render Environment Variables.`);
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });
}

async function seedDefaultUsers() {
  try {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash("DevMeetSecurePass2026!", salt);

    // 1. Seed/Update Candidate: candidate@devmeet.com
    const candidateEmail = "candidate@devmeet.com";
    const candidateUser = await User.findOneAndUpdate(
      { email: candidateEmail },
      {
        $set: {
          name: "Default Candidate",
          passwordHash,
          role: "candidate",
          isVerified: true,
        }
      },
      { upsert: true, new: true }
    );

    const existingCandProfile = await CandidateProfile.findOne({ userId: candidateUser._id });
    if (!existingCandProfile) {
      await CandidateProfile.create({ userId: candidateUser._id });
    }

    // 2. Seed/Update Interviewer: interviewer@devmeet.com
    const interviewerEmail = "interviewer@devmeet.com";
    const interviewerUser = await User.findOneAndUpdate(
      { email: interviewerEmail },
      {
        $set: {
          name: "Default Interviewer",
          passwordHash,
          role: "interviewer",
          isVerified: true,
        }
      },
      { upsert: true, new: true }
    );

    const existingInterProfile = await InterviewerProfile.findOne({ userId: interviewerUser._id });
    if (!existingInterProfile) {
      await InterviewerProfile.create({ userId: interviewerUser._id });
    }

  } catch (err) {
    console.error("Failed to seed default users:", err.message);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
