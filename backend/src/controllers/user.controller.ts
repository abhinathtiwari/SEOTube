import { Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/errorHandler";
import { oauth2Client } from "../config/youtubeAuth";
import { getChannelData } from "../utils/channelData";
import { CronExpressionParser } from "cron-parser";

const formatDate = (date: Date | null) => {
    if (!date) return null;
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = String(date.getFullYear()).slice(-2);
    return `${d}-${m}-${y}`;
};

export const getMe = catchAsync(async (req: any, res: Response) => {
    const user = req.user;
    if (!user) throw new AppError("User not found", 404);

    const formattedDate = formatDate(user.lastOptimizedAt);

    let upcomingOptimization = null;
    try {
        const cronTime = process.env.CRON_TIME || "0 0 */15 * *";
        const interval = CronExpressionParser.parse(cronTime);
        const nextDate = interval.next().toDate();
        upcomingOptimization = formatDate(nextDate);
    } catch (err) {
        console.error("Cron parse error:", err);
    }

    res.json({
        email: user.email,
        channelId: user.channelId,
        lastOptimizedAt: formattedDate,
        upcomingOptimization,
        pauseCronUpdate: user.pauseCronUpdate,
        recentlyUpdated: user.recentlyUpdated || []
    });
});

export const getChannel = catchAsync(async (req: any, res: Response) => {
    const user = req.user;
    if (!user?.youtubeRefreshToken) throw new AppError("YouTube not connected", 401);

    oauth2Client.setCredentials({
        refresh_token: user.youtubeRefreshToken,
    });

    const channelData = await getChannelData(oauth2Client);
    res.json(channelData);
});

export const toggleUpdates = catchAsync(async (req: any, res: Response) => {
    const user = req.user;
    user.pauseCronUpdate = !user.pauseCronUpdate;
    await user.save();
    res.json({ pauseCronUpdate: user.pauseCronUpdate });
});
