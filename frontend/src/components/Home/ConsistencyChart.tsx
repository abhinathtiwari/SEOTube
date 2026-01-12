import React from "react";
import Card from "../Card";

interface ConsistencyChartProps {
    recentVideos: any[];
}

export const ConsistencyChart: React.FC<ConsistencyChartProps> = ({ recentVideos }) => {
    const calculateConsistency = (videos: any[]) => {
        if (!videos || videos.length < 2) return { score: 100, isConsistent: true };
        const dates = videos.map(v => new Date(v.publishedAt).getTime());
        let totalDiff = 0;
        for (let i = 0; i < dates.length - 1; i++) {
            totalDiff += Math.abs(dates[i] - dates[i + 1]);
        }
        const avgDiffDays = totalDiff / (dates.length - 1) / (1000 * 60 * 60 * 24);
        return {
            score: Math.max(0, 100 - avgDiffDays * 5),
            isConsistent: avgDiffDays <= 10
        };
    };

    const getHistogramData = (videos: any[]) => {
        if (!videos || videos.length < 2) return [];
        const data = [];
        const sorted = [...videos].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
        for (let i = 1; i < sorted.length; i++) {
            const curr = new Date(sorted[i].publishedAt).getTime();
            const prev = new Date(sorted[i - 1].publishedAt).getTime();
            const gapDays = Math.ceil(Math.abs(curr - prev) / (1000 * 60 * 60 * 24));
            data.push({
                date: new Date(sorted[i].publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
                gap: gapDays
            });
        }
        return data;
    };

    const histogramData = getHistogramData(recentVideos);
    const maxGap = histogramData.length > 0 ? Math.max(...histogramData.map(d => d.gap)) : 100;
    const consistency = calculateConsistency(recentVideos);

    return (
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
                                    height: `${Math.max(5, (item.gap / maxGap) * 100)}%`,
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
                <span style={{ color: consistency.isConsistent ? 'var(--success)' : '#ef4444', fontWeight: 700 }}>
                    {consistency.isConsistent ? 'CONSISTENT' : 'INCONSISTENT'}
                </span>
            </div>
        </Card>
    );
};
