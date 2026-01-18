import { google } from "googleapis";
import axios from "axios";
import { User } from "../models/Users";
import { buildGrowthPrompt } from "./prompts";
import { decryptRefreshToken } from "./crypto";

export const performGrowthAnalysis = async (user: any) => {
    try {
        const auth = new google.auth.OAuth2(
            process.env.YT_CLIENT_ID,
            process.env.YT_CLIENT_SECRET
        );
        // decrypt refresh token for use (do not mutate DB)
        const refreshToken = decryptRefreshToken(user.youtubeRefreshToken);
        auth.setCredentials({ refresh_token: refreshToken });

        const youtube = google.youtube({ version: "v3", auth });

        // 1. Fetch last 5 videos
        const response = await youtube.search.list({
            forMine: true,
            type: ["video"],
            order: "date",
            maxResults: 5,
            part: ["snippet"],
        });

        const items = response.data.items || [];
        if (items.length === 0) return null;

        const videoIds = items.map(item => item.id?.videoId).filter(id => id) as string[];

        // Fetch full video details including tags
        const videoDetailsResponse = await youtube.videos.list({
            id: videoIds,
            part: ["snippet"],
        });

        const recentVideos = videoDetailsResponse.data.items?.map(item => ({
            id: item.id,
            publishedAt: item.snippet?.publishedAt,
            title: item.snippet?.title,
            description: item.snippet?.description,
            tags: item.snippet?.tags || [],
        })) || [];

        if (recentVideos.length === 0) return null;

        const currUploadedVideoId = recentVideos[0].id;

        // 2. Check if analysis is needed
        if (user.prevUploadedVideoId === currUploadedVideoId && user.marketingAdvice) {
            return {
                recentVideos,
                marketingAdvice: user.marketingAdvice,
                videoIdeaList: user.videoIdeaList
            };
        }

        // 3. Run AI analysis
        const prompt = buildGrowthPrompt(recentVideos);
        const aiRes = await axios.post(`${process.env.BACKEND_BASE}/ai/run`, { prompt });
        const analysis = aiRes.data.output;

        // 4. Save to DB
        user.prevUploadedVideoId = currUploadedVideoId;
        user.marketingAdvice = analysis.message;
        user.videoIdeaList = analysis.ideaList;
        await user.save();

        return {
            recentVideos,
            marketingAdvice: user.marketingAdvice,
            videoIdeaList: user.videoIdeaList
        };
    } catch (err) {
        console.error("Growth analysis failed:", err);
        return null;
    }
};
