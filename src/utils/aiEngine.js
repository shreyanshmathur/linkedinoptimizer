/**
 * AI Suggestion Engine using OpenRouter API
 * Model: openai/gpt-oss-20b:free
 */

const OPENROUTER_API_KEY = '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';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-4o-mini';

/**
 * Make API call to OpenRouter
 */
async function callOpenRouter(messages, options = {}) {
    try {
        const response = await fetch(OPENROUTER_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'LinkedIn Profile Optimizer'
            },
            body: JSON.stringify({
                model: MODEL,
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 2000,
                ...options.extraBody
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('OpenRouter API error:', error);
        throw error;
    }
}

/**
 * Parse JSON from AI response
 */
function parseAIResponse(content) {
    try {
        // Try direct parse
        return JSON.parse(content);
    } catch {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1].trim());
        }
        // Try to find JSON array or object
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            return JSON.parse(arrayMatch[0]);
        }
        const objectMatch = content.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            return JSON.parse(objectMatch[0]);
        }
        throw new Error('Could not parse JSON from response');
    }
}

/**
 * Generate headline suggestions
 */
export async function generateHeadlineSuggestions(currentHeadline, jobKeywords, targetRoles, industry, careerLevel) {
    const prompt = `You are a LinkedIn profile optimization expert. Generate 3 improved headline suggestions.

CURRENT HEADLINE: ${currentHeadline}
TARGET ROLES: ${targetRoles.join(', ')}
INDUSTRY: ${industry}
CAREER LEVEL: ${careerLevel}
KEY SKILLS TO INCLUDE: ${jobKeywords.slice(0, 8).join(', ')}

REQUIREMENTS:
- Each headline must be 80-220 characters
- Include 3-5 keywords from the skills list
- Lead with job title in first 3 words
- Include quantified metrics (years, %, $, team size)
- Use power words (spearheaded, delivered, scaled, etc.)

Return ONLY valid JSON array:
[
  {
    "version": 1,
    "text": "headline text here",
    "reasoning": "why this works better",
    "estimated_score": 92,
    "char_count": 158,
    "keywords_included": ["keyword1", "keyword2"]
  }
]`;

    try {
        const content = await callOpenRouter([
            { role: 'system', content: 'You are a LinkedIn optimization expert. Always return valid JSON.' },
            { role: 'user', content: prompt }
        ]);

        return parseAIResponse(content);
    } catch (error) {
        console.error('Error generating headlines:', error);
        return getFallbackHeadlineSuggestions(currentHeadline, jobKeywords, targetRoles);
    }
}

/**
 * Fallback headline suggestions
 */
function getFallbackHeadlineSuggestions(currentHeadline, jobKeywords, targetRoles) {
    const role = targetRoles[0] || 'Professional';
    const skill1 = jobKeywords[0] || 'Strategy';
    const skill2 = jobKeywords[1] || 'Leadership';

    return [
        {
            version: 1,
            text: `${role} | ${skill1} & ${skill2} Expert | 5+ Years Driving Results`,
            reasoning: 'Leads with target role, includes top skills, quantifies experience',
            estimated_score: 85,
            char_count: 65,
            keywords_included: [skill1, skill2]
        },
        {
            version: 2,
            text: `Results-Driven ${role} | Specializing in ${skill1} | Proven Track Record`,
            reasoning: 'Emphasizes results orientation, establishes specialization',
            estimated_score: 82,
            char_count: 72,
            keywords_included: [skill1]
        },
        {
            version: 3,
            text: `${role} | Delivered $1M+ Impact | ${skill1} & ${skill2} Leader`,
            reasoning: 'Shows quantified business impact with specific dollar value',
            estimated_score: 88,
            char_count: 60,
            keywords_included: [skill1, skill2]
        }
    ];
}

/**
 * Generate improved About section
 */
export async function generateAboutImprovement(currentAbout, jobKeywords, targetRoles, careerLevel) {
    const prompt = `You are a LinkedIn profile optimization expert. Rewrite this About section to score 90+ out of 100.

CURRENT ABOUT SECTION:
${currentAbout}

TARGET ROLES: ${targetRoles.join(', ')}
KEY SKILLS: ${jobKeywords.slice(0, 10).join(', ')}
CAREER LEVEL: ${careerLevel}

REQUIREMENTS:
- 300-400 words (1,500-2,000 characters)
- First 200 characters must be compelling hook with keywords
- Include 3+ quantified achievements with metrics
- Follow Problem → Solution → Results story arc
- Include clear call-to-action at end
- Write in first person, professional yet conversational
- 2-3 sentence paragraphs for readability

Return ONLY valid JSON:
{
  "improved_text": "the new about section text",
  "key_improvements": ["improvement 1", "improvement 2"],
  "keywords_added": ["keyword1", "keyword2"],
  "estimated_score": 92
}`;

    try {
        const content = await callOpenRouter([
            { role: 'system', content: 'You are an expert LinkedIn profile writer. Return valid JSON.' },
            { role: 'user', content: prompt }
        ], { temperature: 0.8, maxTokens: 1500 });

        return parseAIResponse(content);
    } catch (error) {
        console.error('Error generating about:', error);
        return {
            improved_text: currentAbout,
            key_improvements: ['Could not generate improvements'],
            keywords_added: [],
            estimated_score: 60
        };
    }
}

/**
 * Improve experience bullet point
 */
