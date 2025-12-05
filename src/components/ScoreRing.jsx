import React from 'react';
import { motion } from 'framer-motion';

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
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-gray-200 dark:text-white/10"
                />

                {/* Score circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={`url(#${getGradientId()})`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    style={{
                        filter: `drop-shadow(0 0 8px ${getColor()}60)`
                    }}
                />
            </svg>

            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-4xl font-bold"
                    style={{ color: getColor() }}
                >
                    {score}
                </motion.span>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-sm text-gray-400 dark:text-gray-500"
                >
                    /100
                </motion.span>
            </div>
        </div>
    );
}
