import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";
import Card from "../components/Card";

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
  const trimText = (text: string, max = 140) =>
  text.length > max ? text.slice(0, max) + "…" : text;

  useEffect(() => {
    api
      .post("/youtube/analytics")
      .then(res => {
        setVideos(res.data.leastPerforming);
        setChannelData(res.data.channelData);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* content now comes from header; avoid duplicate title/tagline here */}

        {channelData && (
          <Card className="channel-card">
            <div className="channel-row">
              {channelData.logo && (
                <img src={channelData.logo} alt={channelData.channelName} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }} />
              )}

              <div>
                <h3 style={{ margin: 0 }}>{channelData.channelName}</h3>
                {channelData.customUrl && (
                  <a href={`https://www.youtube.com/${channelData.customUrl}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14 }}>
                    youtube.com/{channelData.customUrl}
                  </a>
                )}
              </div>
            </div>
          </Card>
        )}

        <ul className="video-list">
          {videos.map(v => (
            <li key={v.videoId} className="video-item">
              <img className="thumbnail" src={v.thumbnail} alt={v.title} />

              <div className="video-content" style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 4px" }}>{v.title}</h4>
                <p style={{ margin: "0 0 6px", fontSize: 13, color: "var(--muted)" }}>{trimText(v.description)}</p>
                <p style={{ margin: "0 0 6px", color: "var(--muted)", fontSize: 14 }}>{v.channelTitle} • {v.views.toLocaleString()} views</p>

                <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--muted)" }}>
                  Avg View Duration: {(v.averageViewDurationSeconds / 60).toFixed(1)} min
                </p>

                <div style={{ display: "flex", gap: 12 }}>
                  <a href={v.videoUrl} target="_blank" rel="noopener noreferrer">Watch</a>
                  <a href={v.studioUrl} target="_blank" rel="noopener noreferrer">Edit in Studio</a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
