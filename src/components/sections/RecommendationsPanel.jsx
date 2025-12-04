import React, { useState } from 'react';
import { MessageSquare, Plus, X, Star, User, Quote, ThumbsUp } from 'lucide-react';
import { getScoreColor } from '../../utils/scoringEngine';

export default function RecommendationsPanel({
    recommendations = [], setRecommendations, score, onScoreUpdate
}) {
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestForm, setRequestForm] = useState({
        name: '',
        title: '',
        relationship: '',
        email: ''
    });

    const relationships = [
        'Manager', 'Direct Report', 'Colleague', 'Client', 'Mentor', 'Mentee'
    ];

    const handleAddRecommendation = () => {
        if (!requestForm.name) return;

        setRecommendations([...recommendations, {
            ...requestForm,
            id: Date.now(),
            status: 'received',
            text: '',
            date: new Date().toISOString()
        }]);
        setRequestForm({ name: '', title: '', relationship: '', email: '' });
        setShowRequestForm(false);
        onScoreUpdate?.();
    };

    const handleRemoveRecommendation = (id) => {
        setRecommendations(recommendations.filter(r => r.id !== id));
        onScoreUpdate?.();
    };

    const handleUpdateRecommendation = (id, field, value) => {
        setRecommendations(recommendations.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        ));
        onScoreUpdate?.();
    };

    // Calculate stats
    const received = recommendations.filter(r => r.status === 'received').length;
    const given = recommendations.filter(r => r.status === 'given').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Recommendations</h2>
                        <p className="text-gray-400">Social proof from your network</p>
                    </div>
                    <div className="text-right">
                        <div className={`text-4xl font-bold ${getScoreColor(score || 0)}`}>
                            {score || 0}
                        </div>
                        <div className="text-sm text-gray-400">/ 100</div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-400">{received}</div>
                        <div className="text-sm text-gray-400">Received</div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400">{given}</div>
                        <div className="text-sm text-gray-400">Given</div>
                    </div>
                </div>

                {/* Ideal ratio */}
                <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-sm">
                        <span className="text-gray-400">Ideal ratio:</span>{' '}
                        <span className="font-semibold">5+ received, 3+ given</span>
                    </p>
                </div>
            </div>

            {/* Existing Recommendations */}
            {recommendations.map((rec) => (
                <div key={rec.id} className="glass rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    value={rec.name || ''}
                                    onChange={(e) => handleUpdateRecommendation(rec.id, 'name', e.target.value)}
                                    placeholder="Name"
                                    className="bg-transparent font-semibold focus:outline-none"
                                />
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <input
                                        type="text"
                                        value={rec.title || ''}
                                        onChange={(e) => handleUpdateRecommendation(rec.id, 'title', e.target.value)}
                                        placeholder="Title at Company"
                                        className="bg-transparent focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={rec.status || 'received'}
                                onChange={(e) => handleUpdateRecommendation(rec.id, 'status', e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none"
                            >
                                <option value="received">Received</option>
                                <option value="given">Given</option>
                            </select>
                            <button
                                onClick={() => handleRemoveRecommendation(rec.id)}
                                className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <select
                            value={rec.relationship || ''}
                            onChange={(e) => handleUpdateRecommendation(rec.id, 'relationship', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Select relationship</option>
                            {relationships.map(rel => (
                                <option key={rel} value={rel}>{rel}</option>
                            ))}
                        </select>

                        <div className="relative">
                            <Quote className="absolute top-3 left-3 w-4 h-4 text-gray-500" />
                            <textarea
                                value={rec.text || ''}
                                onChange={(e) => handleUpdateRecommendation(rec.id, 'text', e.target.value)}
                                placeholder="Recommendation text..."
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>
            ))}

            {/* Add Recommendation */}
            {!showRequestForm ? (
                <button
                    onClick={() => setShowRequestForm(true)}
                    className="w-full glass rounded-2xl p-6 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border-2 border-dashed border-white/20"
                >
                    <Plus className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold">Add Recommendation</span>
                </button>
            ) : (
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-400" />
                            Add Recommendation
                        </h3>
                        <button onClick={() => setShowRequestForm(false)}>
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            value={requestForm.name}
                            onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                            placeholder="Person's Name"
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                            type="text"
                            value={requestForm.title}
                            onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                            placeholder="Their Title"
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                        />
                        <select
                            value={requestForm.relationship}
                            onChange={(e) => setRequestForm({ ...requestForm, relationship: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                        >
                            <option value="">Select relationship</option>
                            {relationships.map(rel => (
                                <option key={rel} value={rel}>{rel}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleAddRecommendation}
                        disabled={!requestForm.name}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        Add Recommendation
                    </button>
                </div>
            )}

            {/* Tips */}
            <div className="glass rounded-2xl p-6 bg-gradient-to-r from-blue-600/20 to-purple-500/10 border border-blue-500/30">
                <h3 className="font-semibold text-blue-400 mb-3">💡 Recommendation Strategy</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                    <li>• Get recommendations from <strong>managers and senior colleagues</strong></li>
                    <li>• Diverse relationships (manager, peer, client) show well-roundedness</li>
                    <li>• <strong>Give recommendations first</strong> - people often reciprocate</li>
                    <li>• Quality over quantity - 5 strong ones beat 10 generic ones</li>
                    <li>• Request recommendations that highlight <strong>specific achievements</strong></li>
                </ul>
            </div>
        </div>
    );
}
