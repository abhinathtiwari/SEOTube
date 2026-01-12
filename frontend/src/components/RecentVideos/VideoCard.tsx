/** Interactive video card for the recent uploads page with optimization controls. */
import React from "react";
import Card from "../Card";

interface VideoCardProps {
    video: any;
    isOptimized: boolean;
    isOptimizing: boolean;
    onOptimize: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, isOptimized, isOptimizing, onOptimize }) => {
    return (
        <Card key={video.videoId} className="video-card glass-morph">
            <div className="video-thumbnail-wrapper">
                <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                {isOptimized && <div className="optimized-badge">Optimized</div>}
            </div>
            <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <p className="video-desc">
                    {video.description || "No description provided"}
                </p>
                <div className="video-actions">
                    {isOptimized ? (
                        <button className="btn btn-success" disabled style={{ background: 'var(--success)', color: 'white' }}>
                            Recently Optimized
                        </button>
                    ) : (
                        <button
                            className="auth-submit-btn"
                            onClick={() => onOptimize(video.videoId)}
                            disabled={isOptimizing}
                        >
                            {isOptimizing ? "Optimizing..." : "Optimize Now"}
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
};
