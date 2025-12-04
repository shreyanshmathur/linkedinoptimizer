/**
 * Gamification System - XP, Levels, Achievements
 */

// XP rewards
export const XP_REWARDS = {
    SCORE_90_PLUS: 50,
    SCORE_80_89: 30,
    SCORE_70_79: 20,
    SCORE_60_69: 10,
    FIRST_OPTIMIZATION: 25,
    SECTION_COMPLETE: 15,
    DAILY_CHALLENGE: 50,
    SUGGESTION_ACCEPTED: 5
};

// Achievement definitions
export const ACHIEVEMENTS = [
    {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Complete your first optimization',
        icon: '🌟',
        condition: (stats) => stats.optimizationsCompleted >= 1,
        xpReward: 50
    },
    {
        id: 'headline_master',
        name: 'Headline Master',
        description: 'Score 90+ on headline',
        icon: '⚡',
        condition: (stats) => stats.headlineScore >= 90,
        xpReward: 75
    },
    {
        id: 'profile_complete',
        name: 'Profile Complete',
        description: 'All sections score 70+',
        icon: '🏆',
        condition: (stats) => {
            const scores = [
                stats.headlineScore,
                stats.aboutScore,
                stats.experienceScore,
                stats.skillsScore,
                stats.educationScore
            ];
            return scores.every(s => s >= 70);
        },
        xpReward: 100
    },
    {
        id: 'top_10',
        name: 'Top 10%',
        description: 'Achieve overall score 85+',
        icon: '🎯',
        condition: (stats) => stats.overallScore >= 85,
        xpReward: 150
    },
    {
        id: 'ats_champion',
        name: 'ATS Champion',
        description: 'All sections ATS-compatible',
        icon: '✓',
        condition: (stats) => stats.atsCompatible === true,
        xpReward: 75
    },
    {
        id: 'keyword_king',
        name: 'Keyword King',
        description: 'Achieve 80%+ keyword match',
        icon: '📈',
        condition: (stats) => stats.keywordMatch >= 80,
        xpReward: 100
    }
];

// Daily challenges
export const DAILY_CHALLENGES = [
    {
        id: 'improve_headline',
        title: 'Headline Hero',
        description: 'Increase headline score by 10 points',
        xpReward: 100,
        condition: (before, after) => after.headlineScore - before.headlineScore >= 10
    },
    {
        id: 'add_skills',
        title: 'Skill Stacker',
        description: 'Add 3 new relevant skills',
        xpReward: 75,
        condition: (before, after) => after.skillsCount - before.skillsCount >= 3
    },
    {
        id: 'optimize_experience',
        title: 'Experience Expert',
        description: 'Improve experience score by 15 points',
        xpReward: 125,
        condition: (before, after) => after.experienceScore - before.experienceScore >= 15
    },
    {
        id: 'accept_suggestions',
        title: 'AI Adopter',
        description: 'Accept 5 AI suggestions',
        xpReward: 50,
        condition: (before, after) => after.suggestionsAccepted - before.suggestionsAccepted >= 5
    },
    {
        id: 'complete_about',
        title: 'About Ace',
        description: 'Score 80+ on About section',
        xpReward: 100,
        condition: (before, after) => after.aboutScore >= 80 && before.aboutScore < 80
    }
];

/**
 * Calculate level from XP
 */
export function calculateLevel(xp) {
    return Math.floor(xp / 100) + 1;
}

/**
 * Calculate XP progress to next level
 */
export function calculateLevelProgress(xp) {
    const currentLevelXP = xp % 100;
    return currentLevelXP;
}

/**
 * Calculate XP needed for next level
 */
export function xpToNextLevel(xp) {
    return 100 - (xp % 100);
}

/**
 * Get XP reward based on score
 */
export function getScoreXPReward(score) {
    if (score >= 90) return XP_REWARDS.SCORE_90_PLUS;
    if (score >= 80) return XP_REWARDS.SCORE_80_89;
    if (score >= 70) return XP_REWARDS.SCORE_70_79;
    if (score >= 60) return XP_REWARDS.SCORE_60_69;
    return 0;
}

/**
 * Check for newly unlocked achievements
 */
export function checkAchievements(stats, unlockedIds = []) {
    const newlyUnlocked = [];

    ACHIEVEMENTS.forEach(achievement => {
        if (!unlockedIds.includes(achievement.id) && achievement.condition(stats)) {
            newlyUnlocked.push(achievement);
        }
    });

    return newlyUnlocked;
}

/**
 * Get today's challenge
 */
export function getTodayChallenge() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const challengeIndex = dayOfYear % DAILY_CHALLENGES.length;
    return DAILY_CHALLENGES[challengeIndex];
}

/**
 * Check if daily challenge is complete
 */
export function checkDailyChallenge(challenge, beforeStats, afterStats) {
    return challenge.condition(beforeStats, afterStats);
}

/**
 * Get level title
 */
export function getLevelTitle(level) {
    if (level >= 20) return 'LinkedIn Legend';
    if (level >= 15) return 'Profile Pro';
    if (level >= 10) return 'Optimization Expert';
    if (level >= 7) return 'Rising Star';
    if (level >= 5) return 'Improving Professional';
    if (level >= 3) return 'Active Optimizer';
    return 'Beginner';
}

/**
 * Get level color
 */
export function getLevelColor(level) {
    if (level >= 20) return 'from-yellow-400 to-amber-500';
    if (level >= 15) return 'from-purple-400 to-pink-500';
    if (level >= 10) return 'from-blue-400 to-cyan-500';
    if (level >= 7) return 'from-green-400 to-emerald-500';
    if (level >= 5) return 'from-teal-400 to-green-500';
    if (level >= 3) return 'from-gray-400 to-slate-500';
    return 'from-gray-500 to-gray-600';
}

/**
 * Initialize gamification state
 */
export function initializeGamificationState() {
    return {
        xp: 0,
        level: 1,
        unlockedAchievements: [],
        dailyChallengeCompleted: false,
        lastOptimization: null,
        optimizationsCompleted: 0,
        suggestionsAccepted: 0,
        totalScoreImprovement: 0
    };
}

/**
 * Save gamification state to localStorage
 */
export function saveGamificationState(state) {
    try {
        localStorage.setItem('linkedin_optimizer_gamification', JSON.stringify(state));
    } catch (e) {
        console.error('Could not save gamification state:', e);
    }
}

/**
 * Load gamification state from localStorage
 */
export function loadGamificationState() {
    try {
        const saved = localStorage.getItem('linkedin_optimizer_gamification');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error('Could not load gamification state:', e);
    }
    return initializeGamificationState();
}
