import React, { useState, useEffect } from 'react';
import {
    Sparkles, Check, X, TrendingUp, Zap, Globe, Clock,
    Loader2, RefreshCw
} from 'lucide-react';

export default function AISuggestionCards({
    section,
    currentContent,
    suggestions,
    isLoading,
    onAccept,
    onReject,
    onRegenerate
}) {
    const [acceptedId, setAcceptedId] = useState(null);

    const handleAccept = (suggestion) => {
        setAcceptedId(suggestion.id || suggestion.version);
        onAccept(suggestion);

        setTimeout(() => {
            setAcceptedId(null);
        }, 2000);
    };

    if (isLoading) {
        return (
            <div className="bg-purple-50/5 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="text-purple-400 animate-pulse" size={24} />
                    <h3 className="text-lg font-bold text-purple-300">
                        AI Generating Suggestions...
                    </h3>
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-purple-500/20 rounded animate-pulse" />
                    <div className="h-4 bg-purple-500/20 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-purple-500/20 rounded animate-pulse w-1/2" />
                </div>
            </div>
        );
    }

    if (!suggestions || suggestions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-2">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">
                            AI-Powered Suggestions
                        </h3>
                        <p className="text-sm text-gray-400">
                            Based on 2025 industry trends
                        </p>
                    </div>
                </div>

                <button
                    onClick={onRegenerate}
                    className="px-3 py-1 bg-white/10 rounded-lg text-sm text-gray-400 hover:bg-white/20 hover:text-white transition-colors flex items-center gap-1"
                >
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                </button>
            </div>

            {/* Suggestion Cards */}
            {suggestions.map((suggestion, index) => {
                const id = suggestion.id || suggestion.version || index;
                const isAccepted = acceptedId === id;

                return (
                    <div
                        key={id}
                        className={`border-2 rounded-xl p-5 transition-all ${isAccepted
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-white/10 bg-white/5 hover:border-purple-500/50'
                            }`}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="inline-block px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                                        Option {index + 1}
                                    </span>
                                    {suggestion.webSearchBased && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded">
                                            <Globe size={12} />
                                            Web Research
                                        </span>
                                    )}
                                    {(suggestion.trendScore || suggestion.trend_score) >= 80 && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded">
                                            <TrendingUp size={12} />
                                            Trending
                                        </span>
                                    )}
                                </div>

                                {/* Impact Metrics */}
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 text-green-400 font-semibold">
                                        <Zap size={14} />
                                        +{suggestion.scoreIncrease || suggestion.impact_increase || 15} points
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Clock size={14} />
                                        Est. score: {suggestion.estimatedScore || suggestion.estimated_score}/100
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content Comparison */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Before */}
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                <div className="text-xs font-semibold text-red-400 mb-2">
                                    Before
                                </div>
                                <div className="text-sm text-gray-300 line-clamp-3">
                                    {currentContent || 'No content'}
                                </div>
                            </div>

                            {/* After */}
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                <div className="text-xs font-semibold text-green-400 mb-2">
                                    AI Suggestion
                                </div>
                                <div className="text-sm text-white font-medium line-clamp-3">
                                    {suggestion.text || suggestion.improved || suggestion.improved_text}
                                </div>
                            </div>
                        </div>

                        {/* AI Reasoning */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                            <div className="text-xs font-bold text-blue-400 mb-1">
                                🤖 AI Analysis
                            </div>
                            <p className="text-sm text-gray-300">
                                {suggestion.reasoning || suggestion.reason || 'Optimized for your target role and industry.'}
                            </p>
                        </div>

                        {/* Trend Insights */}
                        {suggestion.trendInsight && (
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp size={14} className="text-orange-400" />
                                    <span className="text-xs font-bold text-orange-400">
                                        2025 Industry Trend
                                    </span>
                                </div>
                                <p className="text-sm text-gray-300">
                                    {suggestion.trendInsight}
                                </p>
                            </div>
                        )}

                        {/* Keywords */}
                        {(suggestion.keywordsAdded || suggestion.keywords_included) &&
                            (suggestion.keywordsAdded || suggestion.keywords_included).length > 0 && (
                                <div className="mb-4">
                                    <div className="text-xs font-semibold text-gray-500 mb-2">
                                        Keywords Added:
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(suggestion.keywordsAdded || suggestion.keywords_included).map((kw, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded"
                                            >
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleAccept(suggestion)}
                                disabled={isAccepted}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isAccepted ? (
                                    <>
                                        <Check size={18} />
                                        Applied!
                                    </>
                                ) : (
                                    <>
                                        <Check size={18} />
                                        Accept & Apply
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => onReject(id)}
                                className="px-4 py-3 bg-white/10 text-gray-400 font-semibold rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                            >
                                <X size={18} />
                                Reject
                            </button>
                        </div>

                        {/* Character Count */}
                        {(suggestion.charCount || suggestion.char_count) && (
                            <div className="mt-3 text-xs text-gray-500 text-right">
                                {suggestion.charCount || suggestion.char_count} characters
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
