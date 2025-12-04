import React, { useState } from 'react';
import {
    Upload, Target, Briefcase, Sparkles, ChevronDown, Plus, X,
    FileText, Clipboard, ArrowRight, Loader2
} from 'lucide-react';

const INDUSTRIES = [
    'Technology', 'Finance', 'Healthcare', 'Consulting', 'Marketing',
    'Sales', 'Education', 'Manufacturing', 'Retail', 'Media'
];

const COMMON_ROLES = [
    'Product Manager', 'Software Engineer', 'Data Scientist', 'Project Manager',
    'Marketing Manager', 'Sales Manager', 'Business Analyst', 'UX Designer',
    'DevOps Engineer', 'Account Executive', 'HR Manager', 'Financial Analyst'
];

const CAREER_LEVELS = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior (6-10 years)' },
    { value: 'executive', label: 'Executive (10+ years)' }
];

export default function ProfileInput({
    profile, setProfile,
    jobKeywords, setJobKeywords,
    targetRoles, setTargetRoles,
    industry, setIndustry,
    careerLevel, setCareerLevel,
    onAnalyze, isLoading
}) {
    const [activeTab, setActiveTab] = useState('paste');
    const [newKeyword, setNewKeyword] = useState('');
    const [newRole, setNewRole] = useState('');

    const handleExperienceAdd = () => {
        setProfile({
            ...profile,
            experiences: [
                ...profile.experiences,
                { title: '', company: '', duration: '', bullets: [''] }
            ]
        });
    };

    const handleExperienceUpdate = (index, field, value) => {
        const updated = [...profile.experiences];
        updated[index] = { ...updated[index], [field]: value };
        setProfile({ ...profile, experiences: updated });
    };

    const handleBulletUpdate = (expIndex, bulletIndex, value) => {
        const updated = [...profile.experiences];
        updated[expIndex].bullets[bulletIndex] = value;
        setProfile({ ...profile, experiences: updated });
    };

    const handleAddBullet = (expIndex) => {
        const updated = [...profile.experiences];
        updated[expIndex].bullets.push('');
        setProfile({ ...profile, experiences: updated });
    };

    const handleSkillAdd = (skill) => {
        if (skill && !profile.skills.includes(skill)) {
            setProfile({ ...profile, skills: [...profile.skills, skill] });
        }
    };

    const handleSkillRemove = (skill) => {
        setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
    };

    const handleAddKeyword = () => {
        if (newKeyword && !jobKeywords.includes(newKeyword)) {
            setJobKeywords([...jobKeywords, newKeyword]);
            setNewKeyword('');
        }
    };

    const handleAddRole = () => {
        if (newRole && !targetRoles.includes(newRole)) {
            setTargetRoles([...targetRoles, newRole]);
            setNewRole('');
        }
    };

    const isProfileComplete = profile.headline || profile.about || profile.experiences.length > 0 || profile.skills.length > 0;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Hero section */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-linkedin-500/20 rounded-full text-linkedin-400 text-sm mb-6">
                    <Sparkles className="w-4 h-4" />
                    <span>AI-Powered Profile Optimization</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    <span className="gradient-text">Optimize Your LinkedIn</span>
                    <br />
                    <span className="text-white">Get 71% More Callbacks</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Our hybrid AI scoring engine analyzes your profile against 47+ keywords
                    and provides actionable suggestions to rank in the top 10%.
                </p>
            </div>

            {/* Job Targeting */}
            <div className="glass rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Target className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Job Targeting</h2>
                        <p className="text-sm text-gray-400">Help us tailor suggestions to your goals</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Target Roles */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Target Roles</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {targetRoles.map(role => (
                                <span
                                    key={role}
                                    className="px-3 py-1 bg-linkedin-500/20 text-linkedin-400 rounded-full text-sm flex items-center gap-1"
                                >
                                    {role}
                                    <button onClick={() => setTargetRoles(targetRoles.filter(r => r !== role))}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-linkedin-500 focus:outline-none"
                            >
                                <option value="">Select a role...</option>
                                {COMMON_ROLES.filter(r => !targetRoles.includes(r)).map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddRole}
                                className="px-3 py-2 bg-linkedin-500 rounded-lg hover:bg-linkedin-600 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Industry */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Industry</label>
                        <select
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 focus:border-linkedin-500 focus:outline-none"
                        >
                            {INDUSTRIES.map(ind => (
                                <option key={ind} value={ind}>{ind}</option>
                            ))}
                        </select>
                    </div>

                    {/* Career Level */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Career Level</label>
                        <select
                            value={careerLevel}
                            onChange={(e) => setCareerLevel(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 focus:border-linkedin-500 focus:outline-none"
                        >
                            {CAREER_LEVELS.map(level => (
                                <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Keywords */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Job Keywords (from job descriptions)</label>
                        <div className="flex flex-wrap gap-2 mb-2 max-h-20 overflow-y-auto">
                            {jobKeywords.map(kw => (
                                <span
                                    key={kw}
                                    className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1"
                                >
                                    {kw}
                                    <button onClick={() => setJobKeywords(jobKeywords.filter(k => k !== kw))}>
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                                placeholder="Add keyword..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-linkedin-500 focus:outline-none"
                            />
                            <button
                                onClick={handleAddKeyword}
                                className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Input */}
            <div className="glass rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-linkedin-500 to-linkedin-400 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Your Profile</h2>
                        <p className="text-sm text-gray-400">Enter your LinkedIn content</p>
                    </div>
                </div>

                {/* Headline */}
                <div className="mb-6">
                    <label className="text-sm text-gray-400 mb-2 block flex justify-between">
                        <span>Headline</span>
                        <span className={profile.headline.length > 220 ? 'text-red-400' : 'text-gray-500'}>
                            {profile.headline.length}/220
                        </span>
                    </label>
                    <input
                        type="text"
                        value={profile.headline}
                        onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                        placeholder="Product Manager | Data Analytics Expert | 5+ Years B2B SaaS"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-linkedin-500 focus:outline-none"
                    />
                </div>

                {/* About */}
                <div className="mb-6">
                    <label className="text-sm text-gray-400 mb-2 block flex justify-between">
                        <span>About</span>
                        <span className={profile.about.length > 2600 ? 'text-red-400' : 'text-gray-500'}>
                            {profile.about.length}/2600
                        </span>
                    </label>
                    <textarea
                        value={profile.about}
                        onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                        placeholder="I'm a passionate product manager with 5+ years of experience..."
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-linkedin-500 focus:outline-none resize-none"
                    />
                </div>

                {/* Experience */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm text-gray-400">Experience</label>
                        <button
                            onClick={handleExperienceAdd}
                            className="text-sm text-linkedin-400 hover:text-linkedin-300 flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Add Role
                        </button>
                    </div>

                    {profile.experiences.map((exp, expIndex) => (
                        <div key={expIndex} className="bg-white/5 rounded-xl p-4 mb-4">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    value={exp.title}
                                    onChange={(e) => handleExperienceUpdate(expIndex, 'title', e.target.value)}
                                    placeholder="Job Title"
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-linkedin-500 focus:outline-none"
                                />
                                <input
                                    type="text"
                                    value={exp.company}
                                    onChange={(e) => handleExperienceUpdate(expIndex, 'company', e.target.value)}
                                    placeholder="Company"
                                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-linkedin-500 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                {exp.bullets.map((bullet, bulletIndex) => (
                                    <input
                                        key={bulletIndex}
                                        type="text"
                                        value={bullet}
                                        onChange={(e) => handleBulletUpdate(expIndex, bulletIndex, e.target.value)}
                                        placeholder="• Achieved X by doing Y, resulting in Z"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-linkedin-500 focus:outline-none"
                                    />
                                ))}
                                <button
                                    onClick={() => handleAddBullet(expIndex)}
                                    className="text-xs text-gray-500 hover:text-gray-400"
                                >
                                    + Add bullet point
                                </button>
                            </div>
                        </div>
                    ))}

                    {profile.experiences.length === 0 && (
                        <div className="text-center py-8 border border-dashed border-white/20 rounded-xl">
                            <Briefcase className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No experience added yet</p>
                        </div>
                    )}
                </div>

                {/* Skills */}
                <div>
                    <label className="text-sm text-gray-400 mb-2 block">Skills</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {profile.skills.map(skill => (
                            <span
                                key={skill}
                                className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-2"
                            >
                                {skill}
                                <button onClick={() => handleSkillRemove(skill)}>
                                    <X className="w-3 h-3 text-gray-400 hover:text-white" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Type a skill and press Enter..."
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSkillAdd(e.target.value);
                                e.target.value = '';
                            }
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:border-linkedin-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Analyze Button */}
            <button
                onClick={onAnalyze}
                disabled={!isProfileComplete || isLoading}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${isProfileComplete && !isLoading
                        ? 'bg-gradient-to-r from-linkedin-500 to-linkedin-400 hover:from-linkedin-600 hover:to-linkedin-500 shadow-lg shadow-linkedin-500/25'
                        : 'bg-gray-700 cursor-not-allowed opacity-50'
                    }`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Analyzing Profile...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-6 h-6" />
                        Analyze My Profile
                        <ArrowRight className="w-6 h-6" />
                    </>
                )}
            </button>

            {/* Info text */}
            <p className="text-center text-gray-500 text-sm mt-4">
                100% free • No data stored • Instant results
            </p>
        </div>
    );
}
