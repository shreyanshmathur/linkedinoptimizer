/**
 * LinkedIn Profile Optimizer - Scoring Engine
 * Implements hybrid scoring: TF-IDF (60%) + Semantic (25%) + Rules (15%)
 */

// Power verb tiers for experience scoring
const POWER_VERBS = {
    tier1: ['spearheaded', 'orchestrated', 'pioneered', 'architected', 'transformed', 'revolutionized'],
    tier2: ['accelerated', 'optimized', 'delivered', 'achieved', 'streamlined', 'maximized'],
    tier3: ['led', 'managed', 'built', 'developed', 'created', 'established', 'launched'],
    tier4: ['improved', 'increased', 'enhanced', 'supported', 'assisted', 'contributed']
};

// Common job keywords by category
const DEFAULT_JOB_KEYWORDS = {
    technical: ['python', 'javascript', 'react', 'sql', 'aws', 'machine learning', 'data analysis', 'api', 'cloud', 'agile'],
    soft: ['leadership', 'communication', 'collaboration', 'problem-solving', 'strategic', 'innovative'],
    business: ['revenue', 'growth', 'strategy', 'stakeholder', 'roi', 'kpi', 'metrics', 'budget'],
    action: ['delivered', 'achieved', 'increased', 'reduced', 'improved', 'managed', 'led', 'built']
};

/**
 * Calculate TF-IDF style keyword match score
 */
export function calculateKeywordScore(text, keywords) {
    if (!text || !keywords || keywords.length === 0) return 0;

    const textLower = text.toLowerCase();
    const words = textLower.split(/\s+/);

    let matchCount = 0;
    let weightedScore = 0;

    keywords.forEach((keyword, index) => {
        const keywordLower = keyword.toLowerCase();
        if (textLower.includes(keywordLower)) {
            matchCount++;
            // Earlier keywords are typically more important
            const positionWeight = 1 - (index * 0.02);
            weightedScore += Math.max(0.5, positionWeight);
        }
    });

    const matchRatio = matchCount / keywords.length;
    const normalizedWeight = weightedScore / keywords.length;

    return Math.min(100, (matchRatio * 60 + normalizedWeight * 40));
}

/**
 * Score headline section (220 chars max)
 */
export function scoreHeadline(headline, jobKeywords = []) {
    if (!headline || headline.trim() === '') {
        return { score: 0, breakdown: {}, issues: ['No headline provided'] };
    }

    const issues = [];
    const breakdown = {};

    // Character length (10%)
    const charCount = headline.length;
    if (charCount < 80) {
        breakdown.length = 30;
        issues.push('Headline too short (aim for 80-220 characters)');
    } else if (charCount > 220) {
        breakdown.length = 50;
        issues.push('Headline exceeds 220 character limit');
    } else if (charCount >= 120 && charCount <= 180) {
        breakdown.length = 100;
    } else {
        breakdown.length = 80;
    }

    // Word count (10%)
    const wordCount = headline.split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount >= 8 && wordCount <= 15) {
        breakdown.wordCount = 100;
    } else if (wordCount >= 5 && wordCount <= 20) {
        breakdown.wordCount = 70;
    } else {
        breakdown.wordCount = 40;
        issues.push('Aim for 8-15 words in headline');
    }

    // Keywords (30%)
    const allKeywords = [...jobKeywords, ...DEFAULT_JOB_KEYWORDS.technical.slice(0, 5)];
    breakdown.keywords = calculateKeywordScore(headline, allKeywords);
    if (breakdown.keywords < 50) {
        issues.push('Add more relevant keywords to headline');
    }

    // Value proposition (20%) - check for differentiators
    const valueIndicators = ['expert', 'specialist', 'leader', 'proven', 'award', 'top', 'senior', 'principal'];
    const hasValue = valueIndicators.some(v => headline.toLowerCase().includes(v));
    breakdown.value = hasValue ? 90 : 50;
    if (!hasValue) {
        issues.push('Add a value differentiator (expert, specialist, leader, etc.)');
    }

    // Role clarity (15%) - job title in first few words
    const firstWords = headline.split(/[|,\-–—]/).map(p => p.trim())[0] || '';
    const roleTerms = ['manager', 'engineer', 'developer', 'analyst', 'director', 'lead', 'specialist', 'consultant', 'designer'];
    const hasRoleUpfront = roleTerms.some(r => firstWords.toLowerCase().includes(r));
    breakdown.roleClarity = hasRoleUpfront ? 100 : 40;
    if (!hasRoleUpfront) {
        issues.push('Put your job title in the first few words');
    }

    // Metrics/numbers (10%)
    const hasMetrics = /\d+/.test(headline);
    breakdown.metrics = hasMetrics ? 100 : 30;
    if (!hasMetrics) {
        issues.push('Add quantified metrics (years experience, team size, etc.)');
    }

    // Power words (5%)
    const allPowerVerbs = [...POWER_VERBS.tier1, ...POWER_VERBS.tier2];
    const hasPowerWord = allPowerVerbs.some(v => headline.toLowerCase().includes(v));
    breakdown.powerWords = hasPowerWord ? 100 : 50;

    // Calculate weighted score
    const score = Math.round(
        breakdown.length * 0.10 +
        breakdown.wordCount * 0.10 +
        breakdown.keywords * 0.30 +
        breakdown.value * 0.20 +
        breakdown.roleClarity * 0.15 +
        breakdown.metrics * 0.10 +
        breakdown.powerWords * 0.05
    );

    return { score, breakdown, issues, charCount, wordCount };
}

