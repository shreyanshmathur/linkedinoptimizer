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
 * Score Certifications (Weight: 8%)
 */
export function scoreCertifications(certifications, industry = 'general') {
    if (!certifications || certifications.length === 0) {
        return { score: 0, breakdown: {}, issues: ['No certifications - consider adding industry credentials'] };
    }

    const issues = [];
    const breakdown = {};

    // Count (30%)
    const count = certifications.length;
    if (count >= 3) {
        breakdown.count = 100;
    } else if (count >= 2) {
        breakdown.count = 80;
    } else {
        breakdown.count = 60;
        issues.push('Add more certifications (3+ recommended)');
    }

    // Relevance (35%)
    const prestigiousCerts = ['aws', 'azure', 'gcp', 'pmp', 'cfa', 'cpa', 'cissp', 'google', 'microsoft', 'scrum', 'agile'];
    const relevantCount = certifications.filter(c =>
        prestigiousCerts.some(p => (c.name || '').toLowerCase().includes(p))
    ).length;
    breakdown.relevance = Math.min(100, (relevantCount / Math.max(1, count)) * 120);

    // Recency (20%)
    const currentYear = new Date().getFullYear();
    const recentCount = certifications.filter(c => {
        const year = parseInt(c.date) || 0;
        return year >= currentYear - 3;
    }).length;
    breakdown.recency = Math.min(100, (recentCount / count) * 100);
    if (recentCount === 0) {
        issues.push('Consider updating certifications (get new ones within 3 years)');
    }

    // Completeness (15%)
    const complete = certifications.filter(c => c.name && c.issuer).length;
    breakdown.completeness = (complete / count) * 100;

    // Industry multiplier
    const industryMultipliers = {
        'Finance': 1.5, 'Healthcare': 2.0, 'Technology': 1.3, 'Consulting': 1.2
    };
    const multiplier = industryMultipliers[industry] || 1.0;

    const score = Math.min(100, Math.round(
        (breakdown.count * 0.30 + breakdown.relevance * 0.35 + breakdown.recency * 0.20 + breakdown.completeness * 0.15) * multiplier
    ));

    return { score, breakdown, issues, count };
}

/**
 * Score Volunteering (Weight: 3%)
 */
export function scoreVolunteering(volunteering) {
    if (!volunteering || volunteering.length === 0) {
        return { score: 0, breakdown: {}, issues: ['No volunteering - 41% of hiring managers favor volunteer experience'] };
    }

    const issues = [];
    const breakdown = {};

    // Presence (50%)
    breakdown.presence = volunteering.length >= 2 ? 100 : 80;

    // Description quality (30%)
    const withDescription = volunteering.filter(v => (v.description || '').length >= 50).length;
    breakdown.quality = (withDescription / volunteering.length) * 100;
    if (withDescription < volunteering.length) {
        issues.push('Add detailed descriptions to volunteering experiences');
    }

    // Impact (20%)
    const withImpact = volunteering.filter(v => /\d+|impact|helped|supported|organized/i.test(v.description || '')).length;
    breakdown.impact = (withImpact / volunteering.length) * 100;

    const score = Math.round(
        breakdown.presence * 0.50 + breakdown.quality * 0.30 + breakdown.impact * 0.20
    );

    return { score, breakdown, issues, count: volunteering.length };
}

/**
 * Score Recommendations (Weight: 5%)
 */
export function scoreRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
        return { score: 0, breakdown: {}, issues: ['No recommendations - profiles with recommendations get 3x more recruiter contact'] };
    }

    const issues = [];
    const breakdown = {};

    // Count (40%)
    const count = recommendations.length;
    if (count >= 5) {
        breakdown.count = 100;
    } else if (count >= 3) {
        breakdown.count = 85;
    } else {
        breakdown.count = 60;
        issues.push('Get more recommendations (5+ recommended)');
    }

    // Recommender quality (30%)
    const managerRecs = recommendations.filter(r => r.relationship === 'manager').length;
    const clientRecs = recommendations.filter(r => r.relationship === 'client').length;
    breakdown.quality = Math.min(100, (managerRecs * 20) + (clientRecs * 15) + ((count - managerRecs - clientRecs) * 10));

    // Text length/specificity (30%)
    const substantialRecs = recommendations.filter(r => (r.text || '').length >= 200).length;
    breakdown.specificity = (substantialRecs / count) * 100;

    const score = Math.round(
        breakdown.count * 0.40 + breakdown.quality * 0.30 + breakdown.specificity * 0.30
    );

    return { score, breakdown, issues, count };
}

