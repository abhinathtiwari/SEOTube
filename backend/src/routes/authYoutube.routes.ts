import { Router } from "express";
import { oauth2Client } from "../config/youtubeAuth";
import { google } from "googleapis";
import { authMiddleware } from "../utils/middlewares";

const router = Router();

// Redirect to Google OAuth
router.get("/youtube", authMiddleware, (req: any, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/youtube.force-ssl",
      "https://www.googleapis.com/auth/yt-analytics.readonly"
    ],
  });
  res.redirect(url);
});

// OAuth callback
router.get("/youtube/callback", authMiddleware, async (req: any, res) => {
  const code = req.query.code as string;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Get user channel info
  const youtube = google.youtube({ version: "v3", auth: oauth2Client });
  const response = await youtube.channels.list({ part: ["id", "snippet"], mine: true });
  const channel = response.data.items?.[0];

  if (!channel) return res.send("No channel found");

  // Save refresh token and channel ID for logged-in user
  req.user.youtubeRefreshToken = tokens.refresh_token || req.user.youtubeRefreshToken;
  req.user.channelId = channel.id;
  await req.user.save();

  res.redirect(process.env.FRONTEND_BASE!+"/home");
});

export default router;