/**
 * Score About section (2,600 chars max)
 */
export function scoreAbout(about, jobKeywords = []) {
    if (!about || about.trim() === '') {
        return { score: 0, breakdown: {}, issues: ['No About section provided'] };
    }

    const issues = [];
    const breakdown = {};

    // Character count (10%)
    const charCount = about.length;
    if (charCount < 300) {
        breakdown.length = 30;
        issues.push('About section too short (aim for 1,500-2,000 characters)');
    } else if (charCount >= 1500 && charCount <= 2000) {
        breakdown.length = 100;
    } else if (charCount >= 500 && charCount <= 2600) {
        breakdown.length = 80;
    } else if (charCount > 2600) {
        breakdown.length = 60;
        issues.push('About section exceeds 2,600 character limit');
    } else {
        breakdown.length = 50;
    }

    // First 200 chars hook (15%)
    const hook = about.substring(0, 200);
    const allKeywords = [...jobKeywords, ...DEFAULT_JOB_KEYWORDS.technical.slice(0, 5)];
    const hookKeywords = allKeywords.filter(kw => hook.toLowerCase().includes(kw.toLowerCase()));
    breakdown.hook = Math.min(100, hookKeywords.length * 25);
    if (hookKeywords.length < 2) {
        issues.push('Add keywords to your first 200 characters (visible before "See more")');
    }

    // Achievement count (20%)
    const metricPatterns = [
        /\d+%/g,
        /\$[\d,]+[KMB]?/gi,
        /\d+\+?\s*(years?|clients?|projects?|team|people)/gi,
        /increased|reduced|improved|grew|achieved|delivered/gi
    ];
    let achievementCount = 0;
    metricPatterns.forEach(pattern => {
        const matches = about.match(pattern);
        if (matches) achievementCount += matches.length;
    });
    breakdown.achievements = Math.min(100, achievementCount * 25);
    if (achievementCount < 3) {
        issues.push('Add more quantified achievements (aim for 3+)');
    }

    // Keyword density (25%)
    breakdown.keywords = calculateKeywordScore(about, allKeywords);
    if (breakdown.keywords < 40) {
        issues.push('Increase keyword density (aim for 40-60% match)');
    }

    // Story arc (15%) - check for structure
    const hasProblem = /challenge|problem|issue|pain|struggle|faced/i.test(about);
    const hasSolution = /solution|approach|strategy|method|developed|created|built/i.test(about);
    const hasResult = /result|outcome|achieved|delivered|increased|reduced|impact/i.test(about);
    const arcScore = (hasProblem ? 33 : 0) + (hasSolution ? 33 : 0) + (hasResult ? 34 : 0);
    breakdown.storyArc = arcScore;
    if (arcScore < 66) {
        issues.push('Structure your About with Problem → Solution → Results');
    }

    // Call-to-action (10%)
    const ctaPatterns = /connect|reach out|contact|message|email|let's|discuss|open to/i;
    breakdown.cta = ctaPatterns.test(about) ? 100 : 30;
    if (breakdown.cta < 50) {
        issues.push('Add a call-to-action at the end');
    }

    // Readability (5%) - paragraph structure
    const paragraphs = about.split(/\n\n|\r\n\r\n/).filter(p => p.trim().length > 0);
    const avgParagraphLength = about.length / Math.max(1, paragraphs.length);
    breakdown.readability = (avgParagraphLength < 500 && paragraphs.length >= 3) ? 100 : 50;

    // Calculate weighted score
    const score = Math.round(
        breakdown.length * 0.10 +
        breakdown.hook * 0.15 +
        breakdown.achievements * 0.20 +
        breakdown.keywords * 0.25 +
        breakdown.storyArc * 0.15 +
        breakdown.cta * 0.10 +
        breakdown.readability * 0.05
    );

    return { score, breakdown, issues, charCount, wordCount: about.split(/\s+/).length };
}

