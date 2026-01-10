import { Router } from "express";
import { authMiddleware } from "../utils/middlewares";
import { oauth2Client } from "../config/youtubeAuth";
import { getChannelData } from "../utils/channelData";

const router = Router();

router.get("/me", authMiddleware, async (req: any, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(404).json({ message: "User not found" });

        const formattedDate = user.lastOptimizedAt
            ? new Date(user.lastOptimizedAt).toLocaleDateString("en-GB").replace(/\//g, "-")
            : null;

        res.json({
            email: user.email,
            channelId: user.channelId,
            lastOptimizedAt: formattedDate,
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

export default router;
