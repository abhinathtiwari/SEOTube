import { google } from "googleapis";

export const oauth2Client = new google.auth.OAuth2(
  process.env.YT_CLIENT_ID,
  process.env.YT_CLIENT_SECRET,
  process.env.BACKEND_BASE + "/auth/youtube/callback" // redirect URI should be same in GCP
);