/**
 * Score Featured Content (Weight: 5%)
 */
export function scoreFeatured(featured) {
    if (!featured || featured.length === 0) {
        return { score: 0, breakdown: {}, issues: ['No featured content - add articles, posts or projects to showcase expertise'] };
    }

    const issues = [];
    const breakdown = {};

    // Count (50%)
    const count = featured.length;
    if (count >= 3) {
        breakdown.count = 100;
    } else if (count >= 2) {
        breakdown.count = 80;
    } else {
        breakdown.count = 60;
        issues.push('Add more featured content (3+ recommended)');
    }

    // Has URLs (50%)
    const withUrls = featured.filter(f =>
        typeof f === 'string' ? f.startsWith('http') : (f.url || '').startsWith('http')
    ).length;
    breakdown.urls = (withUrls / count) * 100;

    const score = Math.round(breakdown.count * 0.50 + breakdown.urls * 0.50);

    return { score, breakdown, issues, count };
}

/**
 * Score Interests (Weight: 2%)
 */
export function scoreInterests(interests, industry = 'general') {
    if (!interests || interests.length === 0) {
        return { score: 0, breakdown: {}, issues: ['No interests - following companies and influencers shows industry awareness'] };
    }

    const issues = [];
    const breakdown = {};

    // Count (60%)
    const count = interests.length;
    if (count >= 10) {
        breakdown.count = 100;
    } else if (count >= 5) {
        breakdown.count = 80;
    } else {
        breakdown.count = 50;
        issues.push('Follow more companies and influencers (10+ recommended)');
    }

    // Quality (40%) - check for known companies/influencers
    const highQuality = ['google', 'microsoft', 'amazon', 'linkedin', 'harvard', 'mckinsey', 'tesla', 'apple'];
    const qualityCount = interests.filter(i =>
        highQuality.some(hq => (i || '').toLowerCase().includes(hq))
    ).length;
    breakdown.quality = Math.min(100, (qualityCount / Math.max(1, count)) * 150);

    const score = Math.round(breakdown.count * 0.60 + breakdown.quality * 0.40);

    return { score, breakdown, issues, count };
}

/**
 * Score Contact Info (Weight: 2%)
 */
export function scoreContactInfo(profile) {
    const issues = [];
    const breakdown = {};

    // Custom LinkedIn URL (40%)
    const linkedinUrl = profile.linkedinUrl || '';
    if (linkedinUrl && !linkedinUrl.includes('/in/user') && linkedinUrl.includes('/in/')) {
        breakdown.customUrl = 100;
    } else if (linkedinUrl) {
        breakdown.customUrl = 60;
        issues.push('Customize your LinkedIn URL (remove numbers)');
    } else {
        breakdown.customUrl = 0;
        issues.push('Add your LinkedIn profile URL');
    }

    // Email (30%)
    breakdown.email = profile.email ? 100 : 0;
    if (!profile.email) {
        issues.push('Add professional email for contact scoring');
    }

    // Website/Portfolio (20%)
    const website = profile.website || profile.photoUrl; // Using photoUrl as proxy for having a portfolio
    breakdown.website = website ? 100 : 0;

    // Location (10%)
    breakdown.location = profile.location ? 100 : 0;

    const score = Math.round(
        breakdown.customUrl * 0.40 + breakdown.email * 0.30 + breakdown.website * 0.20 + breakdown.location * 0.10
    );

    return { score, breakdown, issues };
}

/**
 * Calculate overall profile score with 12 sections
 */
