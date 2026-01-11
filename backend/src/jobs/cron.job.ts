import axios from "axios";
import { User } from "../models/Users";
import cron from "node-cron";
import { sendSuccessEmail } from "../utils/sendEmail";
import { buildPrompt } from "../utils/prompts";


export async function runSeoCron() {
  const users = await User.find({
    youtubeRefreshToken: { $exists: true },
    pauseCronUpdate: { $ne: true },
  });

  for (const user of users) {
    try {
      // Get analytics
      console.log(user.email);
      const analyticsRes = await axios.post(
        process.env.BACKEND_BASE + "/youtubecron/analytics",
        { refreshToken: user.youtubeRefreshToken }
      );

      const videos = analyticsRes.data.leastPerformingVideosMetaData;
      if (!videos.length) continue;

      console.log("here are the videos : ");
      console.log(videos);

      // Build prompt
      const prompt = buildPrompt(videos);

      console.log("here is the prompt : ");
      console.log(prompt);

      // Call AI
      const aiRes = await axios.post(
        process.env.BACKEND_BASE + "/ai/run",
        { prompt }
      );

      const aiUpdates = aiRes.data.output;

      console.log("here is the response from AI");
      console.log(aiUpdates);

      // Update videos
      for (const v of aiUpdates) {
        await axios.put(
          process.env.BACKEND_BASE! + `/youtube/update/${v.videoId}`,
          {
            title: v.title,
            description: v.description,
            tags: v.tags,
            categoryId: v.categoryId,
            refreshToken: user.youtubeRefreshToken,
          }
        );
      }

      // Email notification
      await sendSuccessEmail(user.email, videos, aiUpdates);

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