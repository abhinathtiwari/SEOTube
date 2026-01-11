import { Router } from "express";
import { authMiddleware } from "../utils/middlewares";
import { oauth2Client } from "../config/youtubeAuth";
import { getChannelData } from "../utils/channelData";

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

        const cronTime = process.env.CRON_TIME || "0 0 */15 * *";
        const intervalMatch = cronTime.match(/\*\/(\d+)/);
        const intervalDays = intervalMatch ? parseInt(intervalMatch[1]) : 15;

        const baseDate = user.lastOptimizedAt ? new Date(user.lastOptimizedAt) : new Date();
        const upcomingDate = new Date(baseDate);
        upcomingDate.setDate(baseDate.getDate() + intervalDays);

        const upcomingOptimization = formatDate(upcomingDate);

        res.json({
            email: user.email,
            channelId: user.channelId,
            lastOptimizedAt: formattedDate,
            upcomingOptimization,
            pauseCronUpdate: user.pauseCronUpdate
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
