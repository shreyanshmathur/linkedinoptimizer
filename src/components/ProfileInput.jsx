import React, { useState } from 'react';
import {
    Target, Briefcase, Sparkles, ChevronDown, Plus, X,
    FileText, ArrowRight, Loader2, User, GraduationCap,
    Award, Heart, MessageSquare, Star, Globe, Link, Camera
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

const TABS = [
    { id: 'basics', label: 'Basics', icon: User },
    { id: 'about', label: 'About', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills & Certs', icon: Award },
    { id: 'more', label: 'More', icon: Star }
];

export default function ProfileInput({
    profile, setProfile,
    jobKeywords, setJobKeywords,
    targetRoles, setTargetRoles,
    industry, setIndustry,
    careerLevel, setCareerLevel,
    onAnalyze, isLoading
}) {
    const [activeTab, setActiveTab] = useState('basics');
    const [newKeyword, setNewKeyword] = useState('');
    const [newRole, setNewRole] = useState('');
    const [newSkill, setNewSkill] = useState('');

    // Helper functions
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

    const handleSkillAdd = () => {
        if (newSkill && !profile.skills.includes(newSkill)) {
            setProfile({ ...profile, skills: [...profile.skills, newSkill] });
            setNewSkill('');
        }
    };

    const handleSkillRemove = (skill) => {
        setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
    };

    // Experience handlers
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

    // Education handlers
    const handleEducationAdd = () => {
        setProfile({
            ...profile,
            education: [
                ...profile.education,
                { school: '', degree: '', field: '', year: '', gpa: '', coursework: [] }
            ]
        });
    };

    const handleEducationUpdate = (index, field, value) => {
        const updated = [...profile.education];
        updated[index] = { ...updated[index], [field]: value };
        setProfile({ ...profile, education: updated });
    };

    // Certification handlers
    const handleCertAdd = () => {
        const certs = profile.certifications || [];
        setProfile({
            ...profile,
            certifications: [...certs, { name: '', issuer: '', date: '' }]
        });
    };

    const handleCertUpdate = (index, field, value) => {
        const updated = [...(profile.certifications || [])];
        updated[index] = { ...updated[index], [field]: value };
        setProfile({ ...profile, certifications: updated });
    };

    // Volunteering handlers
    const handleVolunteerAdd = () => {
        const vol = profile.volunteering || [];
        setProfile({
            ...profile,
            volunteering: [...vol, { org: '', role: '', description: '' }]
        });
    };

    const handleVolunteerUpdate = (index, field, value) => {
        const updated = [...(profile.volunteering || [])];
        updated[index] = { ...updated[index], [field]: value };
        setProfile({ ...profile, volunteering: updated });
    };

    // Recommendations handlers
    const handleRecommendationAdd = () => {
        const recs = profile.recommendations || [];
        setProfile({
            ...profile,
            recommendations: [...recs, { name: '', relationship: '', text: '' }]
        });
    };

    const handleRecommendationUpdate = (index, field, value) => {
        const updated = [...(profile.recommendations || [])];
        updated[index] = { ...updated[index], [field]: value };
        setProfile({ ...profile, recommendations: updated });
    };

    const isProfileComplete = profile.headline || profile.about || profile.experiences?.length > 0 || profile.skills?.length > 0;

    // Calculate profile completeness
    const getCompleteness = () => {
        const checks = [
            { name: 'Headline', filled: !!profile.headline, weight: 15 },
            { name: 'About', filled: profile.about?.length > 100, weight: 15 },
            { name: 'Experience', filled: profile.experiences?.length > 0, weight: 25 },
            { name: 'Skills', filled: profile.skills?.length >= 5, weight: 12 },
            { name: 'Education', filled: profile.education?.length > 0, weight: 10 },
            { name: 'Photo', filled: !!profile.photoUrl, weight: 10 },
            { name: 'Certifications', filled: profile.certifications?.length > 0, weight: 8 },
            { name: 'Recommendations', filled: profile.recommendations?.length > 0, weight: 5 },
            { name: 'Featured', filled: profile.featured?.length > 0, weight: 5 },
            { name: 'Volunteering', filled: profile.volunteering?.length > 0, weight: 3 },
            { name: 'Contact', filled: !!profile.email || !!profile.linkedinUrl, weight: 2 }
        ];

        const filled = checks.filter(c => c.filled);
        const totalWeight = filled.reduce((sum, c) => sum + c.weight, 0);
        return { percent: totalWeight, filled: filled.length, total: checks.length, checks };
    };

    const completeness = getCompleteness();

    const inputClass = "w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 focus:border-linkedin-500 focus:outline-none text-gray-900 dark:text-white placeholder-gray-400";

    return (
        <div className="max-w-4xl mx-auto">
            {/* Profile Completeness Progress */}
            <div className="glass-card p-4 mb-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Profile Completeness</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${completeness.percent >= 80 ? 'bg-green-500/20 text-green-500' :
                                completeness.percent >= 50 ? 'bg-yellow-500/20 text-yellow-500' :
                                    'bg-red-500/20 text-red-500'
                            }`}>
                            {completeness.percent}%
                        </span>
                    </div>
                    <span className="text-xs text-gray-500">{completeness.filled}/{completeness.total} sections</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${completeness.percent >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                                completeness.percent >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                                    'bg-gradient-to-r from-red-500 to-pink-400'
                            }`}
                        style={{ width: `${completeness.percent}%` }}
                    />
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                    {completeness.checks.map(check => (
                        <span
                            key={check.name}
                            className={`text-xs px-2 py-0.5 rounded-full ${check.filled
                                    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                    : 'bg-gray-200 dark:bg-white/10 text-gray-500'
                                }`}
                        >
                            {check.filled ? '✓' : '○'} {check.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* Job Targeting */}
            <div className="glass-card p-6 mb-6 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Job Targeting</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tailor suggestions to your goals</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Target Roles</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {targetRoles.map(role => (
                                <span key={role} className="px-3 py-1 bg-linkedin-500/10 text-linkedin-600 dark:text-linkedin-400 rounded-full text-sm flex items-center gap-1">
                                    {role}
                                    <button onClick={() => setTargetRoles(targetRoles.filter(r => r !== role))}><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className={inputClass}>
                                <option value="">Select role...</option>
                                {COMMON_ROLES.filter(r => !targetRoles.includes(r)).map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                            <button onClick={handleAddRole} className="px-3 py-2 bg-linkedin-500 text-white rounded-lg"><Plus className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Industry</label>
                        <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass}>
                            {INDUSTRIES.map(ind => (<option key={ind} value={ind}>{ind}</option>))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Career Level</label>
                        <select value={careerLevel} onChange={(e) => setCareerLevel(e.target.value)} className={inputClass}>
                            {CAREER_LEVELS.map(level => (<option key={level.value} value={level.value}>{level.label}</option>))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Keywords</label>
                        <div className="flex flex-wrap gap-2 mb-2 max-h-16 overflow-y-auto">
                            {jobKeywords.map(kw => (
                                <span key={kw} className="px-2 py-0.5 bg-green-500/10 text-green-600 rounded text-xs flex items-center gap-1">
                                    {kw}<button onClick={() => setJobKeywords(jobKeywords.filter(k => k !== kw))}><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()} placeholder="Add keyword..." className={inputClass} />
                            <button onClick={handleAddKeyword} className="px-3 py-2 bg-green-500/10 text-green-600 rounded-lg"><Plus className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabbed Profile Input */}
            <div className="glass-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                {/* Tab Navigation */}
                <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-linkedin-500 text-white shadow-lg'
                                : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                    {/* BASICS TAB */}
                    {activeTab === 'basics' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Full Name</label>
                                    <input type="text" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="John Doe" className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Location</label>
                                    <input type="text" value={profile.location || ''} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="San Francisco, CA" className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex justify-between">
                                    <span>Headline</span>
                                    <span className={profile.headline?.length > 220 ? 'text-red-500' : 'text-gray-400'}>{profile.headline?.length || 0}/220</span>
                                </label>
                                <input type="text" value={profile.headline || ''} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} placeholder="Product Manager | Data Analytics Expert | 5+ Years B2B SaaS" className={inputClass} />
                                <p className="text-xs text-gray-500 mt-1">Include your role, expertise, and value proposition</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                                        <Camera className="w-4 h-4" /> Photo URL (optional)
                                    </label>
                                    <input type="url" value={profile.photoUrl || ''} onChange={(e) => setProfile({ ...profile, photoUrl: e.target.value })} placeholder="https://..." className={inputClass} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                                        <Link className="w-4 h-4" /> LinkedIn URL
                                    </label>
                                    <input type="url" value={profile.linkedinUrl || ''} onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })} placeholder="linkedin.com/in/yourname" className={inputClass} />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Email (for contact scoring)</label>
                                <input type="email" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="you@email.com" className={inputClass} />
                            </div>
                        </div>
                    )}

                    {/* ABOUT TAB */}
                    {activeTab === 'about' && (
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex justify-between">
                                <span>About / Summary</span>
                                <span className={profile.about?.length > 2600 ? 'text-red-500' : 'text-gray-400'}>{profile.about?.length || 0}/2600</span>
                            </label>
                            <textarea
                                value={profile.about || ''}
                                onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                                placeholder="I'm a passionate product manager with 5+ years of experience driving data-driven product strategy..."
                                rows={12}
                                className={inputClass + " resize-none"}
                            />
                            <p className="text-xs text-gray-500 mt-2">Tip: Use Problem → Solution → Results structure. Include 3+ quantified achievements.</p>
                        </div>
                    )}

                    {/* EXPERIENCE TAB */}
                    {activeTab === 'experience' && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Experience</label>
                                <button onClick={handleExperienceAdd} className="text-sm text-linkedin-600 hover:text-linkedin-700 flex items-center gap-1 font-medium">
                                    <Plus className="w-4 h-4" /> Add Role
                                </button>
                            </div>

                            {profile.experiences?.map((exp, expIndex) => (
                                <div key={expIndex} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-4">
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <input type="text" value={exp.title} onChange={(e) => handleExperienceUpdate(expIndex, 'title', e.target.value)} placeholder="Job Title" className={inputClass} />
                                        <input type="text" value={exp.company} onChange={(e) => handleExperienceUpdate(expIndex, 'company', e.target.value)} placeholder="Company" className={inputClass} />
                                    </div>
                                    <input type="text" value={exp.duration || ''} onChange={(e) => handleExperienceUpdate(expIndex, 'duration', e.target.value)} placeholder="Duration (e.g., Jan 2020 - Present)" className={inputClass + " mb-3"} />

                                    <div className="space-y-2">
                                        {exp.bullets?.map((bullet, bulletIndex) => (
                                            <input key={bulletIndex} type="text" value={bullet} onChange={(e) => handleBulletUpdate(expIndex, bulletIndex, e.target.value)} placeholder="• Achieved X by doing Y, resulting in Z" className={inputClass} />
                                        ))}
                                        <button onClick={() => handleAddBullet(expIndex)} className="text-xs text-gray-500 hover:text-gray-700">+ Add bullet</button>
                                    </div>
                                </div>
                            ))}

                            {(!profile.experiences || profile.experiences.length === 0) && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                                    <Briefcase className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">No experience added yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* EDUCATION TAB */}
                    {activeTab === 'education' && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Education</label>
                                <button onClick={handleEducationAdd} className="text-sm text-linkedin-600 hover:text-linkedin-700 flex items-center gap-1 font-medium">
                                    <Plus className="w-4 h-4" /> Add Education
                                </button>
                            </div>

                            {profile.education?.map((edu, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-4">
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <input type="text" value={edu.school} onChange={(e) => handleEducationUpdate(index, 'school', e.target.value)} placeholder="School/University" className={inputClass} />
                                        <input type="text" value={edu.degree} onChange={(e) => handleEducationUpdate(index, 'degree', e.target.value)} placeholder="Degree (e.g., Bachelor's)" className={inputClass} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <input type="text" value={edu.field || ''} onChange={(e) => handleEducationUpdate(index, 'field', e.target.value)} placeholder="Field of Study" className={inputClass} />
                                        <input type="text" value={edu.year || ''} onChange={(e) => handleEducationUpdate(index, 'year', e.target.value)} placeholder="Grad Year" className={inputClass} />
                                        <input type="text" value={edu.gpa || ''} onChange={(e) => handleEducationUpdate(index, 'gpa', e.target.value)} placeholder="GPA (optional)" className={inputClass} />
                                    </div>
                                </div>
                            ))}

                            {(!profile.education || profile.education.length === 0) && (
                                <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                                    <GraduationCap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">No education added yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SKILLS & CERTS TAB */}
                    {activeTab === 'skills' && (
                        <div className="space-y-6">
                            {/* Skills */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Skills ({profile.skills?.length || 0}/50 recommended: 15-20)</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {profile.skills?.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-full text-sm flex items-center gap-2">
                                            {skill}
                                            <button onClick={() => handleSkillRemove(skill)}><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSkillAdd()} placeholder="Type skill and press Enter..." className={inputClass} />
                                    <button onClick={handleSkillAdd} className="px-4 py-2 bg-linkedin-500 text-white rounded-lg"><Plus className="w-5 h-5" /></button>
                                </div>
                            </div>

                            {/* Certifications */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Licenses & Certifications</label>
                                    <button onClick={handleCertAdd} className="text-sm text-linkedin-600 hover:text-linkedin-700 flex items-center gap-1 font-medium">
                                        <Plus className="w-4 h-4" /> Add Certification
                                    </button>
                                </div>

                                {profile.certifications?.map((cert, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-3">
                                        <div className="grid grid-cols-3 gap-3">
                                            <input type="text" value={cert.name} onChange={(e) => handleCertUpdate(index, 'name', e.target.value)} placeholder="Certification Name" className={inputClass} />
                                            <input type="text" value={cert.issuer} onChange={(e) => handleCertUpdate(index, 'issuer', e.target.value)} placeholder="Issuing Organization" className={inputClass} />
                                            <input type="text" value={cert.date || ''} onChange={(e) => handleCertUpdate(index, 'date', e.target.value)} placeholder="Date (e.g., 2023)" className={inputClass} />
                                        </div>
                                    </div>
                                ))}

                                {(!profile.certifications || profile.certifications.length === 0) && (
                                    <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                                        <Award className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm">No certifications added</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* MORE TAB */}
                    {activeTab === 'more' && (
                        <div className="space-y-6">
                            {/* Volunteering */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-pink-500" /> Volunteering
                                    </label>
                                    <button onClick={handleVolunteerAdd} className="text-sm text-linkedin-600 hover:text-linkedin-700 flex items-center gap-1 font-medium">
                                        <Plus className="w-4 h-4" /> Add
                                    </button>
                                </div>

                                {profile.volunteering?.map((vol, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-3">
                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                            <input type="text" value={vol.org} onChange={(e) => handleVolunteerUpdate(index, 'org', e.target.value)} placeholder="Organization" className={inputClass} />
                                            <input type="text" value={vol.role} onChange={(e) => handleVolunteerUpdate(index, 'role', e.target.value)} placeholder="Role" className={inputClass} />
                                        </div>
                                        <textarea value={vol.description || ''} onChange={(e) => handleVolunteerUpdate(index, 'description', e.target.value)} placeholder="Description..." rows={2} className={inputClass + " resize-none"} />
                                    </div>
                                ))}
                            </div>

                            {/* Recommendations */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-blue-500" /> Recommendations Received
                                    </label>
                                    <button onClick={handleRecommendationAdd} className="text-sm text-linkedin-600 hover:text-linkedin-700 flex items-center gap-1 font-medium">
                                        <Plus className="w-4 h-4" /> Add
                                    </button>
                                </div>

                                {profile.recommendations?.map((rec, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-3">
                                        <div className="grid grid-cols-2 gap-3 mb-2">
                                            <input type="text" value={rec.name} onChange={(e) => handleRecommendationUpdate(index, 'name', e.target.value)} placeholder="Recommender Name" className={inputClass} />
                                            <select value={rec.relationship || ''} onChange={(e) => handleRecommendationUpdate(index, 'relationship', e.target.value)} className={inputClass}>
                                                <option value="">Relationship...</option>
                                                <option value="manager">Manager</option>
                                                <option value="colleague">Colleague</option>
                                                <option value="client">Client</option>
                                                <option value="report">Direct Report</option>
                                            </select>
                                        </div>
                                        <textarea value={rec.text || ''} onChange={(e) => handleRecommendationUpdate(index, 'text', e.target.value)} placeholder="Recommendation text..." rows={3} className={inputClass + " resize-none"} />
                                    </div>
                                ))}
                            </div>

                            {/* Featured */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500" /> Featured Content (URLs)
                                </label>
                                <textarea
                                    value={profile.featured?.join('\n') || ''}
                                    onChange={(e) => setProfile({ ...profile, featured: e.target.value.split('\n').filter(Boolean) })}
                                    placeholder="Paste URLs of articles, posts, or projects (one per line)..."
                                    rows={3}
                                    className={inputClass + " resize-none"}
                                />
                            </div>

                            {/* Interests */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-green-500" /> Interests (companies/influencers you follow)
                                </label>
                                <textarea
                                    value={profile.interests?.join(', ') || ''}
                                    onChange={(e) => setProfile({ ...profile, interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                    placeholder="Google, Microsoft, Simon Sinek, Harvard Business Review..."
                                    rows={2}
                                    className={inputClass + " resize-none"}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Analyze Button */}
            <button
                onClick={onAnalyze}
                disabled={!isProfileComplete || isLoading}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${isProfileComplete && !isLoading
                    ? 'bg-gradient-to-r from-linkedin-500 to-linkedin-400 hover:from-linkedin-600 hover:to-linkedin-500 shadow-lg shadow-linkedin-500/25 text-white transform hover:scale-[1.02]'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                    }`}
            >
                {isLoading ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing Profile...</>
                ) : (
                    <><Sparkles className="w-6 h-6" /> Analyze My Profile <ArrowRight className="w-6 h-6" /></>
                )}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
                100% free • No data stored • Instant results
            </p>
        </div>
    );
}
