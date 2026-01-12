/** Logic hook for the home page to orchestrate analytics and growth data fetching. */
import { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { channelNameState, customUrlState } from "../state/user";
import { youtubeService } from "../services/youtubeService";
import { userService } from "../services/userService";

export const useHomeData = () => {
    const [channelData, setChannelData] = useState<any>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [upcomingOpt, setUpcomingOpt] = useState<string | null>(null);
    const [growthData, setGrowthData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const setChannelName = useSetRecoilState(channelNameState);
    const setCustomUrl = useSetRecoilState(customUrlState);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [analytics, user, growth] = await Promise.all([
                    youtubeService.getAnalytics(),
                    userService.getMe(),
                    youtubeService.getGrowthAnalysis()
                ]);

                setVideos(analytics.leastPerforming);
                setChannelData(analytics.channelData);
                setUpcomingOpt(user.upcomingOptimization);
                setGrowthData(growth);

                if (analytics.channelData) {
                    setChannelName(analytics.channelData.channelName || "");
                    if (analytics.channelData.customUrl) setCustomUrl(analytics.channelData.customUrl);
                }
            } catch (err) {
                console.error("Failed to fetch home data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [setChannelName, setCustomUrl]);

    return { channelData, videos, upcomingOpt, growthData, loading };
};
