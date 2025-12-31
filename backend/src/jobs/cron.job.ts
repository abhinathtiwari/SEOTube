import axios from "axios";
import { User } from "../models/Users";
import cron from "node-cron";

function buildPrompt(videos: any[]) {
  return `
You are a YouTube SEO expert.

I will give you a list of YouTube videos with poor performance.
For EACH video, generate:
- SEO optimized title (max 70 chars)
- SEO optimized description (max 500 chars)
- 5-10 relevant tags

Rules:
- Do NOT change videoId
- Return ONLY valid JSON
- Do NOT include markdown
- Do NOT include explanations

Input:
${JSON.stringify(videos, null, 2)}

Output format:
[
  {
    "videoId": "",
    "title": "",
    "description": "",
    "tags": []
  }
]
`;
}


export async function runSeoCron() {
  const users = await User.find({
    youtubeRefreshToken: { $exists: true },
  });

  for (const user of users) {
    try {
      // Get analytics
      console.log(user.email);
      const analyticsRes = await axios.post(
        "http://localhost:3000/youtubecron/analytics",
        { refreshToken: user.youtubeRefreshToken }
      );

      const videos = analyticsRes.data.leastPerforming;
      if (!videos.length) continue;

      console.log("here are the videos : ");
      console.log(videos);

      // Build prompt
      const prompt = buildPrompt(videos);

      console.log("here is the prompt : ");
      console.log(prompt);

      // Call AI
      const aiRes = await axios.post(
        "http://localhost:3000/ai/run",
        { prompt }
      );

      const updates = aiRes.data.output;

      console.log("here is the update data list");
      console.log(updates);

      // Update videos
      for (const v of updates) {
        await axios.put(
          `http://localhost:3000/youtube/update/${v.videoId}`,
          {
            title: v.title,
            description: v.description,
            tags: v.tags,
            refreshToken: user.youtubeRefreshToken,
          }
        );
      }

    } catch (err) {
      console.error(`Cron failed for user ${user._id}`, err);
    }
  }
}

export const startCronJob = () => {
  cron.schedule(process.env.CRON_TIME!, async () => {
    console.log("Running SEO cron");
    await runSeoCron();
  });
}