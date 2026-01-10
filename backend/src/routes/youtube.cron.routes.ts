import { Router } from "express";
import { google } from "googleapis";
import { oauth2Client } from "../config/youtubeAuth";

const router = Router();

router.post("/analytics", async (req: any, res) => {
  try {
    let refreshToken: string | undefined;

    if (!refreshToken && req.body?.refreshToken) {
      refreshToken = req.body.refreshToken;
    }

    if (!refreshToken) {
      return res.status(401).json({ message: "No auth source found" });
    }

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    // Get list of videos
    const videosResponse = await youtube.search.list({
      part: ["id", "snippet"],
      forMine: true,
      type: ["video"],
      maxResults: 100,
    });

    const videoIds = videosResponse.data.items?.map(v => v.id?.videoId) || [];
    if (videoIds.length === 0) return res.json({ leastPerformingVideosMetaData: [] });

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

    const leastPerformingVideos = videos
      .sort((a, b) => a.views - b.views)
      .slice(0, parseInt(process.env.NUMBER_OF_VIDEOS!));

    const leastPerformingIds = leastPerformingVideos.map(v => v.videoId);

    if (leastPerformingIds.length === 0) return res.json({ leastPerformingVideosMetaData: [] });

    // Fetch full video details for the least performing videos
    const detailsResponse = await youtube.videos.list({
      part: ["snippet"],
      id: leastPerformingIds,
    });

    const leastPerformingVideosMetaData = detailsResponse.data.items?.map(vid => ({
      videoId: vid.id,
      title: vid.snippet?.title || "",
      description: vid.snippet?.description || "",
      tags: vid.snippet?.tags || [],
    })) || [];

    res.json({
      leastPerformingVideosMetaData
    });

  } catch (error: any) {
    console.error("YouTube Analytics Error:", error?.response?.data || error);
    res.status(500).json({
      message: "Failed to fetch YouTube analytics",
      error: error?.response?.data || error.message,
    });
  }
});

export default router;