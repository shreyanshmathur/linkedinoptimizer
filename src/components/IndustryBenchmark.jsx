import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, Users, Award, ChevronRight,
    Target, Zap, ArrowUp, ArrowDown, Minus
} from 'lucide-react';
import {
    ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, Radar, Legend, BarChart, Bar, XAxis, YAxis,
    Tooltip, Cell
} from 'recharts';

// Industry benchmark data (simulated)
const INDUSTRY_BENCHMARKS = {
    Technology: {
        headline: 78,
        about: 72,
        experience: 81,
        skills: 75,
        education: 68,
        photo: 65,
        avgSkillsCount: 18,
        topKeywords: ['Python', 'AWS', 'Machine Learning', 'Agile', 'React', 'SQL']
    },
    Finance: {
        headline: 75,
        about: 70,
        experience: 82,
        skills: 72,
        education: 80,
        photo: 70,
        avgSkillsCount: 15,
        topKeywords: ['Financial Analysis', 'Excel', 'Risk Management', 'SQL', 'Bloomberg']
    },
    Marketing: {
        headline: 80,
        about: 78,
        experience: 75,
        skills: 70,
        education: 62,
        photo: 75,
        avgSkillsCount: 16,
        topKeywords: ['Digital Marketing', 'SEO', 'Analytics', 'Content Strategy', 'Social Media']
    },
    Consulting: {
        headline: 82,
        about: 80,
        experience: 85,
        skills: 78,
        education: 85,
        photo: 72,
        avgSkillsCount: 17,
        topKeywords: ['Strategy', 'PowerPoint', 'Client Management', 'Analysis', 'Project Management']
    }
};

const CAREER_LEVEL_BENCHMARKS = {
    entry: { multiplier: 0.85, expectedExperience: 1, skillsRange: '10-15' },
    mid: { multiplier: 1.0, expectedExperience: 3, skillsRange: '15-20' },
    senior: { multiplier: 1.1, expectedExperience: 5, skillsRange: '18-25' },
    executive: { multiplier: 1.15, expectedExperience: 7, skillsRange: '20-30' }
};

