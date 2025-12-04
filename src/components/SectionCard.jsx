import React from 'react';
import { ChevronRight, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { getScoreColor } from '../utils/scoringEngine';

export default function SectionCard({ section, score, details, onClick }) {
    const issues = details?.issues || [];
    const hasIssues = issues.length > 0;

    return (
        <div
            onClick={onClick}
            className="glass rounded-xl p-5 cursor-pointer card-hover group"
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${score >= 80 ? 'bg-green-500/20' :
                        score >= 60 ? 'bg-yellow-500/20' :
                            'bg-red-500/20'
                    }`}>
                    <section.icon className={`w-6 h-6 ${score >= 80 ? 'text-green-400' :
                            score >= 60 ? 'text-yellow-400' :
                                'text-red-400'
                        }`} />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{section.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                                {score}
                            </span>
                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-linkedin-400 transition-colors" />
                        </div>
                    </div>

                    {/* Score bar */}
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${score >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                                    score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                                        'bg-gradient-to-r from-red-500 to-orange-400'
                                }`}
                            style={{ width: `${score}%` }}
                        />
                    </div>

                    {/* Issues or success */}
                    {score >= 80 ? (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>Looking great! Minor optimizations available.</span>
                        </div>
                    ) : hasIssues ? (
                        <div className="space-y-1">
                            {issues.slice(0, 2).map((issue, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                    <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${score < 50 ? 'text-red-400' : 'text-yellow-400'
                                        }`} />
                                    <span className="text-gray-300">{issue}</span>
                                </div>
                            ))}
                            {issues.length > 2 && (
                                <div className="text-xs text-gray-500 ml-6">
                                    +{issues.length - 2} more suggestions
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>Add content to improve this section</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Breakdown preview */}
            {details?.breakdown && (
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2">
                    {Object.entries(details.breakdown).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="text-center">
                            <div className={`text-sm font-semibold ${getScoreColor(value)}`}>
                                {Math.round(value)}%
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
