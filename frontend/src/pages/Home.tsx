import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";
import Card from "../components/Card";
import { useSetRecoilState } from "recoil";
import { channelNameState, customUrlState } from "../state/user";
import "../styles/Home.css";

type ChannelData = {
  channelName: string;
  logo?: string;
  customUrl?: string;
};

type Video = {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string | null;
  channelTitle: string;
  thumbnail: string;
  views: number;
  averageViewDurationSeconds: number;
  videoUrl: string;
  studioUrl: string;
};

export default function Home() {
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [upcomingOpt, setUpcomingOpt] = useState<string | null>(null);
  
  const setChannelName = useSetRecoilState(channelNameState);
  const setCustomUrl = useSetRecoilState(customUrlState);

  useEffect(() => {
    // Fetch analytics and channel data
    api
      .post("/youtube/analytics")
      .then(res => {
        setVideos(res.data.leastPerforming);
        setChannelData(res.data.channelData);
        if (res.data.channelData) {
          setChannelName(res.data.channelData.channelName || "");
          if (res.data.channelData.customUrl) setCustomUrl(res.data.channelData.customUrl);
        }
      })
      .catch(err => console.error(err));

    // Fetch user-specific info like optimization dates
    api.get("/users/me")
      .then(res => {
        setUpcomingOpt(res.data.upcomingOptimization);
      })
      .catch(err => console.error(err));
  }, [setCustomUrl, setChannelName]);

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
              {videos.map(v => (
                <div key={v.videoId} className="video-item-v2">
                  <img className="video-thumb-v2" src={v.thumbnail} alt={v.title} />

                  <div className="video-details-v2">
                    <h4 className="video-title-v2">{v.title}</h4>
                    <p className="video-desc-v2">
                        {v.description || "No description provided"}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="video-meta-v2">
                            <span>👁️ {v.views.toLocaleString()} views</span>
                            <span>⏱️ {(v.averageViewDurationSeconds / 60).toFixed(1)}m avg</span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <a href={v.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link-v2">Watch</a>
                            <a href={v.studioUrl} target="_blank" rel="noopener noreferrer" className="video-link-v2">Studio</a>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
              {videos.length === 0 && (
                <p className="muted" style={{ textAlign: 'center', padding: '40px' }}>Analyzing your channel performance...</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar for New Features */}
        <div className="home-right">
           <Card className="glass-morph" style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '1rem' }}>Growth Insights</h4>
              <p className="muted" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                Your channel performance is currently being monitored. New AI-driven insights will appear here soon.
              </p>
           </Card>
           
           <Card className="glass-morph" style={{ padding: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <p className="muted" style={{ fontSize: '0.8rem', textAlign: 'center', margin: '20px 0' }}>
                Space for upcoming features
              </p>
           </Card>
        </div>
      </div>
    </Layout>
  );
}
