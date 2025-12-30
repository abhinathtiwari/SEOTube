import { Router } from "express";
import { google } from "googleapis";
import { oauth2Client } from "../config/youtubeAuth";
import { User } from "../models/Users";

const router = Router();

router.get("/getData", async (req, res) => {
  const user = await User.findOne({}); 
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
});

router.put("/update/:id", async (req, res) => {
  const { title, description, tags } = req.body;
  const videoId = req.params.id;

  const user = await User.findOne({});
  if (!user?.youtubeRefreshToken) return res.status(401).send("No token");

  oauth2Client.setCredentials({
    refresh_token: user.youtubeRefreshToken,
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
        categoryId: "22",
      },
    },
  });

  res.json({ success: true });
});


router.get("/analytics", async (req, res) => {
  try {
    const end = new Date();
    end.setMonth(end.getMonth() - 1);

    const start = new Date();
    start.setMonth(start.getMonth() - 60);

    const startDate = start.toISOString().split("T")[0];
    const endDate = end.toISOString().split("T")[0];

    const user = await User.findOne({});
    if (!user?.youtubeRefreshToken) {
      return res.status(401).json({ message: "YouTube not connected" });
    }

    oauth2Client.setCredentials({
      refresh_token: user.youtubeRefreshToken,
    });

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
      .slice(0, 20);

    res.json({
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


export default router;
