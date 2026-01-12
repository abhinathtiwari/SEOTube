/** Data service for abstracting complex YouTube and analytics API operations. */
import api from "../api";

export const youtubeService = {
    getAnalytics: async () => {
        const response = await api.post("/youtube/analytics");
        return response.data;
    },
    getGrowthAnalysis: async () => {
        const response = await api.get("/youtube/growth-analysis");
        return response.data;
    },
    getRecentVideos: async (pageToken?: string) => {
        const response = await api.get("/youtube/recent-videos", {
            params: { pageToken }
        });
        return response.data;
    },
    optimizeVideo: async (videoId: string) => {
        const response = await api.post(`/youtube/optimize/${videoId}`);
        return response.data;
    }
};
