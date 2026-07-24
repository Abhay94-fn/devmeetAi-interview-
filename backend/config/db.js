import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import User from "../models/User.js";
import CandidateProfile from "../models/CandidateProfile.js";
import InterviewerProfile from "../models/InterviewerProfile.js";

let mongod = null;

export default async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;

    if (uri) {
      await mongoose.connect(uri);
      console.log(`MongoDB Atlas connected: ${mongoose.connection.host}`);
    } else {
      console.log("MONGO_URI not set — starting standard in-memory MongoDB with persistence...");
      const dbPath = path.resolve(process.cwd(), "mongodb-data");
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }
      mongod = await MongoMemoryServer.create({
        instance: {
          dbPath,
          storageEngine: "wiredTiger",
        },
      });
      const memUri = mongod.getUri();
      await mongoose.connect(memUri);
      console.log(`In-memory MongoDB running at: ${memUri}`);
    }

    // Seed default credentials on startup
    await seedDefaultUsers();

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}

async function seedDefaultUsers() {
  try {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash("DevMeetSecurePass2026!", salt);

    // 1. Seed/Update Candidate: candidate@devmeet.com / DevMeetSecurePass2026!
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

    // Ensure CandidateProfile exists
    const existingCandProfile = await CandidateProfile.findOne({ userId: candidateUser._id });
    if (!existingCandProfile) {
      await CandidateProfile.create({ userId: candidateUser._id });
    }
    console.log(`Default candidate account seeded successfully: ${candidateEmail}`);

    // 2. Seed/Update Interviewer: interviewer@devmeet.com / DevMeetSecurePass2026!
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

    // Ensure InterviewerProfile exists
    const existingInterProfile = await InterviewerProfile.findOne({ userId: interviewerUser._id });
    if (!existingInterProfile) {
      await InterviewerProfile.create({ userId: interviewerUser._id });
    }
    console.log(`Default interviewer account seeded successfully: ${interviewerEmail}`);

  } catch (err) {
    console.error("Failed to seed default users:", err.message);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}