/**
 * Score Experience section
 */
export function scoreExperience(experiences, jobKeywords = []) {
    if (!experiences || experiences.length === 0) {
        return { score: 0, breakdown: {}, issues: ['No experience provided'] };
    }

    const issues = [];
    const breakdown = {};

    // Number of roles (10%)
    const roleCount = experiences.length;
    if (roleCount >= 3 && roleCount <= 5) {
        breakdown.roleCount = 100;
    } else if (roleCount >= 2 && roleCount <= 7) {
        breakdown.roleCount = 70;
    } else {
        breakdown.roleCount = 40;
        issues.push('Aim for 3-5 roles in your experience section');
    }

    // Analyze each role
    let totalBullets = 0;
    let bulletsWithMetrics = 0;
    let powerVerbScore = 0;
    let keywordMatches = 0;

    experiences.forEach(exp => {
        const bullets = exp.bullets || [];
        totalBullets += bullets.length;

        bullets.forEach(bullet => {
            // Check for metrics
            if (/\d+%|\$[\d,]+|\d+\s*(years?|clients?|projects?)/i.test(bullet)) {
                bulletsWithMetrics++;
            }

            // Check for power verbs
            const bulletLower = bullet.toLowerCase();
            if (POWER_VERBS.tier1.some(v => bulletLower.startsWith(v))) {
                powerVerbScore += 4;
            } else if (POWER_VERBS.tier2.some(v => bulletLower.startsWith(v))) {
                powerVerbScore += 3;
            } else if (POWER_VERBS.tier3.some(v => bulletLower.startsWith(v))) {
                powerVerbScore += 2;
            } else if (POWER_VERBS.tier4.some(v => bulletLower.startsWith(v))) {
                powerVerbScore += 1;
            }

            // Check keywords
            const allKeywords = [...jobKeywords, ...DEFAULT_JOB_KEYWORDS.action];
            keywordMatches += allKeywords.filter(kw => bulletLower.includes(kw.toLowerCase())).length;
        });
    });

    // Bullets per role (15%)
    const avgBullets = totalBullets / roleCount;
    if (avgBullets >= 3 && avgBullets <= 5) {
        breakdown.bulletsPerRole = 100;
    } else if (avgBullets >= 2 && avgBullets <= 7) {
        breakdown.bulletsPerRole = 70;
    } else {
        breakdown.bulletsPerRole = 40;
        issues.push('Aim for 3-5 bullet points per role');
    }

    // Metrics percentage (25%)
    const metricsPercent = totalBullets > 0 ? (bulletsWithMetrics / totalBullets) * 100 : 0;
    breakdown.metrics = Math.min(100, metricsPercent * 1.25);
    if (metricsPercent < 80) {
        issues.push('Add metrics to 80%+ of your bullet points');
    }

    // Action verbs (20%)
    const maxPowerScore = totalBullets * 4;
    breakdown.actionVerbs = maxPowerScore > 0 ? Math.min(100, (powerVerbScore / maxPowerScore) * 100) : 0;
    if (breakdown.actionVerbs < 60) {
        issues.push('Start bullets with stronger action verbs (spearheaded, orchestrated, delivered)');
    }

    // Keyword inclusion (15%)
    breakdown.keywords = Math.min(100, (keywordMatches / Math.max(1, totalBullets)) * 30);

    // Recency bias (10%) - most recent role should be most detailed
    const recentRole = experiences[0];
    const recentBullets = recentRole?.bullets?.length || 0;
    breakdown.recency = recentBullets >= 4 ? 100 : recentBullets >= 2 ? 70 : 40;
    if (recentBullets < 4) {
        issues.push('Add more detail to your most recent role');
    }

    // Impact clarity (5%)
    const impactTerms = experiences.flatMap(exp => exp.bullets || [])
        .filter(b => /result|impact|outcome|achieved|delivered|increased|reduced/i.test(b));
    breakdown.impact = Math.min(100, (impactTerms.length / Math.max(1, totalBullets)) * 150);

    // Calculate weighted score
    const score = Math.round(
        breakdown.roleCount * 0.10 +
        breakdown.bulletsPerRole * 0.15 +
        breakdown.metrics * 0.25 +
        breakdown.actionVerbs * 0.20 +
        breakdown.keywords * 0.15 +
        breakdown.recency * 0.10 +
        breakdown.impact * 0.05
    );

    return {
        score,
        breakdown,
        issues,
        roleCount,
        totalBullets,
        metricsPercent: Math.round(metricsPercent)
    };
}

