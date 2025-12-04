import React, { useState } from 'react';
import {
    Sparkles, Check, Plus, X, AlertTriangle, Loader2,
    Briefcase, TrendingUp, Zap
} from 'lucide-react';
import { improveExperienceBullet } from '../../utils/aiEngine';
import { getScoreColor, POWER_VERBS } from '../../utils/scoringEngine';

export default function ExperienceOptimizer({
    experiences, setExperiences, score, details,
    jobKeywords, onScoreUpdate
}) {
    const [improvingBullet, setImprovingBullet] = useState(null);
    const [improvements, setImprovements] = useState({});

    // Improve a specific bullet
    const handleImproveBullet = async (expIndex, bulletIndex) => {
        const key = `${expIndex}-${bulletIndex}`;
        setImprovingBullet(key);

        try {
            const exp = experiences[expIndex];
            const bullet = exp.bullets[bulletIndex];

            const result = await improveExperienceBullet(
                bullet,
                jobKeywords,
                exp.title,
                exp.company
            );

            setImprovements(prev => ({
                ...prev,
                [key]: result
            }));
        } catch (error) {
            console.error('Error improving bullet:', error);
        }

        setImprovingBullet(null);
    };

    // Apply improvement
    const handleApplyImprovement = (expIndex, bulletIndex) => {
        const key = `${expIndex}-${bulletIndex}`;
        const improvement = improvements[key];

        if (improvement?.improved) {
            const updated = [...experiences];
            updated[expIndex].bullets[bulletIndex] = improvement.improved;
            setExperiences(updated);
            onScoreUpdate();

            // Clear the improvement
            setImprovements(prev => {
                const newState = { ...prev };
                delete newState[key];
                return newState;
            });
        }
    };

    // Add new experience
    const handleAddExperience = () => {
        setExperiences([
            ...experiences,
            { title: '', company: '', duration: '', bullets: [''] }
        ]);
    };

    // Update experience field
    const handleUpdateExperience = (index, field, value) => {
        const updated = [...experiences];
        updated[index] = { ...updated[index], [field]: value };
        setExperiences(updated);
        onScoreUpdate();
    };

    // Update bullet
    const handleUpdateBullet = (expIndex, bulletIndex, value) => {
        const updated = [...experiences];
        updated[expIndex].bullets[bulletIndex] = value;
        setExperiences(updated);
        onScoreUpdate();
    };

    // Add bullet
    const handleAddBullet = (expIndex) => {
        const updated = [...experiences];
        updated[expIndex].bullets.push('');
        setExperiences(updated);
    };

    // Remove bullet
    const handleRemoveBullet = (expIndex, bulletIndex) => {
        const updated = [...experiences];
        updated[expIndex].bullets.splice(bulletIndex, 1);
        setExperiences(updated);
        onScoreUpdate();
    };

    // Remove experience
    const handleRemoveExperience = (index) => {
        const updated = experiences.filter((_, i) => i !== index);
        setExperiences(updated);
        onScoreUpdate();
    };

    const issues = details?.issues || [];
    const breakdown = details?.breakdown || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Experience Optimizer</h2>
                        <p className="text-gray-400">Craft impactful bullet points that get noticed</p>
                    </div>
                    <div className="text-right">
                        <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                            {score}
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

                {/* Issues */}
                {issues.length > 0 && (
                    <div className="space-y-2">
                        {issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300">{issue}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Experiences */}
            {experiences.map((exp, expIndex) => (
                <div key={expIndex} className="glass rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-linkedin-500/20 flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-linkedin-400" />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={exp.title}
                                    onChange={(e) => handleUpdateExperience(expIndex, 'title', e.target.value)}
                                    placeholder="Job Title"
                                    className="bg-transparent text-lg font-semibold focus:outline-none w-full"
                                />
                                <input
                                    type="text"
                                    value={exp.company}
                                    onChange={(e) => handleUpdateExperience(expIndex, 'company', e.target.value)}
                                    placeholder="Company Name"
                                    className="bg-transparent text-gray-400 text-sm focus:outline-none w-full"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => handleRemoveExperience(expIndex)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Bullets */}
                    <div className="space-y-3 ml-15">
                        {exp.bullets.map((bullet, bulletIndex) => {
                            const key = `${expIndex}-${bulletIndex}`;
                            const improvement = improvements[key];
                            const isImproving = improvingBullet === key;

                            return (
                                <div key={bulletIndex} className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-500 mt-3">•</span>
                                        <div className="flex-1">
                                            <textarea
                                                value={bullet}
                                                onChange={(e) => handleUpdateBullet(expIndex, bulletIndex, e.target.value)}
                                                placeholder="Achieved X by doing Y, resulting in Z..."
                                                rows={2}
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-linkedin-500 focus:outline-none resize-none"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => handleImproveBullet(expIndex, bulletIndex)}
                                                disabled={isImproving || !bullet}
                                                className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                                                title="Improve with AI"
                                            >
                                                {isImproving ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-4 h-4" />
                                                )}
                                            </button>
                                            {exp.bullets.length > 1 && (
                                                <button
                                                    onClick={() => handleRemoveBullet(expIndex, bulletIndex)}
                                                    className="p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Improvement suggestion */}
                                    {improvement && (
                                        <div className="ml-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-green-400">AI Improved Version</span>
                                                <div className="flex items-center gap-1 text-xs text-green-400">
                                                    <Zap className="w-3 h-3" />
                                                    +{improvement.impact_increase} impact
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-300 mb-3">{improvement.improved}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                                <span>Power verb: <span className="text-purple-400">{improvement.power_verb}</span></span>
                                                <span>•</span>
                                                <span>Metrics: <span className="text-blue-400">{improvement.metrics_added}</span></span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApplyImprovement(expIndex, bulletIndex)}
                                                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-1"
                                                >
                                                    <Check className="w-3 h-3" /> Apply
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setImprovements(prev => {
                                                            const newState = { ...prev };
                                                            delete newState[key];
                                                            return newState;
                                                        });
                                                    }}
                                                    className="px-3 py-1 bg-white/10 text-gray-400 text-sm rounded-lg hover:bg-white/20 transition-colors"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <button
                            onClick={() => handleAddBullet(expIndex)}
                            className="text-sm text-linkedin-400 hover:text-linkedin-300 flex items-center gap-1 ml-4"
                        >
                            <Plus className="w-4 h-4" /> Add bullet point
                        </button>
                    </div>
                </div>
            ))}

            {/* Add experience button */}
            <button
                onClick={handleAddExperience}
                className="w-full py-4 border-2 border-dashed border-white/20 rounded-2xl text-gray-400 hover:text-white hover:border-linkedin-500 transition-colors flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Add Experience
            </button>

            {/* Tips */}
            <div className="glass rounded-2xl p-6 bg-gradient-to-r from-linkedin-600/20 to-linkedin-500/10 border border-linkedin-500/30">
                <h3 className="font-semibold text-linkedin-400 mb-3">💡 Experience Best Practices</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>
                        <h4 className="font-semibold text-white mb-2">XYZ Formula</h4>
                        <p className="text-gray-400 mb-2">"Accomplished <strong>X</strong> by doing <strong>Y</strong>, measured by <strong>Z</strong>"</p>
                        <p className="text-xs text-gray-500">Example: "Increased revenue by 40% by implementing new sales strategy, resulting in $2M growth"</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-white mb-2">Power Verbs to Use</h4>
                        <div className="flex flex-wrap gap-1">
                            {POWER_VERBS.tier1.map(verb => (
                                <span key={verb} className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded capitalize">
                                    {verb}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
