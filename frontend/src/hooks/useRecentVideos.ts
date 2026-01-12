/** Logic hook for managing video listings, pagination, and optimization triggers. */
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { recentlyUpdatedState } from "../state/user";
import { youtubeService } from "../services/youtubeService";
import { userService } from "../services/userService";

export const useRecentVideos = () => {
    const [videos, setVideos] = useState<any[]>([]);
    const [nextPageToken, setNextPageToken] = useState<string | null>(null);
    const [currentPageToken, setCurrentPageToken] = useState<string | null>(null);
    const [tokenHistory, setTokenHistory] = useState<(string | null)[]>([]);
    const [loading, setLoading] = useState(false);
    const [optimizingId, setOptimizingId] = useState<string | null>(null);
    const [recentlyUpdated, setRecentlyUpdated] = useRecoilState(recentlyUpdatedState);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [videoRes, user] = await Promise.all([
                    youtubeService.getRecentVideos(currentPageToken || undefined),
                    userService.getMe()
                ]);
                setVideos(videoRes.videos);
                setNextPageToken(videoRes.nextPageToken || null);
                if (user.recentlyUpdated) {
                    setRecentlyUpdated(user.recentlyUpdated);
                }
            } catch (err) {
                console.error("Failed to load recent videos", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [currentPageToken, setRecentlyUpdated]);

    const handleNext = () => {
        if (nextPageToken) {
            setTokenHistory(prev => [...prev, currentPageToken]);
            setCurrentPageToken(nextPageToken);
        }
    };

    const handlePrev = () => {
        if (tokenHistory.length > 0) {
            const prevHistory = [...tokenHistory];
            const prevToken = prevHistory.pop()!;
            setTokenHistory(prevHistory);
            setCurrentPageToken(prevToken);
        }
    };

    const handleOptimize = async (videoId: string) => {
        if (optimizingId) return;
        setOptimizingId(videoId);
        try {
            await youtubeService.optimizeVideo(videoId);
            setRecentlyUpdated(prev => [...prev, videoId]);
        } catch (err) {
            console.error("Optimization failed", err);
            throw err;
        } finally {
            setOptimizingId(null);
        }
    };

    return {
        videos,
        loading,
        optimizingId,
        recentlyUpdated,
        handleNext,
        handlePrev,
        handleOptimize,
        hasPrev: tokenHistory.length > 0,
        hasNext: !!nextPageToken
    };
};
