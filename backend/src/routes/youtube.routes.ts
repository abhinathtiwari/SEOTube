import { Router } from "express";
import { google } from "googleapis";
import { oauth2Client } from "../config/youtubeAuth";
import { authMiddleware } from "../utils/middlewares";
import { getChannelData } from "../utils/channelData";
import axios from "axios";
import { buildPrompt } from "../utils/prompts";
import { performGrowthAnalysis } from "../utils/growthAnalysis";

const router = Router();

router.get("/getData", authMiddleware, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.youtubeRefreshToken) return res.status(401).send("No token");

    oauth2Client.setCredentials({
      refresh_token: user.youtubeRefreshToken,
    });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const response = await youtube.search.list({
      part: ["id", "snippet"],
      forMine: true,
      type: ["video"],
      maxResults: 100,
    });

    res.json(
      response.data.items?.map(v => ({
        videoId: v.id?.videoId,
        title: v.snippet?.title,
      }))
    );
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch videos", error: err.message });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const { title, description, tags, categoryId, refreshToken } = req.body;
    const videoId = req.params.id;

    if (!refreshToken) return res.status(400).json({ message: "Missing refreshToken" });

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    await youtube.videos.update({
      part: ["snippet"],
      requestBody: {
        id: videoId,
        snippet: {
          title,
          description,
          tags,
          categoryId
        },
      },
    });

    res.json({ success: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to update video", error: err.message });
  }
});


router.post("/analytics", authMiddleware, async (req: any, res) => {
  try {
    let refreshToken: string | undefined;
    if (req.user?.youtubeRefreshToken) {
      refreshToken = req.user.youtubeRefreshToken;
    }

    if (!refreshToken) {
      return res.status(401).json({ message: "No auth source found" });
    }

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const channelData = await getChannelData(oauth2Client);

    // Get list of videos
    const videosResponse = await youtube.search.list({
      part: ["id", "snippet"],
      forMine: true,
      type: ["video"],
      maxResults: 100,
    });

    const videoIds = videosResponse.data.items?.map(v => v.id?.videoId) || [];
    if (videoIds.length === 0) return res.json({ leastPerforming: [] });

    const end = new Date();
    end.setMonth(end.getMonth() - 1);

    const start = new Date();
    start.setMonth(start.getMonth() - 60);

    const startDate = start.toISOString().split("T")[0];
    const endDate = end.toISOString().split("T")[0];

    const analytics = google.youtubeAnalytics({
      version: "v2",
      auth: oauth2Client,
    });

    const response = await analytics.reports.query({
      ids: "channel==MINE",
      startDate,
      endDate,
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
      .slice(0, parseInt(process.env.NUMBER_OF_VIDEOS!))
      .map(v => {
        const vid = videosResponse.data.items?.find(
          x => x.id?.videoId === v.videoId
        );

        return {
          // Basic
          videoId: v.videoId,
          title: vid?.snippet?.title || "",
          description: vid?.snippet?.description || "",
          publishedAt: vid?.snippet?.publishedAt || null,
          channelTitle: vid?.snippet?.channelTitle || "",
          thumbnail: vid?.snippet?.thumbnails?.medium?.url || {},

          // Analytics
          views: v.views,
          averageViewDurationSeconds: v.averageViewDurationSeconds,

          //Links
          videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
          studioUrl: `https://studio.youtube.com/video/${v.videoId}/edit`,
        };
      });

    res.json({
      channelData,
      leastPerforming
    });

  } catch (error: any) {
    console.error("YouTube Analytics Error:", error?.response?.data || error);
    res.status(500).json({
      message: "Failed to fetch YouTube analytics",
      error: error?.response?.data || error.message,
    });
  }
});

router.get("/recent-videos", authMiddleware, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user?.youtubeRefreshToken) return res.status(401).send("No token");

    oauth2Client.setCredentials({
      refresh_token: user.youtubeRefreshToken,
    });

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
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recent videos", error: err.message });
  }
});

router.post("/optimize/:id", authMiddleware, async (req: any, res) => {
  try {
    const user = req.user;
    const { id: videoId } = req.params;

    if (!user?.youtubeRefreshToken) return res.status(401).send("No token");
    if (user.recentlyUpdated?.includes(videoId)) {
      return res.status(400).json({ message: "Video already optimized recently" });
    }

    oauth2Client.setCredentials({
      refresh_token: user.youtubeRefreshToken,
    });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const channelData = await getChannelData(oauth2Client);

    // Get specific video details
    const videoRes = await youtube.videos.list({
      part: ["snippet"],
      id: [videoId],
    });

    const videoData = videoRes.data.items?.[0];
    if (!videoData) return res.status(404).json({ message: "Video not found" });

    const videoToOptimize = {
      videoId,
      title: videoData.snippet?.title,
      description: videoData.snippet?.description,
      tags: videoData.snippet?.tags || [],
    };

    const prompt = buildPrompt([videoToOptimize], channelData.channelName);

    const aiRes = await axios.post(
      process.env.BACKEND_BASE + "/ai/run",
      { prompt }
    );

    const aiUpdate = aiRes.data.output?.[0];
    if (!aiUpdate) throw new Error("AI failed to generate update");

    // Update video on YouTube
    await axios.put(
      process.env.BACKEND_BASE! + `/youtube/update/${videoId}`,
      {
        title: aiUpdate.title,
        description: aiUpdate.description,
        tags: aiUpdate.tags,
        categoryId: aiUpdate.categoryId,
        refreshToken: user.youtubeRefreshToken,
      }
    );

    // Update user in DB
    if (!user.recentlyUpdated) user.recentlyUpdated = [];
    user.recentlyUpdated.push(videoId);
    await user.save();

    res.json({ success: true, optimizedData: aiUpdate });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Optimization failed", error: err.message });
  }
});

router.get("/growth-analysis", authMiddleware, async (req: any, res) => {
  try {
    const user = req.user;
    if (!user.youtubeRefreshToken) return res.status(401).send("YouTube not connected");

    const data = await performGrowthAnalysis(user);
    res.json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Failed to perform growth analysis" });
  }
});

export default router;
