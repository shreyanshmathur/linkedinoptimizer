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
    scoreEducation, calculateOverallScore, getScoreColor, getScoreLabel, getPercentile
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        photo: null
    });

    // Scoring state
    const [scores, setScores] = useState({
        headline: 0,
        about: 0,
        experience: 0,
        skills: 0,
        education: 0,
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

            // Calculate scores synchronously
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

            console.log('Scores calculated:', { sectionScores, overall });

            // Update state
            setScores({ ...sectionScores, overall });
            setSectionDetails({
                headline: headlineResult,
                about: aboutResult,
                experience: experienceResult,
                skills: skillsResult,
                education: educationResult
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

    // Section config
    const sections = [
        { id: 'headline', name: 'Headline', icon: User, maxChars: 220 },
        { id: 'about', name: 'About', icon: FileText, maxChars: 2600 },
        { id: 'experience', name: 'Experience', icon: Briefcase },
        { id: 'skills', name: 'Skills', icon: Code },
        { id: 'education', name: 'Education', icon: GraduationCap },
        { id: 'licenses', name: 'Licenses', icon: Award },
        { id: 'volunteering', name: 'Volunteering', icon: Heart },
        { id: 'recommendations', name: 'Recommendations', icon: MessageSquare },
        { id: 'custom', name: 'Custom Sections', icon: LayoutGrid },
        { id: 'photo', name: 'Photo', icon: Camera }
    ];

    const remainingUses = getRemainingUses();

    // If not analyzed yet, show input form
    if (!hasAnalyzed) {
        return (
            <div className="min-h-screen text-white">
                {/* Header */}
                <header className="glass border-b border-white/10">
                    <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-linkedin-500 to-linkedin-400 flex items-center justify-center">
                                <Target className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl gradient-text">LinkedIn Optimizer</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Remaining uses */}
                            {userData?.subscription === 'free' && (
                                <div className="text-sm text-gray-400">
                                    {remainingUses.analyses} analyses left
                                </div>
                            )}
                            {userData?.subscription !== 'free' && (
                                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                    <Crown className="w-4 h-4" />
                                    Pro
                                </div>
                            )}
                            <img
                                src={user?.photoURL || 'https://via.placeholder.com/32'}
                                alt=""
                                className="w-8 h-8 rounded-full"
                            />
                            <button
                                onClick={logout}
                                className="p-2 rounded-lg hover:bg-white/10"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-6 py-8">
                    {/* Upload Option */}
                    {showUpload ? (
                        <div className="max-w-2xl mx-auto">
                            <button
                                onClick={() => setShowUpload(false)}
                                className="mb-4 text-gray-400 hover:text-white"
                            >
                                ← Back to manual input
                            </button>
                            <FileUpload onFilesProcessed={handleFilesProcessed} />
                        </div>
                    ) : (
                        <>
                            {/* Upload toggle */}
                            <div className="max-w-4xl mx-auto mb-8">
                                <button
                                    onClick={() => setShowUpload(true)}
                                    className="w-full glass rounded-xl p-4 flex items-center justify-center gap-3 hover:bg-white/10 transition-colors border-2 border-dashed border-white/20"
                                >
                                    <Upload className="w-5 h-5 text-purple-400" />
                                    <span>Upload PDF or Screenshots instead</span>
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
        <div className="min-h-screen text-white">
            {/* Header */}
            <header className="glass border-b border-white/10">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-linkedin-500 to-linkedin-400 flex items-center justify-center">
                            <Target className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl gradient-text">LinkedIn Optimizer</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setHasAnalyzed(false);
                                setActiveSection('overview');
                            }}
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            New Analysis
                        </button>
                        {userData?.subscription !== 'free' && (
                            <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                <Crown className="w-4 h-4" />
                                Pro
                            </div>
                        )}
                        <img
                            src={user?.photoURL || 'https://via.placeholder.com/32'}
                            alt=""
                            className="w-8 h-8 rounded-full"
                        />
                        <button
                            onClick={logout}
                            className="p-2 rounded-lg hover:bg-white/10"
                        >
                            <LogOut className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-12 gap-6">
                    {/* Left sidebar */}
                    <div className="col-span-12 lg:col-span-3 space-y-6">
                        {/* Score overview */}
                        <div className="glass rounded-2xl p-6">
                            <div className="flex items-center justify-center mb-4">
                                <ScoreRing score={scores.overall} size={160} />
                            </div>
                            <div className="text-center">
                                <div className={`text-lg font-bold ${getScoreColor(scores.overall)}`}>
                                    {getScoreLabel(scores.overall)}
                                </div>
                                <div className="text-sm text-gray-400">
                                    Top {getPercentile(scores.overall)}% of profiles
                                </div>
                            </div>
                        </div>

                        {/* Section scores */}
                        <div className="glass rounded-2xl p-4 space-y-2">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">Section Scores</h3>
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeSection === section.id
                                        ? 'tab-active'
                                        : 'hover:bg-white/5'
                                        }`}
                                >
                                    <section.icon className="w-5 h-5 text-gray-400" />
                                    <span className="flex-1 text-left text-sm">{section.name}</span>
                                    <span className={`text-sm font-bold ${getScoreColor(scores[section.id] || 0)}`}>
                                        {scores[section.id] || 0}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                </button>
                            ))}
                        </div>

                        {/* Heatmap toggle */}
                        <button
                            onClick={() => setShowHeatmap(!showHeatmap)}
                            className={`w-full glass rounded-xl p-4 flex items-center gap-3 transition-all ${showHeatmap ? 'border-2 border-linkedin-500' : ''}`}
                        >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                                <Target className="w-5 h-5" />
                            </div>
                            <div className="text-left flex-1">
                                <div className="font-semibold">Recruiter Heatmap</div>
                                <div className="text-xs text-gray-400">Eye-tracking visualization</div>
                            </div>
                        </button>

                        {/* Tools */}
                        <div className="glass rounded-2xl p-4 space-y-2">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">Tools</h3>
                            <button
                                onClick={() => setActiveSection('jobtracker')}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeSection === 'jobtracker' ? 'tab-active' : 'hover:bg-white/5'}`}
                            >
                                <Briefcase className="w-5 h-5 text-blue-400" />
                                <span className="flex-1 text-left text-sm">Job Tracker</span>
                            </button>
                            <button
                                onClick={() => setActiveSection('resume')}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeSection === 'resume' ? 'tab-active' : 'hover:bg-white/5'}`}
                            >
                                <FileDown className="w-5 h-5 text-green-400" />
                                <span className="flex-1 text-left text-sm">Resume Editor</span>
                            </button>
                            <button
                                onClick={() => setActiveSection('benchmark')}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeSection === 'benchmark' ? 'tab-active' : 'hover:bg-white/5'}`}
                            >
                                <BarChart3 className="w-5 h-5 text-purple-400" />
                                <span className="flex-1 text-left text-sm">Industry Benchmark</span>
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
                            <div className="glass rounded-2xl p-6">
                                <h2 className="text-xl font-bold mb-4">
                                    {sections.find(s => s.id === activeSection)?.name}
                                </h2>
                                <p className="text-gray-400">Coming soon...</p>
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
                        <div className="glass rounded-2xl p-4">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">Quick Actions</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveSection('headline')}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-linkedin-600/20 to-linkedin-500/20 hover:from-linkedin-600/30 hover:to-linkedin-500/30 transition-all"
                                >
                                    <Sparkles className="w-5 h-5 text-linkedin-400" />
                                    <span className="text-sm">Optimize Headline</span>
                                </button>
                                <button
                                    onClick={() => setActiveSection('resume')}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                                >
                                    <FileDown className="w-5 h-5 text-green-400" />
                                    <span className="text-sm">Export Resume</span>
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
                        <div className="text-xl">Level {gamification.level}</div>
                    </div>
                </div>
            )}

            {/* Achievement popup */}
            {newAchievements.length > 0 && (
                <div className="fixed bottom-4 right-4 z-50 space-y-2">
                    {newAchievements.map((achievement, i) => (
                        <div
                            key={achievement.id}
                            className="glass rounded-xl p-4 flex items-center gap-3 animate-fade-in-up"
                            style={{ animationDelay: `${i * 200}ms` }}
                        >
                            <span className="text-3xl">{achievement.icon}</span>
                            <div>
                                <div className="font-bold text-yellow-400">Achievement Unlocked!</div>
                                <div className="text-sm">{achievement.name}</div>
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
