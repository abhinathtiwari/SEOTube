import React from "react";
import Card from "../Card";

interface GrowthInsightsProps {
    growthData: any;
}

export const GrowthInsights: React.FC<GrowthInsightsProps> = ({ growthData }) => {
    if (!growthData) {
        return (
            <Card className="glass-morph" style={{ padding: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <p className="muted" style={{ fontSize: '0.8rem', textAlign: 'center', margin: '20px 0' }}>
                    Generating growth insights...
                </p>
            </Card>
        );
    }

    return (
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
    );
};
