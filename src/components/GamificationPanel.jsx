import React from 'react';
import { Trophy, Star, Zap, Target, Award, TrendingUp } from 'lucide-react';
import {
    calculateLevel, calculateLevelProgress, xpToNextLevel,
    getLevelTitle, getLevelColor, ACHIEVEMENTS
} from '../utils/gamification';

export default function GamificationPanel({ gamification, scores }) {
    const level = calculateLevel(gamification.xp);
    const levelProgress = calculateLevelProgress(gamification.xp);
    const xpNeeded = xpToNextLevel(gamification.xp);

    return (
        <div className="space-y-4">
            {/* Level card */}
            <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getLevelColor(level)} flex items-center justify-center shadow-lg`}>
                        <span className="text-2xl font-bold">{level}</span>
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-lg">{getLevelTitle(level)}</div>
                        <div className="text-sm text-gray-400">{gamification.xp} XP Total</div>
                    </div>
                </div>

                {/* XP progress bar */}
                <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Level {level}</span>
                        <span>Level {level + 1}</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r ${getLevelColor(level)} xp-fill rounded-full`}
                            style={{ width: `${levelProgress}%` }}
                        />
                    </div>
                    <div className="text-center text-xs text-gray-500 mt-1">
                        {xpNeeded} XP to next level
                    </div>
                </div>
            </div>

            {/* Achievements */}
            <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-300 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        Achievements
                    </h3>
                    <span className="text-xs text-gray-500">
                        {gamification.unlockedAchievements.length}/{ACHIEVEMENTS.length}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {ACHIEVEMENTS.map(achievement => {
                        const isUnlocked = gamification.unlockedAchievements.includes(achievement.id);
                        return (
                            <div
                                key={achievement.id}
                                className={`relative group p-3 rounded-xl text-center transition-all ${isUnlocked
                                        ? 'bg-yellow-500/20 border border-yellow-500/40'
                                        : 'bg-white/5 opacity-50'
                                    }`}
                            >
                                <div className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>
                                    {achievement.icon}
                                </div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-32 p-2 bg-slate-800 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                    <div className="font-semibold">{achievement.name}</div>
                                    <div className="text-gray-400 text-[10px]">{achievement.description}</div>
                                    {isUnlocked && (
                                        <div className="text-green-400 text-[10px] mt-1">✓ Unlocked</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stats */}
            <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-gray-300 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Your Progress
                </h3>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Optimizations</span>
                        <span className="font-semibold">{gamification.optimizationsCompleted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Suggestions Accepted</span>
                        <span className="font-semibold">{gamification.suggestionsAccepted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Score Improvement</span>
                        <span className="font-semibold text-green-400">
                            +{gamification.totalScoreImprovement} pts
                        </span>
                    </div>
                </div>
            </div>

            {/* Motivational message */}
            <div className="text-center p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                {scores.overall >= 85 ? (
                    <>
                        <div className="text-2xl mb-2">🌟</div>
                        <div className="text-sm font-semibold text-purple-300">You're in the Top 10%!</div>
                        <div className="text-xs text-gray-400">Outstanding profile optimization</div>
                    </>
                ) : scores.overall >= 70 ? (
                    <>
                        <div className="text-2xl mb-2">🚀</div>
                        <div className="text-sm font-semibold text-blue-300">Great Progress!</div>
                        <div className="text-xs text-gray-400">A few tweaks to reach top tier</div>
                    </>
                ) : scores.overall >= 50 ? (
                    <>
                        <div className="text-2xl mb-2">💪</div>
                        <div className="text-sm font-semibold text-yellow-300">Keep Going!</div>
                        <div className="text-xs text-gray-400">You're making solid improvements</div>
                    </>
                ) : (
                    <>
                        <div className="text-2xl mb-2">🎯</div>
                        <div className="text-sm font-semibold text-orange-300">Let's Optimize!</div>
                        <div className="text-xs text-gray-400">Follow the suggestions to boost your score</div>
                    </>
                )}
            </div>
        </div>
    );
}
