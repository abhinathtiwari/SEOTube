/** Weekly cron job to send reminders and AI ideas to inactive creators. */
import cron from "node-cron";
import { User } from "../models/Users";
import { google } from "googleapis";
import { sendReminderEmail } from "../utils/sendEmail";

export const startReminderCron = () => {
    const cronTime = process.env.CRON_TIME2 || "0 0 */7 * *";

    cron.schedule(cronTime, async () => {
        console.log("Running upload reminder cron");
        const users = await User.find({ youtubeRefreshToken: { $exists: true } });

        for (const user of users) {
            try {
                const auth = new google.auth.OAuth2(
                    process.env.YT_CLIENT_ID,
                    process.env.YT_CLIENT_SECRET
                );
                auth.setCredentials({ refresh_token: user.youtubeRefreshToken });

                const youtube = google.youtube({ version: "v3", auth });

                const response = await youtube.search.list({
                    forMine: true,
                    type: ["video"],
                    order: "date",
                    maxResults: 1,
                    part: ["snippet"],
                });

                const items = response.data.items || [];
                if (items.length === 0) continue;

                const lastUploadDate = new Date(items[0].snippet?.publishedAt || "");
                const now = new Date();
                const diffDays = Math.ceil(Math.abs(now.getTime() - lastUploadDate.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays <= Number(process.env.REMINDER_THRESHOLD_DAYS)) {
                    console.log(`User ${user.email} uploaded recently (${diffDays} days ago). Skipping.`);
                    continue;
                }

                // Send reminder email
                console.log(`User ${user.email} hasn't uploaded in ${process.env.REMINDER_THRESHOLD_DAYS} days. Sending reminder.`);

                const ideas = user.videoIdeaList.length > 0 ? user.videoIdeaList : ["Check your dashboard for new ideas!"];

                await sendReminderEmail(user.email, ideas);

            } catch (err) {
                console.error(`Reminder cron failed for user ${user.email}`, err);
            }
        }
    });
};
