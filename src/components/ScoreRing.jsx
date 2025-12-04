import React from 'react';

export default function ScoreRing({ score, size = 120, strokeWidth = 10 }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    // Color based on score
    const getColor = () => {
        if (score >= 85) return '#22c55e'; // green
        if (score >= 70) return '#eab308'; // yellow
        if (score >= 50) return '#f97316'; // orange
        return '#ef4444'; // red
    };

    const getGradientId = () => `scoreGradient-${score}`;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <defs>
                    <linearGradient id={getGradientId()} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={getColor()} stopOpacity="1" />
                        <stop offset="100%" stopColor={getColor()} stopOpacity="0.6" />
                    </linearGradient>
                </defs>

                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                />

                {/* Score circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={`url(#${getGradientId()})`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="score-ring transition-all duration-1000 ease-out"
                    style={{
                        filter: `drop-shadow(0 0 10px ${getColor()}50)`
                    }}
                />
            </svg>

            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                    className="text-4xl font-bold"
                    style={{ color: getColor() }}
                >
                    {score}
                </span>
                <span className="text-sm text-gray-400">/100</span>
            </div>
        </div>
    );
}
