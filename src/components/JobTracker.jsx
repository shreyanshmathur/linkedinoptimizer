import React, { useState, useEffect } from 'react';
import {
    Briefcase, Plus, X, Search, Target, AlertTriangle, Check,
    TrendingUp, Loader2, ExternalLink, Calendar, Building
} from 'lucide-react';

export default function JobTracker({ profile, jobKeywords, setJobKeywords }) {
    const [jobs, setJobs] = useState([]);
    const [showAddJob, setShowAddJob] = useState(false);
    const [newJob, setNewJob] = useState({
        title: '',
        company: '',
        url: '',
        description: '',
        dateAdded: null
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Extract keywords from job description
    const extractKeywords = (description) => {
        const techKeywords = [
            'python', 'javascript', 'react', 'node', 'sql', 'aws', 'azure', 'gcp',
            'machine learning', 'data analysis', 'api', 'agile', 'scrum', 'kubernetes',
            'docker', 'typescript', 'java', 'c++', 'go', 'rust', 'mongodb', 'postgresql'
        ];

        const softKeywords = [
            'leadership', 'communication', 'collaboration', 'problem-solving',
            'strategic thinking', 'analytical', 'creative', 'innovative',
            'team player', 'self-motivated', 'detail-oriented'
        ];

        const businessKeywords = [
            'product management', 'stakeholder', 'roadmap', 'strategy', 'revenue',
            'growth', 'kpi', 'metrics', 'budget', 'cross-functional', 'go-to-market'
        ];

        const allKeywords = [...techKeywords, ...softKeywords, ...businessKeywords];
        const descLower = description.toLowerCase();

        return allKeywords.filter(kw => descLower.includes(kw));
    };

    // Calculate match score
    const calculateMatchScore = (jobDescription) => {
        const jobKws = extractKeywords(jobDescription);
        const profileKws = profile.skills || [];
        const profileText = `${profile.headline || ''} ${profile.about || ''} ${profile.experiences?.map(e => e.bullets?.join(' ')).join(' ') || ''
            }`.toLowerCase();

        let matches = 0;
        let total = jobKws.length;

        jobKws.forEach(kw => {
            if (profileKws.some(s => s.toLowerCase().includes(kw)) || profileText.includes(kw)) {
                matches++;
            }
        });

        return total > 0 ? Math.round((matches / total) * 100) : 0;
    };

    // Get missing keywords
    const getMissingKeywords = (jobDescription) => {
        const jobKws = extractKeywords(jobDescription);
        const profileKws = profile.skills || [];
        const profileText = `${profile.headline || ''} ${profile.about || ''} ${profile.experiences?.map(e => e.bullets?.join(' ')).join(' ') || ''
            }`.toLowerCase();

        return jobKws.filter(kw =>
            !profileKws.some(s => s.toLowerCase().includes(kw)) &&
            !profileText.includes(kw)
        );
    };

    // Add new job
    const handleAddJob = async () => {
        if (!newJob.title || !newJob.description) return;

        setIsAnalyzing(true);

        // Simulate analysis delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const matchScore = calculateMatchScore(newJob.description);
        const extractedKeywords = extractKeywords(newJob.description);
        const missingKeywords = getMissingKeywords(newJob.description);

        const job = {
            ...newJob,
            id: Date.now(),
            dateAdded: new Date().toISOString(),
            matchScore,
            extractedKeywords,
            missingKeywords,
            status: 'saved'
        };

        setJobs(prev => [job, ...prev]);

        // Add extracted keywords to global job keywords
        const newKeywords = extractedKeywords.filter(kw => !jobKeywords.includes(kw));
        if (newKeywords.length > 0) {
            setJobKeywords([...jobKeywords, ...newKeywords.slice(0, 5)]);
        }

        setNewJob({ title: '', company: '', url: '', description: '', dateAdded: null });
        setShowAddJob(false);
        setIsAnalyzing(false);
    };

    // Remove job
    const handleRemoveJob = (id) => {
        setJobs(prev => prev.filter(j => j.id !== id));
    };

    // Get score color
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-green-500/20 border-green-500/40';
        if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/40';
        if (score >= 40) return 'bg-orange-500/20 border-orange-500/40';
        return 'bg-red-500/20 border-red-500/40';
    };

    return (
        <div className="glass rounded-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Job Tracker</h2>
                        <p className="text-sm text-gray-400">Track jobs & analyze ATS compatibility</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowAddJob(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Job
                </button>
            </div>

            {/* Add Job Form */}
            {showAddJob && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Add New Job</h3>
                        <button onClick={() => setShowAddJob(false)}>
                            <X className="w-5 h-5 text-gray-400 hover:text-white" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={newJob.title}
                            onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                            placeholder="Job Title"
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                            type="text"
                            value={newJob.company}
                            onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                            placeholder="Company"
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <input
                        type="url"
                        value={newJob.url}
                        onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
                        placeholder="Job URL (optional)"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />

                    <textarea
                        value={newJob.description}
                        onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                        placeholder="Paste job description here..."
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none resize-none"
                    />

                    <button
                        onClick={handleAddJob}
                        disabled={!newJob.title || !newJob.description || isAnalyzing}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Analyze & Add Job
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Jobs List */}
            {jobs.length > 0 ? (
                <div className="space-y-4">
                    {jobs.map(job => (
                        <div key={job.id} className={`border rounded-xl p-4 ${getScoreBg(job.matchScore)}`}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-lg">{job.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Building className="w-4 h-4" />
                                        {job.company}
                                        {job.url && (
                                            <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-center">
                                        <div className={`text-2xl font-bold ${getScoreColor(job.matchScore)}`}>
                                            {job.matchScore}%
                                        </div>
                                        <div className="text-xs text-gray-500">ATS Match</div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveJob(job.id)}
                                        className="p-1 rounded hover:bg-white/10 text-gray-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Keywords found */}
                            <div className="mb-3">
                                <div className="text-xs text-gray-500 mb-2">Keywords matched:</div>
                                <div className="flex flex-wrap gap-1">
                                    {job.extractedKeywords.slice(0, 8).map((kw, i) => (
                                        <span
                                            key={i}
                                            className={`px-2 py-0.5 text-xs rounded ${job.missingKeywords.includes(kw)
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-green-500/20 text-green-400'
                                                }`}
                                        >
                                            {job.missingKeywords.includes(kw) ? '✗' : '✓'} {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Missing keywords */}
                            {job.missingKeywords.length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-red-400 mb-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Missing Keywords ({job.missingKeywords.length})
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {job.missingKeywords.map((kw, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Add these keywords to your profile to improve your ATS match score
                                    </p>
                                </div>
                            )}

                            <div className="text-xs text-gray-500 mt-3">
                                Added {new Date(job.dateAdded).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-white/20 rounded-xl">
                    <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No jobs tracked yet</p>
                    <p className="text-sm text-gray-500">
                        Add job descriptions to analyze ATS compatibility
                    </p>
                </div>
            )}

            {/* Tips */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="font-semibold text-blue-400 mb-2">💡 ATS Matching Tips</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Paste the full job description for best keyword extraction</li>
                    <li>• Missing keywords should be added to your profile</li>
                    <li>• Aim for 80%+ match score for best results</li>
                    <li>• Keywords are automatically added to your targeting</li>
                </ul>
            </div>
        </div>
    );
}
