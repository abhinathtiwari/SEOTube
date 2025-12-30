import { google } from "googleapis";

export const oauth2Client = new google.auth.OAuth2(
  process.env.YT_CLIENT_ID,
  process.env.YT_CLIENT_SECRET,
  "http://localhost:3000/auth/youtube/callback" // redirect URI
);
