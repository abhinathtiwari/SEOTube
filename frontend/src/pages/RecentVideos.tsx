import Layout from "../components/Layout";
import { useRecentVideos } from "../hooks/useRecentVideos";
import { VideoCard } from "../components/RecentVideos/VideoCard";
import "../styles/RecentVideos.css";

export default function RecentVideos() {
  const {
    videos,
    loading,
    optimizingId,
    recentlyUpdated,
    handleNext,
    handlePrev,
    handleOptimize,
    hasPrev,
    hasNext
  } = useRecentVideos();

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
            {videos.map((video) => (
              <VideoCard
                key={video.videoId}
                video={video}
                isOptimized={recentlyUpdated.includes(video.videoId)}
                isOptimizing={optimizingId === video.videoId}
                onOptimize={handleOptimize}
              />
            ))}
          </div>
        )}

        <div className="pagination">
          <button 
            className="btn btn-ghost" 
            disabled={!hasPrev || loading} 
            onClick={handlePrev}
          >
            ← Previous
          </button>
          <button 
            className="btn btn-ghost" 
            disabled={!hasNext || loading} 
            onClick={handleNext}
          >
            Next →
          </button>
        </div>
      </div>
    </Layout>
  );
}