/**
 * Score Skills section
 */
export function scoreSkills(skills, jobKeywords = []) {
    if (!skills || skills.length === 0) {
        return { score: 0, breakdown: {}, issues: ['No skills provided'] };
    }

    const issues = [];
    const breakdown = {};

    // Total skills (10%)
    const skillCount = skills.length;
    if (skillCount >= 15 && skillCount <= 20) {
        breakdown.count = 100;
    } else if (skillCount >= 10 && skillCount <= 25) {
        breakdown.count = 70;
    } else if (skillCount < 10) {
        breakdown.count = 40;
        issues.push('Add more skills (aim for 15-20)');
    } else {
        breakdown.count = 60;
        issues.push('Consider focusing on your top 20 skills');
    }

    // Top 5 relevance (20%)
    const top5 = skills.slice(0, 5);
    const allKeywords = [...jobKeywords, ...DEFAULT_JOB_KEYWORDS.technical];
    const top5Matches = top5.filter(skill =>
        allKeywords.some(kw => skill.toLowerCase().includes(kw.toLowerCase()))
    );
    breakdown.top5Relevance = (top5Matches.length / 5) * 100;
    if (breakdown.top5Relevance < 60) {
        issues.push('Reorder skills to put most relevant in top 5 (98% visibility)');
    }

    // Skill categories (15%)
    const categories = {
        technical: skills.filter(s => DEFAULT_JOB_KEYWORDS.technical.some(t => s.toLowerCase().includes(t))).length,
        soft: skills.filter(s => DEFAULT_JOB_KEYWORDS.soft.some(t => s.toLowerCase().includes(t))).length,
        business: skills.filter(s => DEFAULT_JOB_KEYWORDS.business.some(t => s.toLowerCase().includes(t))).length
    };
    const categoryCount = Object.values(categories).filter(c => c > 0).length;
    breakdown.categories = categoryCount >= 3 ? 100 : categoryCount === 2 ? 70 : 40;
    if (categoryCount < 3) {
        issues.push('Diversify skills across technical, soft, and business categories');
    }

    // Order optimization (20%)
    const keywordMatchOrder = skills.map((skill, index) => ({
        skill,
        index,
        isMatch: allKeywords.some(kw => skill.toLowerCase().includes(kw.toLowerCase()))
    }));
    const matchedIndices = keywordMatchOrder.filter(s => s.isMatch).map(s => s.index);
    const avgMatchIndex = matchedIndices.length > 0
        ? matchedIndices.reduce((a, b) => a + b, 0) / matchedIndices.length
        : skillCount;
    breakdown.order = Math.max(0, 100 - (avgMatchIndex * 5));

    // Gap coverage (20%)
    const gapCoverage = allKeywords.filter(kw =>
        skills.some(skill => skill.toLowerCase().includes(kw.toLowerCase()))
    ).length / allKeywords.length;
    breakdown.gapCoverage = Math.min(100, gapCoverage * 150);
    if (gapCoverage < 0.6) {
        issues.push('Add skills that match job keywords');
    }

    // Specificity (15%)
    const genericTerms = ['microsoft office', 'communication', 'teamwork', 'excel', 'word'];
    const specificSkills = skills.filter(s =>
        !genericTerms.some(g => s.toLowerCase().includes(g))
    );
    breakdown.specificity = (specificSkills.length / skillCount) * 100;
    if (breakdown.specificity < 70) {
        issues.push('Replace generic skills with specific, technical ones');
    }

    // Calculate weighted score
    const score = Math.round(
        breakdown.count * 0.10 +
        breakdown.top5Relevance * 0.20 +
        breakdown.categories * 0.15 +
        breakdown.order * 0.20 +
        breakdown.gapCoverage * 0.20 +
        breakdown.specificity * 0.15
    );

    return { score, breakdown, issues, skillCount, categories };
}

