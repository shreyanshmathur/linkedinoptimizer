import React, { useState, useRef } from 'react';
import {
    Camera, Upload, Check, X, AlertTriangle, Loader2,
    User, Sun, Smile, Briefcase, Frame, Sparkles
} from 'lucide-react';

// Photo analysis criteria based on research
const ANALYSIS_CRITERIA = {
    faceSize: {
        name: 'Face Size',
        icon: Frame,
        ideal: '60-70% of frame',
        weight: 0.25
    },
    lighting: {
        name: 'Lighting',
        icon: Sun,
        ideal: 'Bright, even lighting',
        weight: 0.20
    },
    expression: {
        name: 'Expression',
        icon: Smile,
        ideal: 'Friendly smile (teeth visible)',
        weight: 0.20
    },
    attire: {
        name: 'Professional Attire',
        icon: Briefcase,
        ideal: 'Business casual or formal',
        weight: 0.20
    },
    background: {
        name: 'Background',
        icon: User,
        ideal: 'Clean, uncluttered',
        weight: 0.15
    }
};

export default function PhotoAnalyzer({ profile, setProfile, onScoreUpdate }) {
    const [photoUrl, setPhotoUrl] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const fileInputRef = useRef(null);

    // Simulate photo analysis (in real app, would use computer vision API)
    const analyzePhoto = async (imageFile) => {
        setIsAnalyzing(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulated analysis based on common issues
        // In a real implementation, this would use OpenCV/TensorFlow.js or a cloud API
        const simulatedAnalysis = {
            faceSize: {
                score: Math.floor(Math.random() * 30) + 60, // 60-90
                feedback: 'Face fills approximately 65% of the frame',
                improvement: 'Ideal! Face should fill 60-70% of the photo'
            },
            lighting: {
                score: Math.floor(Math.random() * 40) + 50, // 50-90
                feedback: 'Good natural lighting detected',
                improvement: 'Consider adding a ring light for even illumination'
            },
            expression: {
                score: Math.floor(Math.random() * 30) + 60, // 60-90
                feedback: 'Friendly expression detected',
                improvement: 'A smile showing teeth increases likability by 31%'
            },
            attire: {
                score: Math.floor(Math.random() * 40) + 50, // 50-90
                feedback: 'Professional attire detected',
                improvement: 'Dark solid colors photograph best on LinkedIn'
            },
            background: {
                score: Math.floor(Math.random() * 30) + 60, // 60-90
                feedback: 'Clean background',
                improvement: 'Simple, uncluttered backgrounds work best'
            }
        };

        // Calculate overall score
        let overallScore = 0;
        Object.entries(simulatedAnalysis).forEach(([key, value]) => {
            overallScore += value.score * ANALYSIS_CRITERIA[key].weight;
        });

        const result = {
            ...simulatedAnalysis,
            overall: Math.round(overallScore),
            recommendations: generateRecommendations(simulatedAnalysis)
        };

        setAnalysis(result);

        // Update profile photo score
        setProfile(prev => ({
            ...prev,
            photo: {
                hasPhoto: true,
                score: result.overall,
                analysis: result
            }
        }));

        onScoreUpdate();
        setIsAnalyzing(false);
    };

    // Generate prioritized recommendations
    const generateRecommendations = (analysisData) => {
        const recommendations = [];

        Object.entries(analysisData).forEach(([key, value]) => {
            if (value.score < 80) {
                recommendations.push({
                    criteria: ANALYSIS_CRITERIA[key].name,
                    priority: value.score < 60 ? 'high' : 'medium',
                    suggestion: value.improvement,
                    impact: `+${Math.round((100 - value.score) * ANALYSIS_CRITERIA[key].weight)} points`
                });
            }
        });

        // Sort by priority
        return recommendations.sort((a, b) => {
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (a.priority !== 'high' && b.priority === 'high') return 1;
            return 0;
        });
    };

    // Handle file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPhotoUrl(url);
            setAnalysis(null);
        }
    };

    // Get score color
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-500/20';
        if (score >= 60) return 'bg-yellow-500/20';
        return 'bg-red-500/20';
    };

    return (
        <div className="glass rounded-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Photo Analyzer</h2>
                    <p className="text-sm text-gray-400">Profiles with photos get 14x more views</p>
                </div>
            </div>

            {/* Photo Upload Area */}
            <div className="relative">
                {photoUrl ? (
                    <div className="relative">
                        <img
                            src={photoUrl}
                            alt="Profile preview"
                            className="w-48 h-48 rounded-full object-cover mx-auto border-4 border-white/20"
                        />
                        <button
                            onClick={() => {
                                setPhotoUrl(null);
                                setAnalysis(null);
                            }}
                            className="absolute top-0 right-1/4 p-1 bg-red-500 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-12 border-2 border-dashed border-white/20 rounded-xl hover:border-pink-500 transition-colors flex flex-col items-center gap-3"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold">Upload your profile photo</p>
                            <p className="text-sm text-gray-400">PNG, JPG up to 8MB</p>
                        </div>
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>

            {/* Analyze Button */}
            {photoUrl && !analysis && (
                <button
                    onClick={() => analyzePhoto()}
                    disabled={isAnalyzing}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analyzing Photo...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            Analyze Photo
                        </>
                    )}
                </button>
            )}

            {/* Analysis Results */}
            {analysis && (
                <div className="space-y-4">
                    {/* Overall Score */}
                    <div className="text-center p-6 bg-white/5 rounded-xl">
                        <div className={`text-5xl font-bold ${getScoreColor(analysis.overall)}`}>
                            {analysis.overall}
                        </div>
                        <div className="text-gray-400">Photo Score</div>
                    </div>

                    {/* Criteria Breakdown */}
                    <div className="space-y-3">
                        {Object.entries(ANALYSIS_CRITERIA).map(([key, criteria]) => {
                            const result = analysis[key];
                            const CriteriaIcon = criteria.icon;

                            return (
                                <div
                                    key={key}
                                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                                >
                                    <div className={`p-2 rounded-lg ${getScoreBg(result.score)}`}>
                                        <CriteriaIcon className={`w-5 h-5 ${getScoreColor(result.score)}`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{criteria.name}</span>
                                            <span className={`font-bold ${getScoreColor(result.score)}`}>
                                                {result.score}%
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500">{result.feedback}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recommendations */}
                    {analysis.recommendations.length > 0 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                            <h3 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Improvement Suggestions
                            </h3>
                            <div className="space-y-3">
                                {analysis.recommendations.map((rec, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className={`text-xs px-2 py-0.5 rounded ${rec.priority === 'high'
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                            {rec.priority}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-300">{rec.suggestion}</p>
                                            <p className="text-xs text-green-400 mt-1">{rec.impact}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload new photo */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition-colors"
                    >
                        Upload Different Photo
                    </button>
                </div>
            )}

            {/* Tips */}
            <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
                <h4 className="font-semibold text-pink-400 mb-2">📸 Photo Best Practices</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Face should fill 60-70% of the frame</li>
                    <li>• Use natural lighting or ring light</li>
                    <li>• Smile with teeth for +31% likability</li>
                    <li>• Wear professional attire (+0.94 competence)</li>
                    <li>• Simple, clean background</li>
                    <li>• Update every 1-2 years</li>
                </ul>
            </div>
        </div>
    );
}
