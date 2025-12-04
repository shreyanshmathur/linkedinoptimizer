import React, { useState } from 'react';
import { Award, Plus, X, ExternalLink, Calendar, Building } from 'lucide-react';
import { getScoreColor } from '../../utils/scoringEngine';

export default function LicensesOptimizer({
    licenses = [], setLicenses, score, details, onScoreUpdate
}) {
    const [newLicense, setNewLicense] = useState({
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: ''
    });

    const handleAddLicense = () => {
        if (!newLicense.name || !newLicense.issuer) return;

        setLicenses([...licenses, { ...newLicense, id: Date.now() }]);
        setNewLicense({
            name: '',
            issuer: '',
            issueDate: '',
            expiryDate: '',
            credentialId: '',
            credentialUrl: ''
        });
        onScoreUpdate?.();
    };

    const handleRemoveLicense = (id) => {
        setLicenses(licenses.filter(l => l.id !== id));
        onScoreUpdate?.();
    };

    const handleUpdateLicense = (id, field, value) => {
        setLicenses(licenses.map(l =>
            l.id === id ? { ...l, [field]: value } : l
        ));
        onScoreUpdate?.();
    };

    // Popular certifications for suggestions
    const popularCerts = [
        { name: 'AWS Solutions Architect', issuer: 'Amazon Web Services' },
        { name: 'PMP', issuer: 'Project Management Institute' },
        { name: 'Google Analytics', issuer: 'Google' },
        { name: 'Scrum Master', issuer: 'Scrum Alliance' },
        { name: 'HubSpot Marketing', issuer: 'HubSpot Academy' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Licenses & Certifications</h2>
                        <p className="text-gray-400">Boost credibility with verified credentials</p>
                    </div>
                    <div className="text-right">
                        <div className={`text-4xl font-bold ${getScoreColor(score || 0)}`}>
                            {score || 0}
                        </div>
                        <div className="text-sm text-gray-400">/ 100</div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-400">{licenses.length}</div>
                        <div className="text-xs text-gray-500">Certificates</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-400">
                            {licenses.filter(l => l.credentialUrl).length}
                        </div>
                        <div className="text-xs text-gray-500">With Links</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-purple-400">
                            {licenses.filter(l => !l.expiryDate || new Date(l.expiryDate) > new Date()).length}
                        </div>
                        <div className="text-xs text-gray-500">Active</div>
                    </div>
                </div>
            </div>

            {/* Existing Licenses */}
            {licenses.map((license) => (
                <div key={license.id} className="glass rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                <Award className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={license.name || ''}
                                    onChange={(e) => handleUpdateLicense(license.id, 'name', e.target.value)}
                                    placeholder="Certification Name"
                                    className="bg-transparent text-lg font-semibold focus:outline-none w-full"
                                />
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Building className="w-4 h-4" />
                                    <input
                                        type="text"
                                        value={license.issuer || ''}
                                        onChange={(e) => handleUpdateLicense(license.id, 'issuer', e.target.value)}
                                        placeholder="Issuing Organization"
                                        className="bg-transparent focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleRemoveLicense(license.id)}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 ml-15">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Issue Date</label>
                            <input
                                type="date"
                                value={license.issueDate || ''}
                                onChange={(e) => handleUpdateLicense(license.id, 'issueDate', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Expiry Date (if applicable)</label>
                            <input
                                type="date"
                                value={license.expiryDate || ''}
                                onChange={(e) => handleUpdateLicense(license.id, 'expiryDate', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Credential ID</label>
                            <input
                                type="text"
                                value={license.credentialId || ''}
                                onChange={(e) => handleUpdateLicense(license.id, 'credentialId', e.target.value)}
                                placeholder="ABC123XYZ"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Credential URL</label>
                            <input
                                type="url"
                                value={license.credentialUrl || ''}
                                onChange={(e) => handleUpdateLicense(license.id, 'credentialUrl', e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-yellow-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            ))}

            {/* Add New License Form */}
            <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-yellow-400" />
                    Add Certification
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        value={newLicense.name}
                        onChange={(e) => setNewLicense({ ...newLicense, name: e.target.value })}
                        placeholder="Certification Name"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-yellow-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={newLicense.issuer}
                        onChange={(e) => setNewLicense({ ...newLicense, issuer: e.target.value })}
                        placeholder="Issuing Organization"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-yellow-500 focus:outline-none"
                    />
                    <input
                        type="date"
                        value={newLicense.issueDate}
                        onChange={(e) => setNewLicense({ ...newLicense, issueDate: e.target.value })}
                        placeholder="Issue Date"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-yellow-500 focus:outline-none"
                    />
                    <input
                        type="url"
                        value={newLicense.credentialUrl}
                        onChange={(e) => setNewLicense({ ...newLicense, credentialUrl: e.target.value })}
                        placeholder="Credential URL (optional)"
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:border-yellow-500 focus:outline-none"
                    />
                </div>

                <button
                    onClick={handleAddLicense}
                    disabled={!newLicense.name || !newLicense.issuer}
                    className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    Add Certification
                </button>
            </div>

            {/* Popular certifications suggestion */}
            {licenses.length === 0 && (
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-semibold mb-4">Popular Certifications</h3>
                    <div className="space-y-2">
                        {popularCerts.map((cert, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setNewLicense({ ...newLicense, name: cert.name, issuer: cert.issuer });
                                }}
                                className="w-full p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-left flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-medium">{cert.name}</div>
                                    <div className="text-sm text-gray-400">{cert.issuer}</div>
                                </div>
                                <Plus className="w-4 h-4 text-gray-400" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="glass rounded-2xl p-6 bg-gradient-to-r from-yellow-600/20 to-orange-500/10 border border-yellow-500/30">
                <h3 className="font-semibold text-yellow-400 mb-3">💡 Certification Tips</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                    <li>• Add <strong>credential links</strong> for verification (+15 trust)</li>
                    <li>• Keep certifications <strong>up to date</strong> - expired ones hurt credibility</li>
                    <li>• Industry-specific certs boost <strong>ATS matching</strong></li>
                    <li>• Top 3 certifications get the most visibility</li>
                </ul>
            </div>
        </div>
    );
}