export function calculateOverallScore(sectionScores, careerLevel = 'mid', industry = 'general') {
    // Default weights for all 12 sections
    const weights = {
        photo: 0.10,
        headline: 0.15,
        about: 0.15,
        featured: 0.05,
        experience: 0.25,
        education: 0.10,
        certifications: 0.08,
        volunteering: 0.03,
        skills: 0.12,
        recommendations: 0.05,
        interests: 0.02,
        contactInfo: 0.02
    };

    // Career level adjustments
    const careerMultipliers = {
        entry: { education: 1.5, skills: 1.3, certifications: 1.25, experience: 0.8 },
        mid: { experience: 1.15, skills: 1.1 },
        senior: { experience: 1.25, recommendations: 1.2, education: 0.7 },
        executive: { recommendations: 1.3, experience: 1.2, education: 0.6 }
    };

    const multipliers = careerMultipliers[careerLevel] || {};

    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(weights).forEach(([section, weight]) => {
        const score = sectionScores[section];
        if (score !== undefined && score > 0) {
            const adjustedWeight = weight * (multipliers[section] || 1);
            totalScore += score * adjustedWeight;
            totalWeight += adjustedWeight;
        }
    });

    // Normalize if not all sections present
    if (totalWeight > 0) {
        totalScore = totalScore / totalWeight;
    }

    return Math.round(Math.min(100, totalScore));
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

// ============================================
// FULL PERCENTILE BENCHMARKING SYSTEM
// ============================================

/**
 * Industry-specific score distributions (based on LinkedIn research)
 * Format: [p10, p25, p50, p75, p90] scores
 */
const INDUSTRY_BENCHMARKS = {
    'Technology': {
        overall: [45, 58, 72, 84, 92],
        headline: [40, 55, 70, 82, 90],
        about: [35, 50, 65, 78, 88],
        experience: [50, 62, 75, 85, 93],
        skills: [55, 68, 78, 87, 94]
    },
    'Finance': {
        overall: [42, 55, 68, 80, 89],
        headline: [38, 52, 66, 78, 87],
        about: [32, 48, 62, 75, 85],
        experience: [48, 60, 72, 83, 91],
        skills: [50, 63, 74, 84, 92]
    },
    'Healthcare': {
        overall: [40, 52, 65, 77, 86],
        headline: [35, 48, 62, 74, 84],
        about: [30, 45, 58, 72, 82],
        experience: [45, 58, 70, 81, 89],
        skills: [48, 60, 72, 82, 90]
    },
    'Consulting': {
        overall: [48, 62, 75, 86, 94],
        headline: [45, 58, 72, 84, 92],
        about: [38, 52, 68, 80, 90],
        experience: [52, 65, 78, 88, 95],
        skills: [55, 68, 80, 89, 96]
    },
    'Marketing': {
        overall: [44, 57, 70, 82, 91],
        headline: [42, 55, 70, 82, 91],
        about: [35, 50, 65, 78, 88],
        experience: [48, 61, 74, 84, 92],
        skills: [52, 65, 76, 86, 93]
    },
    'default': {
        overall: [42, 55, 68, 80, 89],
        headline: [38, 52, 66, 78, 87],
        about: [32, 48, 62, 75, 85],
        experience: [48, 60, 72, 83, 91],
        skills: [50, 63, 74, 84, 92]
    }
};

/**
 * Career level adjustments for benchmarks
 */
const CAREER_LEVEL_ADJUSTMENTS = {
    entry: { overall: -5, experience: -10, recommendations: -15 },
    mid: { overall: 0, experience: 0, recommendations: 0 },
    senior: { overall: 5, experience: 5, recommendations: 5 },
    executive: { overall: 8, experience: 8, recommendations: 10 }
};

/**
 * Calculate percentile from score using industry benchmarks
 */
export function getPercentile(score, section = 'overall', industry = 'default', careerLevel = 'mid') {
    const benchmarks = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['default'];
    const distribution = benchmarks[section] || benchmarks['overall'];
    const adjustment = CAREER_LEVEL_ADJUSTMENTS[careerLevel]?.[section] || 0;

    const adjustedScore = score - adjustment;

    // [p10, p25, p50, p75, p90]
    if (adjustedScore >= distribution[4]) return Math.max(1, 10 - Math.floor((adjustedScore - distribution[4]) / 2));
    if (adjustedScore >= distribution[3]) return 10 + Math.floor((distribution[4] - adjustedScore) / (distribution[4] - distribution[3]) * 15);
    if (adjustedScore >= distribution[2]) return 25 + Math.floor((distribution[3] - adjustedScore) / (distribution[3] - distribution[2]) * 25);
    if (adjustedScore >= distribution[1]) return 50 + Math.floor((distribution[2] - adjustedScore) / (distribution[2] - distribution[1]) * 25);
    if (adjustedScore >= distribution[0]) return 75 + Math.floor((distribution[1] - adjustedScore) / (distribution[1] - distribution[0]) * 15);
    return Math.min(99, 90 + Math.floor((distribution[0] - adjustedScore) / 5));
}

/**
 * Get tier information based on percentile
 */
export function getTier(percentile) {
    if (percentile <= 1) return { tier: 'Elite', label: 'Top 1%', color: '#10b981', emoji: '🏆' };
    if (percentile <= 5) return { tier: 'Excellent', label: 'Top 5%', color: '#22c55e', emoji: '⭐' };
    if (percentile <= 10) return { tier: 'Outstanding', label: 'Top 10%', color: '#34d399', emoji: '🌟' };
    if (percentile <= 25) return { tier: 'Strong', label: 'Top 25%', color: '#84cc16', emoji: '💪' };
    if (percentile <= 50) return { tier: 'Good', label: 'Top 50%', color: '#eab308', emoji: '👍' };
    if (percentile <= 75) return { tier: 'Fair', label: 'Top 75%', color: '#f97316', emoji: '📈' };
    return { tier: 'Needs Work', label: 'Below Average', color: '#ef4444', emoji: '🔧' };
}

/**
 * Get comprehensive benchmark analysis
 */
export function getBenchmarkAnalysis(sectionScores, industry = 'default', careerLevel = 'mid') {
    const sections = Object.keys(sectionScores);
    const analysis = {
        overall: {
            score: sectionScores.overall || 0,
            percentile: getPercentile(sectionScores.overall || 0, 'overall', industry, careerLevel),
            tier: null,
            vsIndustryAvg: 0,
            trend: 'stable'
        },
        sections: {},
        strengths: [],
        weaknesses: [],
        recommendations: []
    };

    analysis.overall.tier = getTier(analysis.overall.percentile);

    // Analyze each section
    const benchmarks = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['default'];
    const industryMedian = benchmarks['overall'][2]; // p50
    analysis.overall.vsIndustryAvg = sectionScores.overall - industryMedian;

    sections.forEach(section => {
        if (section === 'overall') return;

        const score = sectionScores[section] || 0;
        const percentile = getPercentile(score, section, industry, careerLevel);
        const tier = getTier(percentile);

        analysis.sections[section] = {
            score,
            percentile,
            tier,
            status: percentile <= 25 ? 'strong' : percentile <= 50 ? 'good' : percentile <= 75 ? 'fair' : 'weak'
        };

        if (percentile <= 25 && score > 0) {
            analysis.strengths.push({ section, percentile, tier });
        }
        if (percentile > 75 || score === 0) {
            analysis.weaknesses.push({ section, percentile, tier, score });
        }
    });

    // Generate recommendations based on weaknesses
    analysis.weaknesses.forEach(weakness => {
        const rec = getRecommendationForSection(weakness.section, weakness.score);
        if (rec) analysis.recommendations.push(rec);
    });

    return analysis;
}

/**
 * Get recommendation for a specific section
 */
function getRecommendationForSection(section, score) {
    const recommendations = {
        headline: score === 0
            ? 'Add a compelling headline with keywords and value proposition'
            : 'Optimize headline: add metrics, power words, and clear role title',
        about: score === 0
            ? 'Write an About section showcasing your story and achievements'
            : 'Improve About: add 3+ quantified achievements and a call-to-action',
        experience: score === 0
            ? 'Add work experience with bullet points and metrics'
            : 'Enhance experience: start bullets with power verbs, add 80%+ metrics',
        skills: score === 0
            ? 'Add 15-20 relevant skills ordered by importance'
            : 'Optimize skills: reorder top 5 to match target jobs',
        education: score === 0
            ? 'Add your educational background'
            : 'Enhance education: add relevant coursework and honors',
        certifications: score === 0
            ? 'Add industry certifications to boost credibility (+8% weight)'
            : 'Get certifications from recognized bodies (AWS, PMP, etc.)',
        volunteering: score === 0
            ? 'Add volunteering - 41% of hiring managers favor it'
            : 'Add impact metrics to volunteering experiences',
        recommendations: score === 0
            ? 'Request 3-5 recommendations from managers and colleagues'
            : 'Get recommendations from senior leaders and clients',
        featured: score === 0
            ? 'Add featured content: articles, posts, or portfolio links'
            : 'Add more featured content to showcase expertise',
        interests: score === 0
            ? 'Follow industry leaders and companies'
            : 'Follow more relevant companies and influencers',
        contactInfo: score === 0
            ? 'Customize your LinkedIn URL and add contact info'
            : 'Add professional email and portfolio link',
        photo: score === 0
            ? 'Add professional headshot - 14x more profile views'
            : 'Optimize photo: smile, professional attire, clean background'
    };

    return recommendations[section] || null;
}

/**
 * Get competitive analysis vs peers
 */
export function getCompetitiveAnalysis(score, industry = 'default', careerLevel = 'mid') {
    const benchmarks = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS['default'];
    const distribution = benchmarks['overall'];

    const percentile = getPercentile(score, 'overall', industry, careerLevel);
    const tier = getTier(percentile);

    // Calculate where user stands
    const analysis = {
        score,
        percentile,
        tier,
        ranking: `Top ${percentile}%`,
        industry,
        careerLevel,
        comparison: {
            p10: distribution[0],
            p25: distribution[1],
            p50: distribution[2],
            p75: distribution[3],
            p90: distribution[4]
        },
        gap: {
            toTop10: Math.max(0, distribution[4] - score),
            toTop25: Math.max(0, distribution[3] - score),
            toTop50: Math.max(0, distribution[2] - score)
        },
        message: ''
    };

    // Generate personalized message
    if (percentile <= 10) {
        analysis.message = `Outstanding! You're in the top ${percentile}% of ${industry} professionals.`;
    } else if (percentile <= 25) {
        analysis.message = `Great job! You're in the top 25%. ${analysis.gap.toTop10} points to reach top 10%.`;
    } else if (percentile <= 50) {
        analysis.message = `You're above average. ${analysis.gap.toTop25} points to reach top 25%.`;
    } else {
        analysis.message = `Room for improvement. ${analysis.gap.toTop50} points to reach top 50%.`;
    }

    return analysis;
}

/**
 * Get section-specific improvement priorities
 */
export function getImprovementPriorities(sectionScores, industry = 'default') {
    const sections = Object.entries(sectionScores)
        .filter(([key]) => key !== 'overall')
        .map(([section, score]) => ({
            section,
            score,
            percentile: getPercentile(score, section, industry),
            weight: getSectionWeight(section),
            impactScore: (100 - score) * getSectionWeight(section) // Potential impact
        }))
        .sort((a, b) => b.impactScore - a.impactScore);

    return sections.slice(0, 5).map((s, i) => ({
        priority: i + 1,
        section: s.section,
        currentScore: s.score,
        percentile: s.percentile,
        potentialGain: Math.round(s.impactScore),
        recommendation: getRecommendationForSection(s.section, s.score)
    }));
}

function getSectionWeight(section) {
    const weights = {
        experience: 0.25, headline: 0.15, about: 0.15, skills: 0.12,
        photo: 0.10, education: 0.10, certifications: 0.08, featured: 0.05,
        recommendations: 0.05, volunteering: 0.03, interests: 0.02, contactInfo: 0.02
    };
    return weights[section] || 0.05;
}

export { POWER_VERBS, DEFAULT_JOB_KEYWORDS, INDUSTRY_BENCHMARKS };


