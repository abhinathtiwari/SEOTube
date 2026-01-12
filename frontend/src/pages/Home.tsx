/** The main dashboard page displaying channel stats and growth insights. */
import Layout from "../components/Layout";
import Card from "../components/Card";
import { useHomeData } from "../hooks/useHomeData";
import { ConsistencyChart } from "../components/Home/ConsistencyChart";
import { GrowthInsights } from "../components/Home/GrowthInsights";
import { VideoCard } from "../components/Home/VideoCard";
import "../styles/Home.css";

export default function Home() {
  const { channelData, videos, upcomingOpt, growthData, loading } = useHomeData();

  return (
    <Layout>
      <div className="home-grid">
        {/* Left Side: Main Content */}
        <div className="home-left">
          {channelData && (
            <Card className="channel-stats-card glass-morph">
              <div className="channel-info-group">
                {channelData.logo && (
                  <img src={channelData.logo} alt={channelData.channelName} className="channel-avatar" />
                )}
                <div>
                  <h3 className="channel-name-v2">{channelData.channelName}</h3>
                  {channelData.customUrl && (
                    <a href={`https://www.youtube.com/${channelData.customUrl}`} target="_blank" rel="noopener noreferrer" className="channel-link-v2">
                      youtube.com/{channelData.customUrl}
                    </a>
                  )}
                </div>
              </div>
              
              <div className="optimization-meta">
                <div className="opt-label">Next Optimization</div>
                <div className="opt-value">{upcomingOpt || "Calculating..."}</div>
              </div>
            </Card>
          )}

          <div className="video-list-scroll-area">
            <h3 className="section-title">
              <span>📉</span> Least Performing Videos
            </h3>
            <div className="video-list-v2" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!loading && videos.map(v => (
                <VideoCard key={v.videoId} video={v} />
              ))}
              {!loading && videos.length === 0 && (
                <p className="muted" style={{ textAlign: 'center', padding: '40px' }}>Analyzing your channel performance...</p>
              )}
              {loading && <p className="muted" style={{ textAlign: 'center', padding: '40px' }}>Loading statistics...</p>}
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar for New Features */}
        <div className="home-right">
           <ConsistencyChart recentVideos={growthData?.recentVideos || []} />
           <GrowthInsights growthData={growthData} />
        </div>
      </div>
    </Layout>
  );
}