/**
 * Score Education section
 */
export function scoreEducation(education, careerLevel = 'mid') {
    if (!education || education.length === 0) {
        return { score: 0, breakdown: {}, issues: ['No education provided'] };
    }

    const issues = [];
    const breakdown = {};

    const primaryEdu = education[0];

    // School presence (20%)
    breakdown.school = primaryEdu.school ? 100 : 0;

    // Degree listed (20%)
    breakdown.degree = primaryEdu.degree ? 100 : 0;
    if (!primaryEdu.degree) {
        issues.push('Add your degree type');
    }

    // Graduation year (10%)
    const currentYear = new Date().getFullYear();
    const gradYear = primaryEdu.graduationYear;
    if (gradYear && currentYear - gradYear <= 10) {
        breakdown.recency = 100;
    } else if (gradYear) {
        breakdown.recency = 70;
    } else {
        breakdown.recency = 50;
        issues.push('Add graduation year');
    }

    // Relevance (20%)
    const relevantFields = ['computer science', 'engineering', 'business', 'marketing', 'data', 'design'];
    const field = (primaryEdu.field || primaryEdu.degree || '').toLowerCase();
    breakdown.relevance = relevantFields.some(f => field.includes(f)) ? 100 : 60;

    // Coursework (15%)
    const coursework = primaryEdu.coursework || [];
    if (coursework.length >= 5) {
        breakdown.coursework = 100;
    } else if (coursework.length >= 3) {
        breakdown.coursework = 70;
    } else {
        breakdown.coursework = 40;
        if (careerLevel === 'entry') {
            issues.push('Add relevant coursework (5-8 courses recommended)');
        }
    }

    // Honors/GPA (15%)
    const hasHonors = primaryEdu.honors || primaryEdu.gpa >= 3.5;
    breakdown.honors = hasHonors ? 100 : 50;
    if (!hasHonors && careerLevel === 'entry') {
        issues.push('Add honors or GPA if 3.5+');
    }

    // Career level adjustments
    let multiplier = 1;
    if (careerLevel === 'entry') {
        multiplier = 1.2; // Education more important for entry-level
    } else if (careerLevel === 'senior' || careerLevel === 'executive') {
        multiplier = 0.8; // Less important for senior roles
    }

    // Calculate weighted score
    let score = Math.round(
        breakdown.school * 0.20 +
        breakdown.degree * 0.20 +
        breakdown.recency * 0.10 +
        breakdown.relevance * 0.20 +
        breakdown.coursework * 0.15 +
        breakdown.honors * 0.15
    );

    // Apply career level multiplier (max 100)
    score = Math.min(100, Math.round(score * multiplier));

    return { score, breakdown, issues };
}

