import React, { useState } from 'react';
import { LayoutGrid, Plus, X, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

const SECTION_TEMPLATES = [
    { id: 'projects', name: 'Projects', icon: '🚀', description: 'Showcase side projects and portfolio work' },
    { id: 'publications', name: 'Publications', icon: '📚', description: 'Articles, papers, and research' },
    { id: 'patents', name: 'Patents', icon: '💡', description: 'Inventions and intellectual property' },
    { id: 'languages', name: 'Languages', icon: '🌍', description: 'Language proficiencies' },
    { id: 'courses', name: 'Courses', icon: '📖', description: 'Online courses and continuing education' },
    { id: 'honors', name: 'Honors & Awards', icon: '🏆', description: 'Recognition and achievements' },
    { id: 'organizations', name: 'Organizations', icon: '🤝', description: 'Professional memberships' }
];

export default function CustomSectionEditor({
    customSections = [], setCustomSections, onScoreUpdate
}) {
    const [showTemplates, setShowTemplates] = useState(false);
    const [expandedSection, setExpandedSection] = useState(null);

    const handleAddSection = (template) => {
        const newSection = {
            id: Date.now(),
            type: template.id,
            name: template.name,
            icon: template.icon,
            items: []
        };
        setCustomSections([...customSections, newSection]);
        setShowTemplates(false);
        setExpandedSection(newSection.id);
        onScoreUpdate?.();
    };

    const handleRemoveSection = (id) => {
        setCustomSections(customSections.filter(s => s.id !== id));
        onScoreUpdate?.();
    };

    const handleAddItem = (sectionId) => {
        setCustomSections(customSections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    items: [...section.items, { id: Date.now(), title: '', description: '', date: '' }]
                };
            }
            return section;
        }));
        onScoreUpdate?.();
    };

    const handleUpdateItem = (sectionId, itemId, field, value) => {
        setCustomSections(customSections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    items: section.items.map(item =>
                        item.id === itemId ? { ...item, [field]: value } : item
                    )
                };
            }
            return section;
        }));
        onScoreUpdate?.();
    };

    const handleRemoveItem = (sectionId, itemId) => {
        setCustomSections(customSections.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    items: section.items.filter(item => item.id !== itemId)
                };
            }
            return section;
        }));
        onScoreUpdate?.();
    };

    const handleMoveSection = (index, direction) => {
        const newSections = [...customSections];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newSections.length) return;
        [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
        setCustomSections(newSections);
    };

    // Get unused templates
    const usedTypes = customSections.map(s => s.type);
    const availableTemplates = SECTION_TEMPLATES.filter(t => !usedTypes.includes(t.id));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <LayoutGrid className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Custom Sections</h2>
                        <p className="text-gray-400">Add specialized profile sections</p>
                    </div>
                </div>

                <p className="text-sm text-gray-400">
                    Custom sections help you stand out by showcasing unique qualifications like
                    projects, publications, patents, and more.
                </p>
            </div>

            {/* Existing Sections */}
            {customSections.map((section, index) => (
                <div key={section.id} className="glass rounded-2xl overflow-hidden">
                    {/* Section Header */}
                    <div
                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5"
                        onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    >
                        <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />
                            <button
                                onClick={(e) => { e.stopPropagation(); handleMoveSection(index, 'up'); }}
                                disabled={index === 0}
                                className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleMoveSection(index, 'down'); }}
                                disabled={index === customSections.length - 1}
                                className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>

                        <span className="text-2xl">{section.icon}</span>
                        <div className="flex-1">
                            <h3 className="font-semibold">{section.name}</h3>
                            <p className="text-sm text-gray-400">{section.items.length} items</p>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveSection(section.id); }}
                            className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Section Content */}
                    {expandedSection === section.id && (
                        <div className="p-4 pt-0 space-y-4">
                            {section.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white/5 rounded-lg p-4 space-y-3"
                                >
                                    <div className="flex items-start justify-between">
                                        <input
                                            type="text"
                                            value={item.title || ''}
                                            onChange={(e) => handleUpdateItem(section.id, item.id, 'title', e.target.value)}
                                            placeholder="Title"
                                            className="bg-transparent font-semibold focus:outline-none flex-1"
                                        />
                                        <button
                                            onClick={() => handleRemoveItem(section.id, item.id)}
                                            className="p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <input
                                        type="text"
                                        value={item.date || ''}
                                        onChange={(e) => handleUpdateItem(section.id, item.id, 'date', e.target.value)}
                                        placeholder="Date or Duration"
                                        className="w-full bg-transparent text-sm text-gray-400 focus:outline-none"
                                    />

                                    <textarea
                                        value={item.description || ''}
                                        onChange={(e) => handleUpdateItem(section.id, item.id, 'description', e.target.value)}
                                        placeholder="Description..."
                                        rows={2}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none resize-none"
                                    />

                                    {section.type === 'projects' && (
                                        <input
                                            type="url"
                                            value={item.url || ''}
                                            onChange={(e) => handleUpdateItem(section.id, item.id, 'url', e.target.value)}
                                            placeholder="Project URL"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                        />
                                    )}
                                </div>
                            ))}

                            <button
                                onClick={() => handleAddItem(section.id)}
                                className="w-full py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Item
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {/* Add Section Button */}
            {!showTemplates ? (
                <button
                    onClick={() => setShowTemplates(true)}
                    disabled={availableTemplates.length === 0}
                    className="w-full glass rounded-2xl p-6 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border-2 border-dashed border-white/20 disabled:opacity-50"
                >
                    <Plus className="w-5 h-5 text-indigo-400" />
                    <span className="font-semibold">Add Custom Section</span>
                </button>
            ) : (
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Choose a Section Type</h3>
                        <button onClick={() => setShowTemplates(false)}>
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {availableTemplates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => handleAddSection(template)}
                                className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left"
                            >
                                <span className="text-2xl mb-2 block">{template.icon}</span>
                                <div className="font-semibold">{template.name}</div>
                                <div className="text-xs text-gray-500">{template.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="glass rounded-2xl p-6 bg-gradient-to-r from-indigo-600/20 to-purple-500/10 border border-indigo-500/30">
                <h3 className="font-semibold text-indigo-400 mb-3">💡 Custom Section Tips</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                    <li>• <strong>Projects</strong> are great for developers and creatives</li>
                    <li>• <strong>Publications</strong> establish thought leadership</li>
                    <li>• <strong>Languages</strong> are valuable for global roles</li>
                    <li>• Keep sections relevant to your target role</li>
                    <li>• Order sections by importance using the arrows</li>
                </ul>
            </div>
        </div>
    );
}
