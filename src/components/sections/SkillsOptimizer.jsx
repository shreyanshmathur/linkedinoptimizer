import React, { useState, useRef } from 'react';
import {
    Sparkles, Plus, X, AlertTriangle, Loader2, GripVertical,
    TrendingUp, Zap, Check, Code
} from 'lucide-react';
import { suggestMissingSkills, optimizeSkillsOrder } from '../../utils/aiEngine';
import { getScoreColor } from '../../utils/scoringEngine';

export default function SkillsOptimizer({
    skills, setSkills, score, details,
    jobKeywords, targetRoles, industry,
    onScoreUpdate
}) {
    const [newSkill, setNewSkill] = useState('');
    const [suggestedSkills, setSuggestedSkills] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isOptimizingOrder, setIsOptimizingOrder] = useState(false);
    const [optimizedOrder, setOptimizedOrder] = useState(null);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const dragOverIndex = useRef(null);

    // Add skill
    const handleAddSkill = (skill) => {
        if (skill && !skills.includes(skill)) {
            setSkills([...skills, skill]);
            onScoreUpdate();
            setNewSkill('');
        }
    };

    // Remove skill
    const handleRemoveSkill = (skill) => {
        setSkills(skills.filter(s => s !== skill));
        onScoreUpdate();
    };

    // Get AI suggestions
    const handleGetSuggestions = async () => {
        setIsLoadingSuggestions(true);
        try {
            const suggestions = await suggestMissingSkills(
                skills,
                jobKeywords,
                targetRoles,
                industry
            );
            setSuggestedSkills(suggestions);
        } catch (error) {
            console.error('Error getting suggestions:', error);
        }
        setIsLoadingSuggestions(false);
    };

    // Optimize order
    const handleOptimizeOrder = async () => {
        setIsOptimizingOrder(true);
        try {
            const optimized = await optimizeSkillsOrder(skills, jobKeywords, targetRoles);
            setOptimizedOrder(optimized);
        } catch (error) {
            console.error('Error optimizing order:', error);
        }
        setIsOptimizingOrder(false);
    };

    // Apply optimized order
    const handleApplyOptimizedOrder = () => {
        if (optimizedOrder) {
            const newOrder = optimizedOrder.map(item => item.skill);
            setSkills(newOrder);
            onScoreUpdate();
            setOptimizedOrder(null);
        }
    };

    // Drag and drop handlers
    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        dragOverIndex.current = index;
    };

    const handleDrop = () => {
        if (draggedIndex !== null && dragOverIndex.current !== null && draggedIndex !== dragOverIndex.current) {
            const newSkills = [...skills];
            const draggedSkill = newSkills[draggedIndex];
            newSkills.splice(draggedIndex, 1);
            newSkills.splice(dragOverIndex.current, 0, draggedSkill);
            setSkills(newSkills);
            onScoreUpdate();
        }
        setDraggedIndex(null);
        dragOverIndex.current = null;
    };

    const issues = details?.issues || [];
    const breakdown = details?.breakdown || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Skills Optimizer</h2>
                        <p className="text-gray-400">Top 5 skills get 98% of recruiter attention</p>
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

            {/* Skills list */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Code className="w-5 h-5 text-linkedin-400" />
                        Your Skills ({skills.length})
                    </h3>
                    <button
                        onClick={handleOptimizeOrder}
                        disabled={isOptimizingOrder || skills.length < 5}
                        className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-lg font-semibold hover:bg-purple-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                        {isOptimizingOrder ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Optimizing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3 h-3" />
                                AI Optimize Order
                            </>
                        )}
                    </button>
                </div>

                {/* Drag and drop info */}
                <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                    <GripVertical className="w-3 h-3" />
                    Drag skills to reorder. Top 5 get the most visibility.
                </div>

                {/* Skills grid */}
                <div className="space-y-2 mb-4">
                    {skills.map((skill, index) => (
                        <div
                            key={skill}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={handleDrop}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all ${draggedIndex === index ? 'opacity-50 scale-95' : ''
                                } ${index < 5
                                    ? 'bg-gradient-to-r from-linkedin-600/20 to-linkedin-500/10 border border-linkedin-500/30'
                                    : 'bg-white/5 border border-white/10'
                                }`}
                        >
                            <GripVertical className="w-4 h-4 text-gray-500" />
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 5 ? 'bg-linkedin-500 text-white' : 'bg-white/10 text-gray-500'
                                }`}>
                                {index + 1}
                            </span>
                            <span className="flex-1">{skill}</span>
                            {index < 5 && (
                                <span className="text-xs text-linkedin-400 font-semibold">TOP 5</span>
                            )}
                            <button
                                onClick={() => handleRemoveSkill(skill)}
                                className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add skill */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(newSkill)}
                        placeholder="Add a skill..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-linkedin-500 focus:outline-none"
                    />
                    <button
                        onClick={() => handleAddSkill(newSkill)}
                        disabled={!newSkill}
                        className="px-4 py-3 bg-linkedin-500 rounded-lg hover:bg-linkedin-600 transition-colors disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Optimized order preview */}
            {optimizedOrder && (
                <div className="glass rounded-2xl p-6 bg-gradient-to-r from-purple-600/20 to-pink-500/10 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-purple-400 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            AI Recommended Order
                        </h3>
                        <button
                            onClick={handleApplyOptimizedOrder}
                            className="px-4 py-2 bg-purple-500 rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Apply Order
                        </button>
                    </div>

                    <div className="space-y-2">
                        {optimizedOrder.slice(0, 8).map((item, index) => (
                            <div
                                key={item.skill}
                                className={`flex items-center gap-3 p-2 rounded-lg ${index < 5 ? 'bg-purple-500/20' : 'bg-white/5'
                                    }`}
                            >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 5 ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-500'
                                    }`}>
                                    {index + 1}
                                </span>
                                <span className="flex-1">{item.skill}</span>
                                <span className={`text-xs ${item.relevance_score >= 80 ? 'text-green-400' :
                                        item.relevance_score >= 60 ? 'text-yellow-400' : 'text-gray-500'
                                    }`}>
                                    {item.relevance_score}% relevant
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Suggestions */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Trending Skills to Add
                    </h3>
                    <button
                        onClick={handleGetSuggestions}
                        disabled={isLoadingSuggestions}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoadingSuggestions ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Get AI Suggestions
                            </>
                        )}
                    </button>
                </div>

                {suggestedSkills.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {suggestedSkills.map((suggestion, index) => (
                            <div
                                key={index}
                                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-green-500/50 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className="font-semibold">{suggestion.skill}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                            suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-green-500/20 text-green-400'
                                        }`}>
                                        {suggestion.priority}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mb-3">{suggestion.reason}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Zap className="w-3 h-3 text-yellow-400" />
                                        <span className="text-xs text-gray-500">Trend: {suggestion.trend_score}%</span>
                                    </div>
                                    <button
                                        onClick={() => handleAddSkill(suggestion.skill)}
                                        disabled={skills.includes(suggestion.skill)}
                                        className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded font-semibold hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                    >
                                        {skills.includes(suggestion.skill) ? 'Added' : '+ Add'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 border border-dashed border-white/20 rounded-xl">
                        <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">Discover trending skills for your role</p>
                        <p className="text-sm text-gray-500">
                            Click "Get AI Suggestions" to find skills that employers are looking for
                        </p>
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="glass rounded-2xl p-6 bg-gradient-to-r from-linkedin-600/20 to-linkedin-500/10 border border-linkedin-500/30">
                <h3 className="font-semibold text-linkedin-400 mb-3">💡 Skills Best Practices</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                    <li>• <strong>Top 5 skills</strong> get 98% of recruiter visibility—put your best here</li>
                    <li>• Aim for <strong>15-20 total skills</strong> for optimal score</li>
                    <li>• Include a mix of <strong>technical, soft, and domain</strong> skills</li>
                    <li>• Be <strong>specific</strong>: "Python" beats "Programming Languages"</li>
                    <li>• Take <strong>skills assessments</strong> to get badges and boost credibility</li>
                    <li>• Ask colleagues to <strong>endorse</strong> your top skills</li>
                </ul>
            </div>
        </div>
    );
}
