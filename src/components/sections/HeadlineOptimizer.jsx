import React, { useState, useEffect, useCallback } from 'react';
import {
    Sparkles, Check, X, TrendingUp, Clock, Zap, Copy,
    CheckCircle, AlertTriangle, RefreshCw, Loader2
} from 'lucide-react';
import { generateHeadlineSuggestions } from '../../utils/aiEngine';
import { getScoreColor } from '../../utils/scoringEngine';

export default function HeadlineOptimizer({
    headline, setHeadline, score, details,
    jobKeywords, targetRoles, industry, careerLevel,
    onScoreUpdate
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editedHeadline, setEditedHeadline] = useState(headline);
    const [liveScore, setLiveScore] = useState(score);
    const [copied, setCopied] = useState(false);
    const [acceptedIndex, setAcceptedIndex] = useState(null);

    // Live score update with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (editedHeadline !== headline) {
                // Trigger score recalculation
                setHeadline(editedHeadline);
                onScoreUpdate();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [editedHeadline]);

    // Update live score when score prop changes
    useEffect(() => {
        setLiveScore(score);
    }, [score]);

    // Generate AI suggestions
    const handleGenerateSuggestions = async () => {
        setIsGenerating(true);
        try {
            const results = await generateHeadlineSuggestions(
                editedHeadline || headline,
                jobKeywords,
                targetRoles,
                industry,
                careerLevel
            );
            setSuggestions(results);
        } catch (error) {
            console.error('Error generating suggestions:', error);
        }
        setIsGenerating(false);
    };

    // Accept suggestion
    const handleAccept = (suggestion, index) => {
        setAcceptedIndex(index);
        setEditedHeadline(suggestion.text);
        setHeadline(suggestion.text);
        onScoreUpdate();

        setTimeout(() => setAcceptedIndex(null), 2000);
    };

    // Copy to clipboard
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const issues = details?.issues || [];
    const breakdown = details?.breakdown || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Headline Optimizer</h2>
                        <p className="text-gray-400">220 characters to make a strong first impression</p>
                    </div>
                    <div className="text-right">
                        <div className={`text-4xl font-bold ${getScoreColor(liveScore)}`}>
                            {liveScore}
                        </div>
                        <div className="text-sm text-gray-400">/ 100</div>
                    </div>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {Object.entries(breakdown).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="bg-white/5 rounded-lg p-3 text-center">
                            <div className={`text-lg font-bold ${getScoreColor(value)}`}>
                                {Math.round(value)}%
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Live editing */}
                <div className="relative">
                    <label className="text-sm text-gray-400 mb-2 block flex justify-between">
                        <span>Your Headline</span>
                        <span className={editedHeadline.length > 220 ? 'text-red-400' : 'text-gray-500'}>
                            {editedHeadline.length} / 220
                        </span>
                    </label>
                    <textarea
                        value={editedHeadline}
                        onChange={(e) => setEditedHeadline(e.target.value)}
                        placeholder="Product Manager | Data Analytics Expert | 5+ Years B2B SaaS"
                        rows={3}
                        className={`w-full bg-white/5 rounded-xl px-4 py-3 focus:outline-none resize-none transition-all ${liveScore > score ? 'border-2 border-green-500' :
                                liveScore < score ? 'border-2 border-red-500' :
                                    'border border-white/10'
                            }`}
                    />

                    {/* Score change indicator */}
                    {liveScore !== score && (
                        <div className={`absolute top-0 right-0 -mt-2 -mr-2 px-2 py-1 rounded-full text-xs font-bold ${liveScore > score ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                            {liveScore > score ? '+' : ''}{liveScore - score}
                        </div>
                    )}

                    <button
                        onClick={() => handleCopy(editedHeadline)}
                        className="absolute bottom-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>

                {/* Issues */}
                {issues.length > 0 && (
                    <div className="mt-4 space-y-2">
                        {issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300">{issue}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Suggestions */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">AI-Powered Suggestions</h3>
                            <p className="text-sm text-gray-400">Optimized for your target role</p>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateSuggestions}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Generate Suggestions
                            </>
                        )}
                    </button>
                </div>

                {/* Suggestions list */}
                {suggestions.length > 0 ? (
                    <div className="space-y-4">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className={`suggestion-card border rounded-xl p-5 transition-all ${acceptedIndex === index
                                        ? 'border-green-500 bg-green-500/10'
                                        : 'border-white/10 hover:border-purple-500/50'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded">
                                            Option {suggestion.version || index + 1}
                                        </span>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Zap className="w-4 h-4 text-green-400" />
                                            <span className="text-green-400 font-semibold">
                                                {suggestion.estimated_score}/100
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {suggestion.char_count || suggestion.text?.length} chars
                                    </span>
                                </div>

                                {/* Suggestion text */}
                                <div className="bg-white/5 rounded-lg p-4 mb-4">
                                    <p className="text-white font-medium">{suggestion.text}</p>
                                </div>

                                {/* Reasoning */}
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
                                    <div className="text-xs font-semibold text-blue-400 mb-1">💡 Why this works:</div>
                                    <p className="text-sm text-gray-300">{suggestion.reasoning}</p>
                                </div>

                                {/* Keywords included */}
                                {suggestion.keywords_included && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {suggestion.keywords_included.map((kw, i) => (
                                            <span key={i} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleAccept(suggestion, index)}
                                        disabled={acceptedIndex === index}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {acceptedIndex === index ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Applied!
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Accept
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleCopy(suggestion.text)}
                                        className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border border-dashed border-white/20 rounded-xl">
                        <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">No suggestions generated yet</p>
                        <p className="text-sm text-gray-500">Click "Generate Suggestions" to get AI-powered improvements</p>
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="glass rounded-2xl p-6 bg-gradient-to-r from-linkedin-600/20 to-linkedin-500/10 border border-linkedin-500/30">
                <h3 className="font-semibold text-linkedin-400 mb-3">💡 Headline Best Practices</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                    <li>• <strong>First 35 characters</strong> are visible in search—put your job title first</li>
                    <li>• Use <strong>pipes (|)</strong> to separate key points for easy scanning</li>
                    <li>• Include <strong>quantified metrics</strong> (years experience, team size, revenue)</li>
                    <li>• Add <strong>power words</strong> like "Delivered", "Scaled", "Pioneered"</li>
                    <li>• Target <strong>120-180 characters</strong> for optimal visibility</li>
                </ul>
            </div>
        </div>
    );
}
