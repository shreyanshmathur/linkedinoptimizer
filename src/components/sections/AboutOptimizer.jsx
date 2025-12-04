import React, { useState, useEffect } from 'react';
import {
    Sparkles, Check, Copy, CheckCircle, AlertTriangle,
    RefreshCw, Loader2, TrendingUp
} from 'lucide-react';
import { generateAboutImprovement } from '../../utils/aiEngine';
import { getScoreColor } from '../../utils/scoringEngine';

export default function AboutOptimizer({
    about, setAbout, score, details,
    jobKeywords, targetRoles, careerLevel,
    onScoreUpdate
}) {
    const [editedAbout, setEditedAbout] = useState(about);
    const [liveScore, setLiveScore] = useState(score);
    const [isGenerating, setIsGenerating] = useState(false);
    const [improvement, setImprovement] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showComparison, setShowComparison] = useState(false);

    // Live score update with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (editedAbout !== about) {
                setAbout(editedAbout);
                onScoreUpdate();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [editedAbout]);

    useEffect(() => {
        setLiveScore(score);
    }, [score]);

    // Generate AI improvement
    const handleGenerateImprovement = async () => {
        setIsGenerating(true);
        try {
            const result = await generateAboutImprovement(
                editedAbout || about,
                jobKeywords,
                targetRoles,
                careerLevel
            );
            setImprovement(result);
            setShowComparison(true);
        } catch (error) {
            console.error('Error generating improvement:', error);
        }
        setIsGenerating(false);
    };

    // Apply improvement
    const handleApplyImprovement = () => {
        if (improvement?.improved_text) {
            setEditedAbout(improvement.improved_text);
            setAbout(improvement.improved_text);
            onScoreUpdate();
            setShowComparison(false);
        }
    };

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
                        <h2 className="text-2xl font-bold mb-1">About Section</h2>
                        <p className="text-gray-400">Tell your professional story in 2,600 characters</p>
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
                        <span>Your About Section</span>
                        <span className={editedAbout.length > 2600 ? 'text-red-400' : 'text-gray-500'}>
                            {editedAbout.length} / 2,600
                        </span>
                    </label>
                    <textarea
                        value={editedAbout}
                        onChange={(e) => setEditedAbout(e.target.value)}
                        placeholder="I'm a passionate [role] with [X] years of experience in [industry]...

Key achievements:
• Increased [metric] by [X]% resulting in [business impact]
• Led [project/team] to deliver [outcome]
• Pioneered [initiative] that [result]

Let's connect to discuss how I can bring this expertise to your team."
                        rows={12}
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
                        onClick={() => handleCopy(editedAbout)}
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

            {/* AI Rewrite */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">AI-Powered Rewrite</h3>
                            <p className="text-sm text-gray-400">Optimized for 90+ score</p>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerateImprovement}
                        disabled={isGenerating || !editedAbout}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Rewriting...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Rewrite with AI
                            </>
                        )}
                    </button>
                </div>

                {/* Comparison view */}
                {showComparison && improvement && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Before vs After</h4>
                            <div className="flex items-center gap-2 text-green-400">
                                <TrendingUp className="w-4 h-4" />
                                <span>Estimated score: {improvement.estimated_score}/100</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Before */}
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                <div className="text-xs font-semibold text-red-400 mb-2">Before</div>
                                <p className="text-sm text-gray-300 line-clamp-6">{editedAbout || 'No content'}</p>
                            </div>

                            {/* After */}
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                <div className="text-xs font-semibold text-green-400 mb-2">After (AI Optimized)</div>
                                <p className="text-sm text-gray-300 line-clamp-6">{improvement.improved_text}</p>
                            </div>
                        </div>

                        {/* Key improvements */}
                        {improvement.key_improvements && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                <div className="text-xs font-semibold text-blue-400 mb-2">Key Improvements:</div>
                                <ul className="text-sm text-gray-300 space-y-1">
                                    {improvement.key_improvements.map((imp, i) => (
                                        <li key={i}>• {imp}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Keywords added */}
                        {improvement.keywords_added && improvement.keywords_added.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-gray-500">Keywords added:</span>
                                {improvement.keywords_added.map((kw, i) => (
                                    <span key={i} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleApplyImprovement}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" />
                                Apply This Version
                            </button>
                            <button
                                onClick={() => handleCopy(improvement.improved_text)}
                                className="px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <Copy className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setShowComparison(false)}
                                className="px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-gray-400"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {!showComparison && !improvement && (
                    <div className="text-center py-8 border border-dashed border-white/20 rounded-xl">
                        <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">Get an AI-optimized version</p>
                        <p className="text-sm text-gray-500">
                            Click "Rewrite with AI" to get a version optimized for your target role
                        </p>
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="glass rounded-2xl p-6 bg-gradient-to-r from-linkedin-600/20 to-linkedin-500/10 border border-linkedin-500/30">
                <h3 className="font-semibold text-linkedin-400 mb-3">💡 About Section Best Practices</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                    <li>• <strong>First 200 characters</strong> appear before "See more" – make them count!</li>
                    <li>• Follow the <strong>Problem → Solution → Results</strong> story arc</li>
                    <li>• Include <strong>3+ quantified achievements</strong> with specific metrics</li>
                    <li>• Use <strong>2-3 sentence paragraphs</strong> for readability</li>
                    <li>• End with a <strong>call-to-action</strong> (connect, message, etc.)</li>
                    <li>• Target <strong>1,500-2,000 characters</strong> for optimal engagement</li>
                </ul>
            </div>
        </div>
    );
}