export default function IndustryBenchmark({ scores, profile, industry, careerLevel }) {
    const [selectedIndustry, setSelectedIndustry] = useState(industry || 'Technology');

    const benchmark = INDUSTRY_BENCHMARKS[selectedIndustry];
    const levelData = CAREER_LEVEL_BENCHMARKS[careerLevel] || CAREER_LEVEL_BENCHMARKS.mid;

    // Calculate comparison data
    const comparisonData = [
        { section: 'Headline', you: scores.headline, benchmark: benchmark.headline },
        { section: 'About', you: scores.about, benchmark: benchmark.about },
        { section: 'Experience', you: scores.experience, benchmark: benchmark.experience },
        { section: 'Skills', you: scores.skills, benchmark: benchmark.skills },
        { section: 'Education', you: scores.education, benchmark: benchmark.education },
        { section: 'Photo', you: scores.photo || 0, benchmark: benchmark.photo }
    ];

    // Radar chart data
    const radarData = comparisonData.map(item => ({
        subject: item.section,
        You: item.you,
        'Top 10%': Math.round(item.benchmark * levelData.multiplier)
    }));

    // Calculate percentile
    const calculatePercentile = () => {
        const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / 6;
        const benchmarkAvg = Object.values(benchmark).filter(v => typeof v === 'number' && v < 100)
            .reduce((a, b) => a + b, 0) / 6;

        if (avgScore >= benchmarkAvg * 1.1) return { value: 5, label: 'Top 5%' };
        if (avgScore >= benchmarkAvg) return { value: 10, label: 'Top 10%' };
        if (avgScore >= benchmarkAvg * 0.9) return { value: 25, label: 'Top 25%' };
        if (avgScore >= benchmarkAvg * 0.8) return { value: 50, label: 'Top 50%' };
        return { value: 75, label: 'Bottom 50%' };
    };

    // Get improvement areas
    const getImprovementAreas = () => {
        return comparisonData
            .filter(item => item.you < item.benchmark)
            .sort((a, b) => (b.benchmark - b.you) - (a.benchmark - a.you))
            .slice(0, 3);
    };

    // Get strengths
    const getStrengths = () => {
        return comparisonData
            .filter(item => item.you >= item.benchmark)
            .sort((a, b) => (b.you - b.benchmark) - (a.you - a.benchmark))
            .slice(0, 3);
    };

    const percentile = calculatePercentile();
    const improvements = getImprovementAreas();
    const strengths = getStrengths();

    return (
        <div className="glass rounded-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Industry Benchmark</h2>
                        <p className="text-sm text-gray-400">Compare against top performers</p>
                    </div>
                </div>

                <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                >
                    {Object.keys(INDUSTRY_BENCHMARKS).map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                    ))}
                </select>
            </div>

            {/* Percentile Badge */}
            <div className={`text-center p-6 rounded-xl ${percentile.value <= 10
                    ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/40'
                    : percentile.value <= 25
                        ? 'bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border border-yellow-500/40'
                        : 'bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/40'
                }`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className={`w-8 h-8 ${percentile.value <= 10 ? 'text-green-400' :
                            percentile.value <= 25 ? 'text-yellow-400' : 'text-orange-400'
                        }`} />
                    <span className={`text-3xl font-bold ${percentile.value <= 10 ? 'text-green-400' :
                            percentile.value <= 25 ? 'text-yellow-400' : 'text-orange-400'
                        }`}>
                        {percentile.label}
                    </span>
                </div>
                <p className="text-sm text-gray-400">
                    in {selectedIndustry} at {careerLevel} level
                </p>
            </div>

            {/* Radar Chart */}
            <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-400" />
                    Comparison Chart
                </h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                            <Radar name="You" dataKey="You" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                            <Radar name="Top 10%" dataKey="Top 10%" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
                            <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Section Comparison */}
            <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    Section-by-Section Comparison
                </h3>

                {comparisonData.map((item, i) => {
                    const diff = item.you - item.benchmark;
                    const isAbove = diff >= 0;

                    return (
                        <div key={item.section} className="flex items-center gap-4">
                            <span className="w-24 text-sm text-gray-400">{item.section}</span>

                            <div className="flex-1 relative h-6 bg-white/5 rounded-full overflow-hidden">
                                {/* Benchmark marker */}
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-purple-400 z-10"
                                    style={{ left: `${item.benchmark}%` }}
                                />

                                {/* Your score */}
                                <div
                                    className={`h-full rounded-full transition-all ${isAbove ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-orange-500 to-red-400'
                                        }`}
                                    style={{ width: `${item.you}%` }}
                                />
                            </div>

                            <div className="flex items-center gap-1 w-20 justify-end">
                                {isAbove ? (
                                    <ArrowUp className="w-3 h-3 text-green-400" />
                                ) : diff === 0 ? (
                                    <Minus className="w-3 h-3 text-gray-400" />
                                ) : (
                                    <ArrowDown className="w-3 h-3 text-red-400" />
                                )}
                                <span className={`text-sm font-semibold ${isAbove ? 'text-green-400' : diff === 0 ? 'text-gray-400' : 'text-red-400'
                                    }`}>
                                    {diff > 0 ? '+' : ''}{diff}
                                </span>
                            </div>
                        </div>
                    );
                })}

                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-purple-400" />
                        <span>Industry Top 10%</span>
                    </div>
                </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Your Strengths
                    </h4>
                    {strengths.length > 0 ? (
                        <ul className="space-y-2">
                            {strengths.map((item, i) => (
                                <li key={i} className="text-sm flex items-center gap-2">
                                    <span className="text-green-400">+{item.you - item.benchmark}</span>
                                    <span>{item.section}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">No sections above benchmark yet</p>
                    )}
                </div>

                {/* Improvements */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Focus Areas
                    </h4>
                    {improvements.length > 0 ? (
                        <ul className="space-y-2">
                            {improvements.map((item, i) => (
                                <li key={i} className="text-sm flex items-center gap-2">
                                    <span className="text-orange-400">{item.you - item.benchmark}</span>
                                    <span>{item.section}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500">All sections meet benchmark! 🎉</p>
                    )}
                </div>
            </div>

            {/* Top Keywords */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    Top Keywords in {selectedIndustry}
                </h4>
                <div className="flex flex-wrap gap-2">
                    {benchmark.topKeywords.map((kw, i) => {
                        const hasKeyword = profile.skills?.some(s => s.toLowerCase().includes(kw.toLowerCase()));
                        return (
                            <span
                                key={i}
                                className={`px-3 py-1 rounded-full text-sm ${hasKeyword
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-white/10 text-gray-400'
                                    }`}
                            >
                                {hasKeyword && '✓ '}{kw}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
