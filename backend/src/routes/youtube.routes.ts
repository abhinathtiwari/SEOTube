import { Router } from "express";
import { authMiddleware } from "../utils/middlewares";
import * as youtubeController from "../controllers/youtube.controller";

const router = Router();

router.get("/getData", authMiddleware, youtubeController.getData);
router.put("/update/:id", youtubeController.updateVideo);
router.post("/analytics", authMiddleware, youtubeController.getAnalytics);
router.get("/recent-videos", authMiddleware, youtubeController.getRecentVideos);
router.post("/optimize/:id", authMiddleware, youtubeController.optimizeVideo);
router.get("/growth-analysis", authMiddleware, youtubeController.growthAnalysis);

export default router;
