import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  youtubeRefreshToken: { type: String, required: true },
  channelId: { type: String, required: true },
});

export const User = mongoose.model("User", userSchema);
