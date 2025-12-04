import React, { useState } from 'react';
import { Eye, Clock, Target, Info } from 'lucide-react';

// Recruiter attention data based on eye-tracking research
const HEATMAP_ZONES = [
    { id: 'name', label: 'Name', attention: 95, time: '2.1s', top: '5%', left: '20%', width: '60%', height: '8%', level: 'critical' },
    { id: 'headline', label: 'Headline', attention: 90, time: '1.8s', top: '14%', left: '20%', width: '60%', height: '6%', level: 'critical' },
    { id: 'photo', label: 'Photo', attention: 75, time: '0.8s', top: '5%', left: '5%', width: '12%', height: '18%', level: 'important' },
    { id: 'current-role', label: 'Current Role', attention: 85, time: '1.5s', top: '22%', left: '20%', width: '60%', height: '5%', level: 'critical' },
    { id: 'about-first', label: 'About (First 200 chars)', attention: 65, time: '1.2s', top: '30%', left: '5%', width: '90%', height: '15%', level: 'important' },
    { id: 'recent-exp', label: 'Recent Experience', attention: 70, time: '1.0s', top: '48%', left: '5%', width: '90%', height: '20%', level: 'important' },
    { id: 'education', label: 'Education', attention: 45, time: '0.5s', top: '70%', left: '5%', width: '90%', height: '10%', level: 'moderate' },
    { id: 'skills', label: 'Skills', attention: 30, time: '0.3s', top: '82%', left: '5%', width: '90%', height: '12%', level: 'low' }
];

