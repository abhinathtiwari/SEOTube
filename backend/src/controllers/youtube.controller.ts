/** Controller orchestrating YouTube API interactions, video optimization, and analytics. */
import { Response } from "express";
import { google } from "googleapis";
import { oauth2Client } from "../config/youtubeAuth";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/errorHandler";
import { getChannelData } from "../utils/channelData";
import { buildPrompt } from "../utils/prompts";
import { performGrowthAnalysis } from "../utils/growthAnalysis";
import axios from "axios";

export const getData = catchAsync(async (req: any, res: Response) => {
    const user = req.user;
    if (!user?.youtubeRefreshToken) throw new AppError("YouTube not connected", 401);

    oauth2Client.setCredentials({ refresh_token: user.youtubeRefreshToken });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const response = await youtube.search.list({
        part: ["id", "snippet"],
        forMine: true,
        type: ["video"],
        maxResults: 100,
    });

    res.json(response.data.items?.map(v => ({
        videoId: v.id?.videoId,
        title: v.snippet?.title,
    })));
});

export const updateVideo = catchAsync(async (req: any, res: Response) => {
    const { title, description, tags, categoryId, refreshToken } = req.body;
    const { id: videoId } = req.params;

    if (!refreshToken) throw new AppError("Missing refreshToken", 400);

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    await youtube.videos.update({
        part: ["snippet"],
        requestBody: {
            id: videoId,
            snippet: { title, description, tags, categoryId },
        },
    });

    res.json({ success: true });
});

export const getAnalytics = catchAsync(async (req: any, res: Response) => {
    const user = req.user;
    if (!user?.youtubeRefreshToken) throw new AppError("YouTube not connected", 401);

    oauth2Client.setCredentials({ refresh_token: user.youtubeRefreshToken });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const channelData = await getChannelData(oauth2Client);

    const videosResponse = await youtube.search.list({
        part: ["id", "snippet"],
        forMine: true,
        type: ["video"],
        maxResults: 100,
    });

    const videoIds = videosResponse.data.items?.map(v => v.id?.videoId) || [];
    if (videoIds.length === 0) return res.json({ leastPerforming: [] });

    // Analytics dates
    const end = new Date();
    end.setMonth(end.getMonth() - 1);
    const start = new Date();
    start.setMonth(start.getMonth() - 60);

    const analytics = google.youtubeAnalytics({ version: "v2", auth: oauth2Client });
    const response = await analytics.reports.query({
        ids: "channel==MINE",
        startDate: start.toISOString().split("T")[0],
        endDate: end.toISOString().split("T")[0],
        dimensions: "video",
        metrics: "views,averageViewDuration",
        sort: "-views",
        maxResults: 100,
    });

    const rows = response.data.rows || [];
    const videos = rows.map(row => ({
        videoId: row[0],
        views: Number(row[1]),
        averageViewDurationSeconds: Number(row[2]),
    }));

    const leastPerforming = videos
        .sort((a, b) => a.views - b.views)
        .slice(0, parseInt(process.env.NUMBER_OF_VIDEOS || "5"))
        .map(v => {
            const vid = videosResponse.data.items?.find(x => x.id?.videoId === v.videoId);
            return {
                videoId: v.videoId,
                title: vid?.snippet?.title || "",
                description: vid?.snippet?.description || "",
                publishedAt: vid?.snippet?.publishedAt || null,
                channelTitle: vid?.snippet?.channelTitle || "",
                thumbnail: vid?.snippet?.thumbnails?.medium?.url || {},
                views: v.views,
                averageViewDurationSeconds: v.averageViewDurationSeconds,
                videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
                studioUrl: `https://studio.youtube.com/video/${v.videoId}/edit`,
            };
        });

    res.json({ channelData, leastPerforming });
});

export const getRecentVideos = catchAsync(async (req: any, res: Response) => {
    const user = req.user;
    if (!user?.youtubeRefreshToken) throw new AppError("YouTube not connected", 401);

    oauth2Client.setCredentials({ refresh_token: user.youtubeRefreshToken });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const { pageToken } = req.query;

    const response = await youtube.search.list({
        part: ["snippet", "id"],
        forMine: true,
        type: ["video"],
        order: "date",
        maxResults: 10,
        pageToken: pageToken as string,
    });

    const videos = response.data.items?.map(item => ({
        videoId: item.id?.videoId,
        title: item.snippet?.title,
        description: item.snippet?.description,
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url,
        publishedAt: item.snippet?.publishedAt,
    })) || [];

    res.json({
        videos,
        nextPageToken: response.data.nextPageToken,
        prevPageToken: response.data.prevPageToken,
    });
});

export const optimizeVideo = catchAsync(async (req: any, res: Response) => {
    const user = req.user;
    const { id: videoId } = req.params;

    if (!user?.youtubeRefreshToken) throw new AppError("YouTube not connected", 401);
    if (user.recentlyUpdated?.includes(videoId)) throw new AppError("Video already optimized recently", 400);

    oauth2Client.setCredentials({ refresh_token: user.youtubeRefreshToken });
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const channelData = await getChannelData(oauth2Client);

    const videoRes = await youtube.videos.list({
        part: ["snippet"],
        id: [videoId],
    });

    const videoData = videoRes.data.items?.[0];
    if (!videoData) throw new AppError("Video not found", 404);

    const videoToOptimize = {
        videoId,
        title: videoData.snippet?.title,
        description: videoData.snippet?.description,
        tags: videoData.snippet?.tags || [],
    };

    const prompt = buildPrompt([videoToOptimize], channelData.channelName);
    const aiRes = await axios.post(process.env.BACKEND_BASE + "/ai/run", { prompt });

    const aiUpdate = aiRes.data.output?.[0];
    if (!aiUpdate) throw new AppError("AI failed to generate update", 500);

    // Update video on YouTube
    await axios.put(process.env.BACKEND_BASE + `/youtube/update/${videoId}`, {
        ...aiUpdate,
        refreshToken: user.youtubeRefreshToken,
    });

    if (!user.recentlyUpdated) user.recentlyUpdated = [];
    user.recentlyUpdated.push(videoId);
    await user.save();

    res.json({ success: true, optimizedData: aiUpdate });
});

export const growthAnalysis = catchAsync(async (req: any, res: Response) => {
    if (!req.user.youtubeRefreshToken) throw new AppError("YouTube not connected", 401);
    const data = await performGrowthAnalysis(req.user);
    res.json(data);
});
