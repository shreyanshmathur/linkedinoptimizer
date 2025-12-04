import React, { useState } from 'react';
import {
    GraduationCap, Plus, X, AlertTriangle, Check, Award
} from 'lucide-react';
import { getScoreColor } from '../../utils/scoringEngine';

export default function EducationOptimizer({
    education, setEducation, score, details,
    careerLevel, onScoreUpdate
}) {
    const [newEducation, setNewEducation] = useState({
        school: '',
        degree: '',
        field: '',
        year: '',
        gpa: '',
        coursework: []
    });

    // Add education
    const handleAddEducation = () => {
        if (!newEducation.school || !newEducation.degree) return;

        setEducation([...education, { ...newEducation, id: Date.now() }]);
        setNewEducation({
            school: '',
            degree: '',
            field: '',
            year: '',
            gpa: '',
            coursework: []
        });
        onScoreUpdate();
    };

    // Remove education
    const handleRemoveEducation = (id) => {
        setEducation(education.filter(e => e.id !== id));
        onScoreUpdate();
    };

    // Update education
    const handleUpdateEducation = (id, field, value) => {
        const updated = education.map(e =>
            e.id === id ? { ...e, [field]: value } : e
        );
        setEducation(updated);
        onScoreUpdate();
    };

    const issues = details?.issues || [];
    const breakdown = details?.breakdown || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Education Optimizer</h2>
                        <p className="text-gray-400">Showcase your academic credentials</p>
                    </div>
                    <div className="text-right">
                        <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                            {score}
                        </div>
                        <div className="text-sm text-gray-400">/ 100</div>
                    </div>
                </div>

                {/* Score breakdown */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {Object.entries(breakdown).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="bg-white/5 rounded-lg p-3 text-center">
                            <div className={`text-lg font-bold ${getScoreColor(value)}`}>
                                {Math.round(value)}%
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Issues */}
                {issues.length > 0 && (
                    <div className="space-y-2">
                        {issues.map((issue, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-300">{issue}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Education List */}
            {education.map((edu) => (
                <div key={edu.id} className="glass rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={edu.school || ''}
                                    onChange={(e) => handleUpdateEducation(edu.id, 'school', e.target.value)}
                                    placeholder="University Name"
                                    className="bg-transparent text-lg font-semibold focus:outline-none w-full"
                                />
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={edu.degree || ''}
                                        onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                                        placeholder="Degree"
                                        className="bg-transparent text-gray-400 text-sm focus:outline-none"
                                    />
                                    <span className="text-gray-600">in</span>
                                    <input
                                        type="text"
                                        value={edu.field || ''}
                                        onChange={(e) => handleUpdateEducation(edu.id, 'field', e.target.value)}
                                        placeholder="Field of Study"
                                        className="bg-transparent text-gray-400 text-sm focus:outline-none flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleRemoveEducation(edu.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Additional fields */}
                    <div className="grid grid-cols-2 gap-4 ml-15">
                        <input
                            type="text"
                            value={edu.year || ''}
                            onChange={(e) => handleUpdateEducation(edu.id, 'year', e.target.value)}
                            placeholder="Graduation Year (e.g., 2020)"
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                        />
                        <input
                            type="text"
                            value={edu.gpa || ''}
                            onChange={(e) => handleUpdateEducation(edu.id, 'gpa', e.target.value)}
                            placeholder="GPA (optional, e.g., 3.8)"
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                        />
                    </div>
                </div>
            ))}

            {/* Add Education Form */}
            <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-purple-400" />
                    Add Education
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        value={newEducation.school}
                        onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
                        placeholder="University/School Name"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={newEducation.degree}
                        onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                        placeholder="Degree (e.g., Bachelor's, Master's)"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={newEducation.field}
                        onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                        placeholder="Field of Study"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={newEducation.year}
                        onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                        placeholder="Year"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-purple-500 focus:outline-none"
                    />
                </div>

                <button
                    onClick={handleAddEducation}
                    disabled={!newEducation.school || !newEducation.degree}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    Add Education
                </button>
            </div>

            {/* No education placeholder */}
            {education.length === 0 && (
                <div className="text-center py-8 border border-dashed border-white/20 rounded-xl">
                    <GraduationCap className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No education added yet</p>
                    <p className="text-sm text-gray-500">Add your degrees and certifications</p>
                </div>
            )}

            {/* Tips */}
            <div className="glass rounded-2xl p-6 bg-gradient-to-r from-purple-600/20 to-pink-500/10 border border-purple-500/30">
                <h3 className="font-semibold text-purple-400 mb-3">💡 Education Best Practices</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                    <li>• List degrees in <strong>reverse chronological</strong> order</li>
                    <li>• Include <strong>relevant coursework</strong> for entry-level positions</li>
                    <li>• Add <strong>GPA if 3.5+</strong> and ≤5 years since graduation</li>
                    <li>• Include <strong>certifications</strong> and <strong>professional development</strong></li>
                    <li>• For executives, education matters less—focus on {careerLevel === 'executive' ? 'leadership achievements' : 'degree relevance'}</li>
                </ul>
            </div>
        </div>
    );
}
