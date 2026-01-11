import { Router } from "express";
import { authMiddleware } from "../utils/middlewares";
import { oauth2Client } from "../config/youtubeAuth";
import { getChannelData } from "../utils/channelData";
import { CronExpressionParser } from "cron-parser";

const router = Router();

router.get("/me", authMiddleware, async (req: any, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(404).json({ message: "User not found" });

        const formatDate = (date: Date | null) => {
            if (!date) return null;
            const d = String(date.getDate()).padStart(2, "0");
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const y = String(date.getFullYear()).slice(-2);
            return `${d}-${m}-${y}`;
        };

        const formattedDate = formatDate(user.lastOptimizedAt);

        let upcomingOptimization = null;
        try {
            const cronTime = process.env.CRON_TIME || "0 0 */15 * *";
            console.log("Processing CRON_TIME:", cronTime);
            const interval = CronExpressionParser.parse(cronTime);
            const nextDate = interval.next().toDate();
            console.log("Calculated next date:", nextDate);
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
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch user data", error: err.message });
    }
});

router.get("/channel", authMiddleware, async (req: any, res) => {
    try {
        const user = req.user;
        if (!user?.youtubeRefreshToken) return res.status(401).send("No token");

        oauth2Client.setCredentials({
            refresh_token: user.youtubeRefreshToken,
        });

        const channelData = await getChannelData(oauth2Client);
        res.json(channelData);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch channel data", error: err.message });
    }
});

router.post("/toggle-updates", authMiddleware, async (req: any, res) => {
    try {
        const user = req.user;
        user.pauseCronUpdate = !user.pauseCronUpdate;
        await user.save();
        res.json({ pauseCronUpdate: user.pauseCronUpdate });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Failed to toggle updates", error: err.message });
    }
});

export default router;