export async function improveExperienceBullet(currentBullet, jobKeywords, roleTitle, company) {
    const prompt = `Improve this LinkedIn experience bullet point using the XYZ formula:
"Accomplished X by doing Y, measured by Z"

CURRENT BULLET: ${currentBullet}
ROLE: ${roleTitle} at ${company}
KEY SKILLS TO INCLUDE: ${jobKeywords.slice(0, 5).join(', ')}

REQUIREMENTS:
- Start with Tier 1 power verb (spearheaded, orchestrated, pioneered, architected, transformed)
- Include specific quantified result (%, $, numbers, time saved)
- Mention 2-3 relevant keywords from skills list
- 150-200 characters maximum
- Show clear business impact

Return ONLY valid JSON:
{
  "improved": "the improved bullet point",
  "power_verb": "the power verb used",
  "metrics_added": "the metrics included",
  "impact_increase": 15
}`;

    try {
        const content = await callOpenRouter([
            { role: 'system', content: 'You are an expert resume writer. Return valid JSON.' },
            { role: 'user', content: prompt }
        ], { temperature: 0.7, maxTokens: 300 });

        return parseAIResponse(content);
    } catch (error) {
        console.error('Error improving bullet:', error);
        return {
            improved: currentBullet,
            power_verb: 'N/A',
            metrics_added: 'None',
            impact_increase: 0
        };
    }
}

/**
 * Suggest missing skills
 */
export async function suggestMissingSkills(currentSkills, jobKeywords, targetRoles, industry) {
    const prompt = `Based on this profile and job requirements, suggest 5-8 highly relevant skills that are missing.

CURRENT SKILLS: ${currentSkills.join(', ')}
TARGET ROLE: ${targetRoles[0]}
INDUSTRY: ${industry}
JOB KEYWORDS: ${jobKeywords.join(', ')}

Return ONLY valid JSON array of skills with reasoning:
[
  {
    "skill": "Python",
    "priority": "high",
    "reason": "Required by 85% of jobs in this field",
    "category": "technical",
    "trend_score": 95
  }
]`;

    try {
        const content = await callOpenRouter([
            { role: 'system', content: 'You are a career advisor and skills analyst. Return valid JSON.' },
            { role: 'user', content: prompt }
        ], { temperature: 0.6, maxTokens: 1000 });

        const skills = parseAIResponse(content);
        return Array.isArray(skills) ? skills.slice(0, 8) : [];
    } catch (error) {
        console.error('Error suggesting skills:', error);
        return [];
    }
}

/**
 * Optimize skills order
 */
export async function optimizeSkillsOrder(currentSkills, jobKeywords, targetRoles) {
    const prompt = `Analyze these skills and reorder them for a ${targetRoles[0]} position.
Place the most relevant and in-demand skills in the top 5 positions (which get 98% visibility).

CURRENT SKILLS: ${currentSkills.join(', ')}
TARGET ROLE: ${targetRoles[0]}
JOB KEYWORDS: ${jobKeywords.slice(0, 10).join(', ')}

Return JSON array of skills in optimal order with relevance scores:
[
  {
    "skill": "Product Management",
    "position": 1,
    "relevance_score": 98,
    "reasoning": "Core skill for the role"
  }
]`;

    try {
        const content = await callOpenRouter([
            { role: 'system', content: 'You are a LinkedIn optimization expert. Return valid JSON.' },
            { role: 'user', content: prompt }
        ], { temperature: 0.5, maxTokens: 1500 });

        return parseAIResponse(content);
    } catch (error) {
        console.error('Error optimizing skills:', error);
        return currentSkills.map((skill, index) => ({
            skill,
            position: index + 1,
            relevance_score: 100 - index * 5,
            reasoning: 'Original order maintained'
        }));
    }
}

/**
 * Generate personalized insights
 */
export async function generatePersonalizedInsights(profileData, industryBenchmarks) {
    const prompt = `You are a career coach analyzing a LinkedIn profile against industry benchmarks.
Provide 3-5 personalized insights with specific action items.

PROFILE SUMMARY:
- Overall Score: ${profileData.overallScore}/100
- Headline Score: ${profileData.headlineScore}/100
- Experience Score: ${profileData.experienceScore}/100
- Skills Count: ${profileData.skillsCount}
- Industry: ${profileData.industry}
- Target Role: ${profileData.targetRole}

INDUSTRY BENCHMARKS (Top 10%):
- Average Overall Score: ${industryBenchmarks.topScore || 88}/100
- Average Skills Count: ${industryBenchmarks.avgSkillsCount || 18}

Provide insights as JSON:
[
  {
    "insight": "Your headline is 20 points below top performers",
    "priority": "high",
    "action": "Add quantified metrics and specific technical skills",
    "estimated_impact": "+15 points",
    "time_required": "5 minutes"
  }
]`;

    try {
        const content = await callOpenRouter([
            { role: 'system', content: 'You are an expert career coach. Return valid JSON.' },
            { role: 'user', content: prompt }
        ], { temperature: 0.7, maxTokens: 1200 });

        return parseAIResponse(content);
    } catch (error) {
        console.error('Error generating insights:', error);
        return [
            {
                insight: 'Could not generate personalized insights',
                priority: 'medium',
                action: 'Try again later',
                estimated_impact: 'N/A',
                time_required: 'N/A'
            }
        ];
    }
}

export { callOpenRouter, parseAIResponse };
