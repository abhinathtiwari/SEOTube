import React from "react";

interface Video {
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    views: number;
    averageViewDurationSeconds: number;
    videoUrl: string;
    studioUrl: string;
}

interface VideoCardProps {
    video: Video;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
    return (
        <div className="video-item-v2">
            <img className="video-thumb-v2" src={video.thumbnail} alt={video.title} />
            <div className="video-details-v2">
                <h4 className="video-title-v2">{video.title}</h4>
                <p className="video-desc-v2">
                    {video.description || "No description provided"}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="video-meta-v2">
                        <span>👁️ {video.views.toLocaleString()} views</span>
                        <span>⏱️ {(video.averageViewDurationSeconds / 60).toFixed(1)}m avg</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="video-link-v2">Watch</a>
                        <a href={video.studioUrl} target="_blank" rel="noopener noreferrer" className="video-link-v2">Studio</a>
                    </div>
                </div>
            </div>
        </div>
    );
};
