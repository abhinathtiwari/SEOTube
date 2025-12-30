import { Router } from "express";
import { oauth2Client } from "../config/youtubeAuth";
import { google } from "googleapis";
import { User } from "../models/Users";

const router = Router();

// Redirect to Google OAuth
router.get("/youtube", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/youtube.force-ssl", "https://www.googleapis.com/auth/yt-analytics.readonly"],
  });
  res.redirect(url);
});

//  OAuth callback
router.get("/youtube/callback", async (req, res) => {
  const code = req.query.code as string;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Get user channel info
  const youtube = google.youtube({ version: "v3", auth: oauth2Client });
  const response = await youtube.channels.list({ part: ["id", "snippet"], mine: true });
  const channel = response.data.items?.[0];

  if (!channel) return res.send("No channel found");

  // Save refresh token in DB
  await User.findOneAndUpdate(
    { email: channel.snippet?.title || "unknown" },
    {
      email: channel.snippet?.title,
      youtubeRefreshToken: tokens.refresh_token,
      channelId: channel.id,
    },
    { upsert: true }
  );

  res.send("YouTube connected successfully!");
});

export default router;
