import { useEffect, useState } from "react";
import api from "../api";

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
  const [videos, setVideos] = useState<Video[]>([]);
  const trimText = (text: string, max = 140) =>
  text.length > max ? text.slice(0, max) + "…" : text;

  useEffect(() => {
    api
      .post("/youtube/analytics")
      .then(res => setVideos(res.data.leastPerforming))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h2>SEO Optimization</h2>
      <p>
        We automatically optimize your least performing videos
        every 15 days using AI.
      </p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {videos.map(v => (
          <li
            key={v.videoId}
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 16,
              padding: 12,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
            }}
          >
            {/* Thumbnail */}
            <img
              src={v.thumbnail}
              alt={v.title}
              style={{
                width: 160,
                height: 90,
                objectFit: "cover",
                borderRadius: 6,
                flexShrink: 0,
              }}
            />

            {/* Content */}
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: "0 0 4px" }}>{v.title}</h4>
              <p style={{margin: "0 0 6px", fontSize: 13, color: "#374151",}}>
              {trimText(v.description)}
              </p>
              <p style={{ margin: "0 0 6px", color: "#6b7280", fontSize: 14 }}>
                {v.channelTitle} • {v.views.toLocaleString()} views
              </p>

              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: 13,
                  color: "#374151",
                }}
              >
                Avg View Duration:{" "}
                {(v.averageViewDurationSeconds / 60).toFixed(1)} min
              </p>

              {/* Links */}
              <div style={{ display: "flex", gap: 12 }}>
                <a
                  href={v.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch
                </a>

                <a
                  href={v.studioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Edit in Studio
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