/**
 * Score Photo
 */
export function scorePhoto(photoAnalysis) {
    if (!photoAnalysis || !photoAnalysis.hasPhoto) {
        return {
            score: 0,
            breakdown: {},
            issues: ['No photo - profiles with photos get 14x more views']
        };
    }

    const issues = [];
    const breakdown = {};

    // Photo present (30%)
    breakdown.present = 100;

    // Face size (20%)
    const facePercent = photoAnalysis.facePercent || 0;
    if (facePercent >= 60 && facePercent <= 70) {
        breakdown.faceSize = 100;
    } else if (facePercent >= 50 && facePercent <= 80) {
        breakdown.faceSize = 70;
    } else {
        breakdown.faceSize = 40;
        issues.push('Face should fill 60-70% of the frame');
    }

    // Image quality (20%)
    const resolution = photoAnalysis.resolution || 0;
    if (resolution >= 1200) {
        breakdown.quality = 100;
    } else if (resolution >= 800) {
        breakdown.quality = 70;
    } else if (resolution >= 400) {
        breakdown.quality = 50;
    } else {
        breakdown.quality = 20;
        issues.push('Use higher resolution photo (1200x1200px recommended)');
    }

    // Professional attire (15%)
    breakdown.attire = photoAnalysis.professionalAttire ? 100 : 50;
    if (!photoAnalysis.professionalAttire) {
        issues.push('Consider professional attire for +0.94 competence perception');
    }

    // Expression (10%)
    breakdown.expression = photoAnalysis.smiling ? 100 : 60;
    if (!photoAnalysis.smiling) {
        issues.push('Smile with teeth for +1.35 likability');
    }

    // Background (5%)
    breakdown.background = photoAnalysis.cleanBackground ? 100 : 50;
    if (!photoAnalysis.cleanBackground) {
        issues.push('Use a clean, uncluttered background');
    }

    // Calculate weighted score
    const score = Math.round(
        breakdown.present * 0.30 +
        breakdown.faceSize * 0.20 +
        breakdown.quality * 0.20 +
        breakdown.attire * 0.15 +
        breakdown.expression * 0.10 +
        breakdown.background * 0.05
    );

    return { score, breakdown, issues };
}

/**
 * Calculate overall profile score
 */
export function calculateOverallScore(sectionScores) {
    const weights = {
        headline: 0.15,
        about: 0.20,
        experience: 0.30,
        skills: 0.15,
        education: 0.10,
        photo: 0.10
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([section, weight]) => {
        if (sectionScores[section] !== undefined) {
            totalScore += sectionScores[section] * weight;
            totalWeight += weight;
        }
    });

    // Normalize if not all sections present
    if (totalWeight > 0 && totalWeight < 1) {
        totalScore = totalScore / totalWeight;
    }

    return Math.round(totalScore);
}

/**
 * Get score color based on value
 */
export function getScoreColor(score) {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
}

/**
 * Get score label
 */
export function getScoreLabel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Needs Work';
    return 'Critical';
}

/**
 * Get percentile estimate
 */
export function getPercentile(score) {
    if (score >= 95) return 1;
    if (score >= 90) return 5;
    if (score >= 85) return 10;
    if (score >= 80) return 20;
    if (score >= 75) return 30;
    if (score >= 70) return 40;
    if (score >= 65) return 50;
    if (score >= 60) return 60;
    if (score >= 55) return 70;
    if (score >= 50) return 80;
    return 90;
}

export { POWER_VERBS, DEFAULT_JOB_KEYWORDS };
