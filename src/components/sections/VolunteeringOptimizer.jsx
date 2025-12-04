import React, { useState } from 'react';
import { Heart, Plus, X, Calendar, Building, MapPin } from 'lucide-react';
import { getScoreColor } from '../../utils/scoringEngine';

export default function VolunteeringOptimizer({
    volunteering = [], setVolunteering, score, details, onScoreUpdate
}) {
    const [newVolunteer, setNewVolunteer] = useState({
        role: '',
        organization: '',
        cause: '',
        startDate: '',
        endDate: '',
        description: ''
    });

    const causes = [
        'Education', 'Environment', 'Health', 'Human Rights',
        'Poverty Alleviation', 'Science & Technology', 'Social Services'
    ];

    const handleAddVolunteer = () => {
        if (!newVolunteer.role || !newVolunteer.organization) return;

        setVolunteering([...volunteering, { ...newVolunteer, id: Date.now() }]);
        setNewVolunteer({
            role: '',
            organization: '',
            cause: '',
            startDate: '',
            endDate: '',
            description: ''
        });
        onScoreUpdate?.();
    };

    const handleRemoveVolunteer = (id) => {
        setVolunteering(volunteering.filter(v => v.id !== id));
        onScoreUpdate?.();
    };

    const handleUpdateVolunteer = (id, field, value) => {
        setVolunteering(volunteering.map(v =>
            v.id === id ? { ...v, [field]: value } : v
        ));
        onScoreUpdate?.();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Volunteering Experience</h2>
                        <p className="text-gray-400">Show your community involvement</p>
                    </div>
                    <div className="text-right">
                        <div className={`text-4xl font-bold ${getScoreColor(score || 0)}`}>
                            {score || 0}
                        </div>
                        <div className="text-sm text-gray-400">/ 100</div>
                    </div>
                </div>

                {/* Why it matters */}
                <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
                    <h4 className="font-semibold text-pink-400 mb-2">💝 Why Volunteering Matters</h4>
                    <p className="text-sm text-gray-300">
                        Profiles with volunteering experience receive <strong>42% more interest</strong> from
                        recruiters. It shows leadership, values alignment, and soft skills.
                    </p>
                </div>
            </div>

            {/* Existing Volunteering */}
            {volunteering.map((vol) => (
                <div key={vol.id} className="glass rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center">
                                <Heart className="w-6 h-6 text-pink-400" />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={vol.role || ''}
                                    onChange={(e) => handleUpdateVolunteer(vol.id, 'role', e.target.value)}
                                    placeholder="Volunteer Role"
                                    className="bg-transparent text-lg font-semibold focus:outline-none w-full"
                                />
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Building className="w-4 h-4" />
                                    <input
                                        type="text"
                                        value={vol.organization || ''}
                                        onChange={(e) => handleUpdateVolunteer(vol.id, 'organization', e.target.value)}
                                        placeholder="Organization"
                                        className="bg-transparent focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleRemoveVolunteer(vol.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4 ml-15">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Cause</label>
                            <select
                                value={vol.cause || ''}
                                onChange={(e) => handleUpdateVolunteer(vol.id, 'cause', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
                            >
                                <option value="">Select a cause</option>
                                {causes.map(cause => (
                                    <option key={cause} value={cause}>{cause}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                                <input
                                    type="date"
                                    value={vol.startDate || ''}
                                    onChange={(e) => handleUpdateVolunteer(vol.id, 'startDate', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                                <input
                                    type="date"
                                    value={vol.endDate || ''}
                                    onChange={(e) => handleUpdateVolunteer(vol.id, 'endDate', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Description</label>
                            <textarea
                                value={vol.description || ''}
                                onChange={(e) => handleUpdateVolunteer(vol.id, 'description', e.target.value)}
                                placeholder="Describe your impact and contributions..."
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-pink-500 focus:outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>
            ))}

            {/* Add New Volunteering Form */}
            <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-pink-400" />
                    Add Volunteering Experience
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        value={newVolunteer.role}
                        onChange={(e) => setNewVolunteer({ ...newVolunteer, role: e.target.value })}
                        placeholder="Role (e.g., Mentor, Coordinator)"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-pink-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={newVolunteer.organization}
                        onChange={(e) => setNewVolunteer({ ...newVolunteer, organization: e.target.value })}
                        placeholder="Organization"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-pink-500 focus:outline-none"
                    />
                    <select
                        value={newVolunteer.cause}
                        onChange={(e) => setNewVolunteer({ ...newVolunteer, cause: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-pink-500 focus:outline-none"
                    >
                        <option value="">Select a cause</option>
                        {causes.map(cause => (
                            <option key={cause} value={cause}>{cause}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={newVolunteer.startDate}
                        onChange={(e) => setNewVolunteer({ ...newVolunteer, startDate: e.target.value })}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-pink-500 focus:outline-none"
                    />
                </div>

                <textarea
                    value={newVolunteer.description}
                    onChange={(e) => setNewVolunteer({ ...newVolunteer, description: e.target.value })}
                    placeholder="Describe your contributions and impact..."
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-4 focus:border-pink-500 focus:outline-none resize-none"
                />

                <button
                    onClick={handleAddVolunteer}
                    disabled={!newVolunteer.role || !newVolunteer.organization}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    Add Volunteering
                </button>
            </div>

            {/* Empty state */}
            {volunteering.length === 0 && (
                <div className="text-center py-8 border border-dashed border-white/20 rounded-xl">
                    <Heart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">No volunteering added yet</p>
                    <p className="text-sm text-gray-500">Add your community involvement to stand out</p>
                </div>
            )}

            {/* Tips */}
            <div className="glass rounded-2xl p-6 bg-gradient-to-r from-pink-600/20 to-rose-500/10 border border-pink-500/30">
                <h3 className="font-semibold text-pink-400 mb-3">💡 Volunteering Best Practices</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                    <li>• Focus on <strong>impact and outcomes</strong>, not just participation</li>
                    <li>• Include <strong>leadership roles</strong> if applicable</li>
                    <li>• Align with <strong>values of target companies</strong></li>
                    <li>• Relevant skills transfer shows versatility</li>
                </ul>
            </div>
        </div>
    );
}
