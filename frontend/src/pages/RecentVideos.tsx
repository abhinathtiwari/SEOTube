import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../api";
import { useRecoilState } from "recoil";
import { recentlyUpdatedState } from "../state/user";
import Card from "../components/Card";
import "../styles/RecentVideos.css";

interface Video {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

export default function RecentVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [currentPageToken, setCurrentPageToken] = useState<string | null>(null);
  const [tokenHistory, setTokenHistory] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [recentlyUpdated, setRecentlyUpdated] = useRecoilState(recentlyUpdatedState);
  const [generatingThumbId, setGeneratingThumbId] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos(currentPageToken);
    fetchUserData();
  }, [currentPageToken]);

  const fetchUserData = async () => {
    try {
      const res = await api.get("/users/me");
      if (res.data.recentlyUpdated) {
        setRecentlyUpdated(res.data.recentlyUpdated);
      }
    } catch (err) {
      console.error("Failed to fetch user data", err);
    }
  };

  const fetchVideos = async (token: string | null) => {
    setLoading(true);
    try {
      const res = await api.get(`/youtube/recent-videos${token ? `?pageToken=${token}` : ""}`);
      setVideos(res.data.videos);
      setNextPageToken(res.data.nextPageToken || null);
    } catch (err) {
      console.error("Failed to fetch videos", err);
    } finally {
      setLoading(false);
    }
  };

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
      await api.post(`/youtube/optimize/${videoId}`);
      setRecentlyUpdated(prev => [...prev, videoId]);
    } catch (err) {
      console.error("Optimization failed", err);
      alert("Optimization failed. Please try again.");
    } finally {
      setOptimizingId(null);
    }
  };

  const handleOptimizedThumbnail = async (videoId: string) => {
    if (generatingThumbId) return;
    if (!window.confirm("Generate a new AI Optimized Thumbnail? This will replace the current one.")) return;
    
    setGeneratingThumbId(videoId);
    try {
      await api.post(`/youtube/generate-optimized-thumbnail/${videoId}`);
      alert("Thumbnail optimized! It may take a moment to appear.");
    } catch (err) {
      console.error("Thumbnail generation failed", err);
      alert("Failed to generate thumbnail.");
    } finally {
      setGeneratingThumbId(null);
    }
  };

  return (
    <Layout>
      <div className="recent-videos-container">
        <header className="page-header">
          <h1>Recent Uploads</h1>
          <p className="subtitle">Optimize your latest videos for maximum reach</p>
        </header>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching your latest content...</p>
          </div>
        ) : (
          <div className="videos-list">
            {videos.map((video) => {
              const isOptimized = recentlyUpdated.includes(video.videoId);
              return (
                <Card key={video.videoId} className="video-card glass-morph">
                  <div className="video-thumbnail-wrapper">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className={`video-thumbnail ${generatingThumbId === video.videoId ? "uploading" : ""}`} 
                      onDoubleClick={() => handleOptimizedThumbnail(video.videoId)}
                      title="Double click to AI Optimize Thumbnail"
                      style={{ cursor: 'pointer' }}
                    />
                    {isOptimized && <div className="optimized-badge">Optimized</div>}
                  </div>
                  <div className="video-info">
                    <h3 className="video-title">{video.title}</h3>
                    <p className="video-desc">
                      {video.description || "No description provided"}
                    </p>
                    <div className="video-actions">
                      {isOptimized ? (
                        <button className="btn btn-success" disabled>
                          Recently Optimized
                        </button>
                      ) : (
                        <button 
                          className="auth-submit-btn" 
                          onClick={() => handleOptimize(video.videoId)}
                          disabled={optimizingId === video.videoId}
                        >
                          {optimizingId === video.videoId ? "Optimizing..." : "Optimize Now"}
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="pagination">
          <button 
            className="btn btn-ghost" 
            disabled={tokenHistory.length === 0 || loading} 
            onClick={handlePrev}
          >
            ← Previous
          </button>
          <button 
            className="btn btn-ghost" 
            disabled={!nextPageToken || loading} 
            onClick={handleNext}
          >
            Next →
          </button>
        </div>
      </div>
    </Layout>
  );
}
