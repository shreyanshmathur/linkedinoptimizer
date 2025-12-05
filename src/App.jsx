import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
    Sparkles, Target, TrendingUp, Award, Zap, ChevronRight,
    User, FileText, Briefcase, GraduationCap, Camera, Code,
    CheckCircle, AlertCircle, ArrowUp, RefreshCw, FileDown, BarChart3,
    Heart, MessageSquare, LayoutGrid, Upload, LogOut, Crown
} from 'lucide-react';

// Auth
import { useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import PaywallModal from './components/payments/PaywallModal';

// Theme
import ThemeToggle from './components/ThemeToggle';

// Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';

// Import components
import ScoreRing from './components/ScoreRing';
import SectionCard from './components/SectionCard';
import RecruiterHeatmap from './components/RecruiterHeatmap';
import GamificationPanel from './components/GamificationPanel';
import ProfileInput from './components/ProfileInput';
import FileUpload from './components/upload/FileUpload';

// Section optimizers
import HeadlineOptimizer from './components/sections/HeadlineOptimizer';
import AboutOptimizer from './components/sections/AboutOptimizer';
import ExperienceOptimizer from './components/sections/ExperienceOptimizer';
import SkillsOptimizer from './components/sections/SkillsOptimizer';
import EducationOptimizer from './components/sections/EducationOptimizer';
import LicensesOptimizer from './components/sections/LicensesOptimizer';
import VolunteeringOptimizer from './components/sections/VolunteeringOptimizer';
import RecommendationsPanel from './components/sections/RecommendationsPanel';
import CustomSectionEditor from './components/sections/CustomSectionEditor';

// Tools
import AISuggestionCards from './components/AISuggestionCards';
import ResumeExport from './components/ResumeExport';
import ResumeEditor from './components/ResumeEditor';
import JobTracker from './components/JobTracker';
import PhotoAnalyzer from './components/PhotoAnalyzer';
import IndustryBenchmark from './components/IndustryBenchmark';

// Import utilities
import {
    scoreHeadline, scoreAbout, scoreExperience, scoreSkills,
    scoreEducation, scoreCertifications, scoreVolunteering,
    scoreRecommendations, scoreFeatured, scoreInterests, scoreContactInfo,
    calculateOverallScore, getScoreColor, getScoreLabel, getPercentile, getTier,
    getBenchmarkAnalysis, getCompetitiveAnalysis, getImprovementPriorities
} from './utils/scoringEngine';
import {
    loadGamificationState, saveGamificationState,
    calculateLevel, calculateLevelProgress, checkAchievements,
    getScoreXPReward, getTodayChallenge, getLevelTitle, getLevelColor
} from './utils/gamification';

// Protected Route Component
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
                <div className="w-8 h-8 border-2 border-linkedin-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Main Dashboard Component
function Dashboard() {
    const { user, userData, logout, canAnalyze, canExport, incrementAnalysisCount, incrementExportCount, getRemainingUses } = useAuth();

    // Profile data state
    const [profile, setProfile] = useState({
        name: user?.displayName || '',
        headline: '',
        about: '',
        experiences: [],
        skills: [],
        education: [],
        licenses: [],
        volunteering: [],
        recommendations: [],
        customSections: [],
        photo: null,
        // NEW fields for 12-section scoring
        location: '',
        photoUrl: '',
        linkedinUrl: '',
        email: '',
        certifications: [],
        featured: [],
        interests: []
    });

    // Scoring state with all 12 sections
    const [scores, setScores] = useState({
        headline: 0,
        about: 0,
        experience: 0,
        skills: 0,
        education: 0,
        certifications: 0,
        volunteering: 0,
        recommendations: 0,
        featured: 0,
        interests: 0,
        contactInfo: 0,
        photo: 0,
        overall: 0
    });

    const [sectionDetails, setSectionDetails] = useState({});

    // UI state
    const [activeSection, setActiveSection] = useState('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [paywallType, setPaywallType] = useState('analysis');

    // Job targeting
    const [jobKeywords, setJobKeywords] = useState([]);
    const [targetRoles, setTargetRoles] = useState(['Product Manager']);
    const [industry, setIndustry] = useState('Technology');
    const [careerLevel, setCareerLevel] = useState('mid');

    // Gamification state
    const [gamification, setGamification] = useState(loadGamificationState());
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newAchievements, setNewAchievements] = useState([]);

    // Calculate scores
    const calculateScores = useCallback(() => {
        const headlineResult = scoreHeadline(profile.headline, jobKeywords);
        const aboutResult = scoreAbout(profile.about, jobKeywords);
        const experienceResult = scoreExperience(profile.experiences, jobKeywords);
        const skillsResult = scoreSkills(profile.skills, jobKeywords);
        const educationResult = scoreEducation(profile.education, careerLevel);

        const sectionScores = {
            headline: headlineResult.score,
            about: aboutResult.score,
            experience: experienceResult.score,
            skills: skillsResult.score,
            education: educationResult.score,
            photo: profile.photo ? 70 : 0
        };

        const overall = calculateOverallScore(sectionScores);

        setScores({ ...sectionScores, overall });
        setSectionDetails({
            headline: headlineResult,
            about: aboutResult,
            experience: experienceResult,
            skills: skillsResult,
            education: educationResult
        });
    }, [profile, jobKeywords, careerLevel]);

    // Handle file upload
    const handleFilesProcessed = (parsedProfile, rawText) => {
        setProfile(prev => ({
            ...prev,
            ...parsedProfile,
            name: parsedProfile.name || prev.name
        }));
        setShowUpload(false);
    };

    // Handle initial analysis
    const handleAnalyze = async () => {
        console.log('handleAnalyze called');

        // Check if can analyze
        if (!canAnalyze()) {
            console.log('Cannot analyze - showing paywall');
            setPaywallType('analysis');
            setShowPaywall(true);
            return;
        }

        setIsLoading(true);

        try {
            // Small delay for UI feedback
            await new Promise(resolve => setTimeout(resolve, 500));

            // Calculate scores synchronously for all 12 sections
            const headlineResult = scoreHeadline(profile.headline, jobKeywords);
            const aboutResult = scoreAbout(profile.about, jobKeywords);
            const experienceResult = scoreExperience(profile.experiences, jobKeywords);
            const skillsResult = scoreSkills(profile.skills, jobKeywords);
            const educationResult = scoreEducation(profile.education, careerLevel);
            const certsResult = scoreCertifications(profile.certifications, industry);
            const volunteerResult = scoreVolunteering(profile.volunteering);
            const recsResult = scoreRecommendations(profile.recommendations);
            const featuredResult = scoreFeatured(profile.featured);
            const interestsResult = scoreInterests(profile.interests, industry);
            const contactResult = scoreContactInfo(profile);

            const sectionScores = {
                headline: headlineResult.score,
                about: aboutResult.score,
                experience: experienceResult.score,
                skills: skillsResult.score,
                education: educationResult.score,
                certifications: certsResult.score,
                volunteering: volunteerResult.score,
                recommendations: recsResult.score,
                featured: featuredResult.score,
                interests: interestsResult.score,
                contactInfo: contactResult.score,
                photo: profile.photoUrl ? 70 : 0
            };

            const overall = calculateOverallScore(sectionScores, careerLevel, industry);

            console.log('Scores calculated:', { sectionScores, overall });

            // Update state
            setScores({ ...sectionScores, overall });
            setSectionDetails({
                headline: headlineResult,
                about: aboutResult,
                experience: experienceResult,
                skills: skillsResult,
                education: educationResult,
                certifications: certsResult,
                volunteering: volunteerResult,
                recommendations: recsResult,
                featured: featuredResult,
                interests: interestsResult,
                contactInfo: contactResult
            });

            // Increment usage (but don't fail if this errors)
            try {
                await incrementAnalysisCount();
            } catch (e) {
                console.error('Failed to increment analysis count:', e);
            }

            // Add XP
            const prevLevel = calculateLevel(gamification.xp);
            const xpReward = getScoreXPReward(overall);
            const newXP = gamification.xp + xpReward + (hasAnalyzed ? 0 : 50);
            const newLevel = calculateLevel(newXP);

            const newAchievementsList = checkAchievements(gamification, {
                score: overall,
                isFirstAnalysis: !hasAnalyzed
            });

            const newGamification = {
                ...gamification,
                xp: newXP,
                level: newLevel,
                achievements: [...new Set([...gamification.achievements, ...newAchievementsList.map(a => a.id)])]
            };

            if (newLevel > prevLevel) {
                setShowLevelUp(true);
                setTimeout(() => setShowLevelUp(false), 3000);
            }

            if (newAchievementsList.length > 0) {
                setNewAchievements(newAchievementsList);
                setTimeout(() => setNewAchievements([]), 5000);
            }

            setGamification(newGamification);
            saveGamificationState(newGamification);

            console.log('Analysis complete, setting hasAnalyzed=true');
        } catch (error) {
            console.error('Error during analysis:', error);
        } finally {
            // Always set these, even on error
            setHasAnalyzed(true);
            setIsLoading(false);
        }
    };

    // Handle export with paywall check
    const handleExport = () => {
        if (!canExport()) {
            setPaywallType('export');
            setShowPaywall(true);
            return false;
        }
        incrementExportCount();
        return true;
    };

    // Handle section updates
    const updateSection = (section, value) => {
        setProfile(prev => ({ ...prev, [section]: value }));
    };

    // All 12 section config
    const sections = [
        { id: 'headline', name: 'Headline', icon: User, weight: '15%' },
        { id: 'about', name: 'About', icon: FileText, weight: '15%' },
        { id: 'experience', name: 'Experience', icon: Briefcase, weight: '25%' },
        { id: 'skills', name: 'Skills', icon: Code, weight: '12%' },
        { id: 'education', name: 'Education', icon: GraduationCap, weight: '10%' },
        { id: 'certifications', name: 'Certifications', icon: Award, weight: '8%' },
        { id: 'volunteering', name: 'Volunteering', icon: Heart, weight: '3%' },
        { id: 'recommendations', name: 'Recommendations', icon: MessageSquare, weight: '5%' },
        { id: 'featured', name: 'Featured', icon: LayoutGrid, weight: '5%' },
        { id: 'interests', name: 'Interests', icon: Target, weight: '2%' },
        { id: 'contactInfo', name: 'Contact Info', icon: User, weight: '2%' },
        { id: 'photo', name: 'Photo', icon: Camera, weight: '10%' }
    ];

    const remainingUses = getRemainingUses();

    // If not analyzed yet, show input form
    if (!hasAnalyzed) {
        return (
            <div className="min-h-screen transition-colors duration-300">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0 border-b border-white/10">
                    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-linkedin-500 to-linkedin-400 flex items-center justify-center shadow-lg shadow-linkedin-500/30">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl gradient-text">LinkedIn Optimizer</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Unlock Pro Button */}
                            {userData?.subscription === 'free' && (
                                <button
                                    onClick={() => {
                                        setPaywallType('upgrade');
                                        setShowPaywall(true);
                                    }}
                                    className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 hover:border-yellow-400 transition-all group"
                                >
                                    <Crown className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-semibold text-yellow-500">Unlock Pro</span>
                                </button>
                            )}

                            <ThemeToggle />

                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/10">
                                <img
                                    src={user?.photoURL || 'https://via.placeholder.com/32'}
                                    alt=""
                                    className="w-9 h-9 rounded-full border-2 border-white/20"
                                />
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-6 py-8 pt-28 relative z-10">
                    {/* Background Elements */}
                    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-linkedin-500/20 rounded-full blur-3xl animate-blob" />
                        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
                        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
                    </div>

                    {/* Upload Option */}
                    {showUpload ? (
                        <div className="max-w-2xl mx-auto animate-fade-in-up">
                            <button
                                onClick={() => setShowUpload(false)}
                                className="mb-4 text-gray-500 dark:text-gray-400 hover:text-linkedin-500 transition-colors flex items-center gap-2"
                            >
                                ← Back to manual input
                            </button>
                            <FileUpload onFilesProcessed={handleFilesProcessed} />
                        </div>
                    ) : (
                        <>
                            {/* Hero Section */}
                            <div className="text-center mb-12 animate-fade-in-up">
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                                    Optimize Your LinkedIn Profile <br />
                                    <span className="gradient-text">Get 3x More Interviews</span>
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                    AI-powered analysis to rank in the top 1% of recruiters' search results.
                                </p>
                            </div>

                            {/* Upload toggle */}
                            <div className="max-w-4xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                                <button
                                    onClick={() => setShowUpload(true)}
                                    className="w-full glass-card p-6 flex items-center justify-center gap-4 group border-2 border-dashed border-gray-300 dark:border-white/20 hover:border-linkedin-500 dark:hover:border-linkedin-400"
                                >
                                    <div className="p-3 rounded-full bg-linkedin-500/10 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6 text-linkedin-500" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-900 dark:text-white">Upload PDF Resume or Screenshots</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">We'll extract your info automatically</div>
                                    </div>
                                </button>
                            </div>

                            <ProfileInput
                                profile={profile}
                                setProfile={setProfile}
                                jobKeywords={jobKeywords}
                                setJobKeywords={setJobKeywords}
                                targetRoles={targetRoles}
                                setTargetRoles={setTargetRoles}
                                industry={industry}
                                setIndustry={setIndustry}
                                careerLevel={careerLevel}
                                setCareerLevel={setCareerLevel}
                                onAnalyze={handleAnalyze}
                                isLoading={isLoading}
                            />
                        </>
                    )}
                </main>

                {/* Paywall Modal */}
                <PaywallModal
                    isOpen={showPaywall}
                    onClose={() => setShowPaywall(false)}
                    type={paywallType}
                />
            </div>
        );
    }

    // Main dashboard view
    return (
        <div className="min-h-screen transition-colors duration-300">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0 border-b border-white/10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-linkedin-500 to-linkedin-400 flex items-center justify-center shadow-lg shadow-linkedin-500/30">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl gradient-text">LinkedIn Optimizer</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setHasAnalyzed(false);
                                setActiveSection('overview');
                            }}
                            className="hidden md:block text-sm text-gray-500 dark:text-gray-400 hover:text-linkedin-500 transition-colors"
                        >
                            New Analysis
                        </button>

                        {/* Unlock Pro Button */}
                        {userData?.subscription === 'free' ? (
                            <button
                                onClick={() => {
                                    setPaywallType('upgrade');
                                    setShowPaywall(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 hover:border-yellow-400 transition-all group"
                            >
                                <Crown className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-semibold text-yellow-500">Unlock Pro</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-1 text-yellow-500 font-semibold text-sm px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                                <Crown className="w-4 h-4" />
                                Pro Member
                            </div>
                        )}

                        <ThemeToggle />

                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/10">
                            <img
                                src={user?.photoURL || 'https://via.placeholder.com/32'}
                                alt=""
                                className="w-9 h-9 rounded-full border-2 border-white/20"
                            />
                            <button
                                onClick={logout}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 pt-28 relative z-10">
                {/* Background Elements */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-linkedin-500/10 rounded-full blur-[100px] animate-pulse-glow" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Left sidebar */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                        {/* Score overview */}
                        <div className="glass-card p-6 text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-linkedin-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center justify-center mb-4 relative z-10">
                                <ScoreRing score={scores.overall} size={160} />
                            </div>
                            <div className="relative z-10">
                                <div className={`text-2xl font-bold mb-1 ${getScoreColor(scores.overall)}`}>
                                    {getScoreLabel(scores.overall)}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Top {getPercentile(scores.overall)}% of profiles
                                </div>
                            </div>
                        </div>

                        {/* Section scores */}
                        <div className="glass-card p-4 space-y-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-2">Profile Sections</h3>
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeSection === section.id
                                        ? 'bg-linkedin-500/10 border border-linkedin-500/20 text-linkedin-600 dark:text-linkedin-400'
                                        : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300'
                                        }`}
                                >
                                    <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-linkedin-500' : 'text-gray-400'}`} />
                                    <span className="flex-1 text-left text-sm font-medium">{section.name}</span>
                                    <span className={`text-sm font-bold ${getScoreColor(scores[section.id] || 0)}`}>
                                        {scores[section.id] || 0}
                                    </span>
                                    <ChevronRight className={`w-4 h-4 ${activeSection === section.id ? 'text-linkedin-500' : 'text-gray-300 dark:text-gray-600'}`} />
                                </button>
                            ))}
                        </div>

                        {/* Heatmap toggle */}
                        <button
                            onClick={() => setShowHeatmap(!showHeatmap)}
                            className={`w-full glass-card p-4 flex items-center gap-3 transition-all ${showHeatmap ? 'ring-2 ring-linkedin-500' : ''}`}
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left flex-1">
                                <div className="font-semibold text-gray-900 dark:text-white">Recruiter Heatmap</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Eye-tracking visualization</div>
                            </div>
                        </button>

                        {/* Tools */}
                        <div className="glass-card p-4 space-y-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-2">Power Tools</h3>
                            <button
                                onClick={() => setActiveSection('jobtracker')}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeSection === 'jobtracker' ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
                            >
                                <Briefcase className="w-5 h-5 text-blue-500" />
                                <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Job Tracker</span>
                            </button>
                            <button
                                onClick={() => setActiveSection('resume')}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeSection === 'resume' ? 'bg-green-500/10 border border-green-500/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
                            >
                                <FileDown className="w-5 h-5 text-green-500" />
                                <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Resume Editor</span>
                            </button>
                            <button
                                onClick={() => setActiveSection('benchmark')}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeSection === 'benchmark' ? 'bg-purple-500/10 border border-purple-500/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
                            >
                                <BarChart3 className="w-5 h-5 text-purple-500" />
                                <span className="flex-1 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Industry Benchmark</span>
                            </button>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="col-span-12 lg:col-span-6 space-y-6">
                        {showHeatmap ? (
                            <RecruiterHeatmap profile={profile} scores={scores} />
                        ) : activeSection === 'overview' ? (
                            <>
                                {sections.slice(0, 6).map((section) => (
                                    <SectionCard
                                        key={section.id}
                                        section={section}
                                        score={scores[section.id]}
                                        details={sectionDetails[section.id]}
                                        onClick={() => setActiveSection(section.id)}
                                    />
                                ))}
                            </>
                        ) : activeSection === 'headline' ? (
                            <HeadlineOptimizer
                                headline={profile.headline}
                                setHeadline={(h) => updateSection('headline', h)}
                                score={scores.headline}
                                details={sectionDetails.headline}
                                jobKeywords={jobKeywords}
                                targetRoles={targetRoles}
                                industry={industry}
                                careerLevel={careerLevel}
                                onScoreUpdate={calculateScores}
                            />
                        ) : activeSection === 'about' ? (
                            <AboutOptimizer
                                about={profile.about}
                                setAbout={(a) => updateSection('about', a)}
                                score={scores.about}
                                details={sectionDetails.about}
                                jobKeywords={jobKeywords}
                                targetRoles={targetRoles}
                                careerLevel={careerLevel}
                                onScoreUpdate={calculateScores}
                            />
                        ) : activeSection === 'experience' ? (
                            <ExperienceOptimizer
                                experiences={profile.experiences}
                                setExperiences={(e) => updateSection('experiences', e)}
                                score={scores.experience}
                                details={sectionDetails.experience}
                                jobKeywords={jobKeywords}
                                onScoreUpdate={calculateScores}
                            />
                        ) : activeSection === 'skills' ? (
                            <SkillsOptimizer
                                skills={profile.skills}
                                setSkills={(s) => updateSection('skills', s)}
                                score={scores.skills}
                                details={sectionDetails.skills}
                                jobKeywords={jobKeywords}
                                targetRoles={targetRoles}
                                industry={industry}
                                onScoreUpdate={calculateScores}
                            />
                        ) : activeSection === 'education' ? (
                            <EducationOptimizer
                                education={profile.education}
                                setEducation={(e) => updateSection('education', e)}
                                score={scores.education}
                                details={sectionDetails.education}
                                careerLevel={careerLevel}
                                onScoreUpdate={calculateScores}
                            />
                        ) : activeSection === 'licenses' ? (
                            <LicensesOptimizer
                                licenses={profile.licenses}
                                setLicenses={(l) => updateSection('licenses', l)}
                                score={70}
                                onScoreUpdate={calculateScores}
                            />
                        ) : activeSection === 'volunteering' ? (
                            <VolunteeringOptimizer
                                volunteering={profile.volunteering}
                                setVolunteering={(v) => updateSection('volunteering', v)}
                                score={70}
                                onScoreUpdate={calculateScores}
                            />
                        ) : activeSection === 'recommendations' ? (
                            <RecommendationsPanel
                                recommendations={profile.recommendations}
                                setRecommendations={(r) => updateSection('recommendations', r)}
                                score={70}
                                onScoreUpdate={calculateScores}
                            />
                        ) : activeSection === 'custom' ? (
                            <CustomSectionEditor
                                customSections={profile.customSections}
                                setCustomSections={(c) => updateSection('customSections', c)}
                                onScoreUpdate={calculateScores}
                            />
                        ) : activeSection === 'photo' ? (
                            <PhotoAnalyzer
                                profile={profile}
                                setProfile={setProfile}
                                onScoreUpdate={calculateScores}
                            />
                        ) : activeSection === 'jobtracker' ? (
                            <JobTracker
                                profile={profile}
                                jobKeywords={jobKeywords}
                                setJobKeywords={setJobKeywords}
                            />
                        ) : activeSection === 'resume' ? (
                            <ResumeEditor
                                profile={profile}
                                scores={scores}
                            />
                        ) : activeSection === 'benchmark' ? (
                            <IndustryBenchmark
                                scores={scores}
                                profile={profile}
                                industry={industry}
                                careerLevel={careerLevel}
                            />
                        ) : (
                            <div className="glass-card p-6">
                                <h2 className="text-xl font-bold mb-4">
                                    {sections.find(s => s.id === activeSection)?.name}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">Coming soon...</p>
                            </div>
                        )}
                    </div>

                    {/* Right sidebar */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                        <GamificationPanel
                            gamification={gamification}
                            scores={scores}
                        />

                        {/* Quick actions */}
                        <div className="glass-card p-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-2">Quick Actions</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveSection('headline')}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-linkedin-600/10 to-linkedin-500/10 hover:from-linkedin-600/20 hover:to-linkedin-500/20 border border-linkedin-500/10 transition-all"
                                >
                                    <Sparkles className="w-5 h-5 text-linkedin-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Optimize Headline</span>
                                </button>
                                <button
                                    onClick={() => setActiveSection('resume')}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                                >
                                    <FileDown className="w-5 h-5 text-green-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Export Resume</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Paywall Modal */}
            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                type={paywallType}
            />

            {/* Level up animation */}
            {showLevelUp && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="text-center animate-bounce">
                        <div className="text-6xl mb-4">🎉</div>
                        <div className="text-3xl font-bold gradient-text">Level Up!</div>
                        <div className="text-xl text-white">Level {gamification.level}</div>
                    </div>
                </div>
            )}

            {/* Achievement popup */}
            {newAchievements.length > 0 && (
                <div className="fixed bottom-4 right-4 z-50 space-y-2">
                    {newAchievements.map((achievement, i) => (
                        <div
                            key={achievement.id}
                            className="glass-card p-4 flex items-center gap-3 animate-fade-in-up border-l-4 border-yellow-400"
                            style={{ animationDelay: `${i * 200}ms` }}
                        >
                            <span className="text-3xl">{achievement.icon}</span>
                            <div>
                                <div className="font-bold text-yellow-500">Achievement Unlocked!</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">{achievement.name}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Main App with Routing
function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
