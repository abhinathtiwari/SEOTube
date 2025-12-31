import { useEffect, useState } from "react";
import api from "../api";

type Video = {
  videoId: string;
  title: string;
  views: number;
};

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    api.post("/youtube/analytics")
      .then(res => setVideos(res.data.leastPerforming))
      .catch((err) => {
        console.log(err)
      });
  }, []);

  return (
    <div>
      <h2>SEO Optimization</h2>
      <p>
        We automatically optimize your 20 least performing videos
        every 15 days using AI.
      </p>

      <ul>
        {videos.map(v => (
          <li key={v.videoId}>
            {v.title} — {v.views} views
          </li>
        ))}
      </ul>
    </div>
  );
}
