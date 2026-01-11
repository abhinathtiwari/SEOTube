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

const [growthData, setGrowthData] = useState<any>(null);

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

    // Fetch Growth Analysis
    api.get("/youtube/growth-analysis")
      .then(res => {
        setGrowthData(res.data);
      })
      .catch(err => console.error(err));
  }, [setCustomUrl, setChannelName]);

  const calculateConsistency = (recentVideos: any[]) => {
    if (!recentVideos || recentVideos.length < 2) return { score: 100, isConsistent: true };
    
    const dates = recentVideos.map(v => new Date(v.publishedAt).getTime());
    let totalDiff = 0;
    for (let i = 0; i < dates.length - 1; i++) {
        totalDiff += Math.abs(dates[i] - dates[i+1]);
    }
    const avgDiffDays = totalDiff / (dates.length - 1) / (1000 * 60 * 60 * 24);
    
    return {
        score: Math.max(0, 100 - avgDiffDays * 5),
        isConsistent: avgDiffDays <= 10
    };
  };

  const getHistogramData = (recentVideos: any[]) => {
    if (!recentVideos || recentVideos.length < 2) return [];
    
    const data = [];
    // Sorting by date (Oldest to Newest)
    const sorted = [...recentVideos].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    
    for (let i = 1; i < sorted.length; i++) {
        const curr = new Date(sorted[i].publishedAt).getTime();
        const prev = new Date(sorted[i-1].publishedAt).getTime();
        const gapDays = Math.ceil(Math.abs(curr - prev) / (1000 * 60 * 60 * 24));
        data.push({
            date: new Date(sorted[i].publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
            gap: gapDays,
            title: sorted[i].title
        });
    }
    return data;
  };

  const histogramData = growthData ? getHistogramData(growthData.recentVideos) : [];
  const consistency = growthData ? calculateConsistency(growthData.recentVideos) : null;

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
              <h4 className="section-title" style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                📅 Upload Consistency
              </h4>
              
              <div className="histogram-wrapper">
                <div className="histogram-chart">
                    {histogramData.map((item, idx) => (
                        <div key={idx} className="histogram-bar-container">
                            <div 
                                className="histogram-bar" 
                                style={{ 
                                    height: `${Math.min(100, (item.gap / 20) * 100)}%`,
                                    background: item.gap <= 10 ? 'var(--success)' : '#ef4444'
                                }}
                            >
                                <div className="histogram-tooltip">
                                    <div className="tooltip-gap">{item.gap} day gap</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {histogramData.length === 0 && <div className="muted" style={{ fontSize: '0.8rem', width: '100%', textAlign: 'center' }}>Not enough data</div>}
                </div>
                <div className="histogram-axis">
                    {histogramData.map((item, idx) => (
                        <span key={idx} className="axis-label">{item.date}</span>
                    ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                    <span className="muted">Upload Health</span>
                    <span style={{ color: consistency?.isConsistent ? 'var(--success)' : '#ef4444', fontWeight: 700 }}>
                        {consistency?.isConsistent ? 'CONSISTENT' : 'INCONSISTENT'}
                    </span>
              </div>
           </Card>

           {growthData && (
             <>
               <Card className="glass-morph" style={{ padding: '20px' }}>
                  <h4 className="section-title" style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
                    🤖 AI Marketing Advice
                  </h4>
                  <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text)', fontStyle: 'italic' }}>
                    "{growthData.marketingAdvice}"
                  </p>
               </Card>

               <Card className="glass-morph" style={{ padding: '20px' }}>
                  <h4 className="section-title" style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                    💡 Hot Video Ideas
                  </h4>
                  <ul className="idea-list">
                    {growthData.videoIdeaList.map((idea: string, idx: number) => (
                        <li key={idx} className="idea-item">
                            <span className="idea-bullet">✦</span> {idea}
                        </li>
                    ))}
                  </ul>
               </Card>
             </>
           )}
           
           {!growthData && (
             <Card className="glass-morph" style={{ padding: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <p className="muted" style={{ fontSize: '0.8rem', textAlign: 'center', margin: '20px 0' }}>
                    Generating growth insights...
                </p>
             </Card>
           )}
        </div>
      </div>
    </Layout>
  );
}
