/** Mongoose schema and model definition for the User entity. */
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  youtubeRefreshToken: { type: String },
  channelId: { type: String },
  lastOptimizedAt: { type: Date, default: null },
  pauseCronUpdate: { type: Boolean, default: false },
  recentlyUpdated: { type: [String], default: [] },
  prevUploadedVideoId: { type: String, default: null },
  marketingAdvice: { type: String, default: "" },
  videoIdeaList: { type: [String], default: [] },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