export default function RecruiterHeatmap({ profile, scores }) {
    const [hoveredZone, setHoveredZone] = useState(null);
    const [showInfo, setShowInfo] = useState(false);

    const getZoneClass = (level) => {
        switch (level) {
            case 'critical': return 'heatmap-critical';
            case 'important': return 'heatmap-important';
            case 'moderate': return 'heatmap-moderate';
            case 'low': return 'heatmap-low';
            default: return 'heatmap-low';
        }
    };

    const totalTime = HEATMAP_ZONES.reduce((sum, z) => sum + parseFloat(z.time), 0).toFixed(1);

    return (
        <div className="glass rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <Eye className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Recruiter Heatmap</h2>
                        <p className="text-sm text-gray-400">Based on eye-tracking research</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <Info className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Info panel */}
            {showInfo && (
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-sm">
                    <h3 className="font-semibold text-blue-400 mb-2">About This Heatmap</h3>
                    <p className="text-gray-300">
                        This visualization shows where recruiters spend their time when reviewing LinkedIn profiles,
                        based on eye-tracking studies. The average recruiter spends only <strong>{totalTime} seconds</strong> on
                        a profile. Red zones get the most attention—optimize these first!
                    </p>
                </div>
            )}

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-linkedin-400" />
                        <span className="text-2xl font-bold">{totalTime}s</span>
                    </div>
                    <div className="text-xs text-gray-400">Avg Review Time</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-red-400" />
                        <span className="text-2xl font-bold">6</span>
                    </div>
                    <div className="text-xs text-gray-400">Key Focus Areas</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Eye className="w-4 h-4 text-green-400" />
                        <span className="text-2xl font-bold">80%</span>
                    </div>
                    <div className="text-xs text-gray-400">Top 3 Zones</div>
                </div>
            </div>

            {/* Heatmap visualization */}
            <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl overflow-hidden" style={{ height: '500px' }}>
                {/* LinkedIn profile mockup */}
                <div className="absolute inset-0 p-4">
                    {/* Banner placeholder */}
                    <div className="h-20 bg-gradient-to-r from-linkedin-600 to-linkedin-500 rounded-t-lg"></div>

                    {/* Content area */}
                    <div className="bg-slate-800/50 p-4 rounded-b-lg">
                        <div className="flex gap-4 mb-4">
                            {/* Photo placeholder */}
                            <div className="w-24 h-24 rounded-full bg-gray-600 border-4 border-slate-800 -mt-12"></div>

                            {/* Name/headline */}
                            <div className="flex-1 pt-2">
                                <div className="h-4 bg-gray-500/30 rounded w-48 mb-2"></div>
                                <div className="h-3 bg-gray-500/20 rounded w-64 mb-1"></div>
                                <div className="h-3 bg-gray-500/20 rounded w-56"></div>
                            </div>
                        </div>

                        {/* About section placeholder */}
                        <div className="mb-4">
                            <div className="h-3 bg-gray-500/20 rounded w-full mb-1"></div>
                            <div className="h-3 bg-gray-500/20 rounded w-11/12 mb-1"></div>
                            <div className="h-3 bg-gray-500/20 rounded w-10/12 mb-1"></div>
                            <div className="h-3 bg-gray-500/20 rounded w-9/12"></div>
                        </div>

                        {/* Experience placeholder */}
                        <div className="mb-4">
                            <div className="h-4 bg-gray-500/30 rounded w-32 mb-3"></div>
                            <div className="flex gap-3 mb-3">
                                <div className="w-12 h-12 bg-gray-600/50 rounded"></div>
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-500/20 rounded w-40 mb-1"></div>
                                    <div className="h-2 bg-gray-500/15 rounded w-32 mb-1"></div>
                                    <div className="h-2 bg-gray-500/15 rounded w-24"></div>
                                </div>
                            </div>
                        </div>

                        {/* Education placeholder */}
                        <div className="mb-4">
                            <div className="h-4 bg-gray-500/30 rounded w-28 mb-3"></div>
                            <div className="flex gap-3">
                                <div className="w-10 h-10 bg-gray-600/50 rounded"></div>
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-500/20 rounded w-36 mb-1"></div>
                                    <div className="h-2 bg-gray-500/15 rounded w-28"></div>
                                </div>
                            </div>
                        </div>

                        {/* Skills placeholder */}
                        <div>
                            <div className="h-4 bg-gray-500/30 rounded w-20 mb-3"></div>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-6 bg-gray-600/30 rounded-full px-3 w-20"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Heatmap zones overlay */}
                {HEATMAP_ZONES.map(zone => (
                    <div
                        key={zone.id}
                        className={`absolute rounded-lg cursor-pointer transition-all duration-300 ${getZoneClass(zone.level)} ${hoveredZone === zone.id ? 'z-20 scale-102' : 'z-10'
                            }`}
                        style={{
                            top: zone.top,
                            left: zone.left,
                            width: zone.width,
                            height: zone.height,
                        }}
                        onMouseEnter={() => setHoveredZone(zone.id)}
                        onMouseLeave={() => setHoveredZone(null)}
                    >
                        {/* Tooltip */}
                        {hoveredZone === zone.id && (
                            <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-30">
                                <div className="glass rounded-lg p-3 min-w-[180px] text-center shadow-xl">
                                    <div className="font-semibold text-white mb-1">{zone.label}</div>
                                    <div className="flex items-center justify-center gap-4 text-sm">
                                        <div>
                                            <span className="text-red-400 font-bold">{zone.attention}%</span>
                                            <span className="text-gray-400 ml-1">attention</span>
                                        </div>
                                        <div>
                                            <span className="text-blue-400 font-bold">{zone.time}</span>
                                            <span className="text-gray-400 ml-1">avg</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded heatmap-critical"></div>
                    <span className="text-sm text-gray-400">Critical (80%+)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded heatmap-important"></div>
                    <span className="text-sm text-gray-400">Important (60-79%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded heatmap-moderate"></div>
                    <span className="text-sm text-gray-400">Moderate (40-59%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded heatmap-low"></div>
                    <span className="text-sm text-gray-400">Low (&lt;40%)</span>
                </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 p-4 bg-gradient-to-r from-linkedin-600/20 to-linkedin-500/10 rounded-xl border border-linkedin-500/30">
                <h3 className="font-semibold text-linkedin-400 mb-2">💡 Focus Your Optimization</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                    <li>• <strong>Name & Headline</strong> get 95% of attention in the first 3 seconds</li>
                    <li>• <strong>First 200 characters</strong> of your About section must hook the reader</li>
                    <li>• <strong>Current role</strong> should clearly state your target position</li>
                    <li>• Skills get only 0.3 seconds—make top 5 count!</li>
                </ul>
            </div>
        </div>
    );
}
