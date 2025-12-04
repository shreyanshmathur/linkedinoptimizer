import React, { useState, useRef } from 'react';
import {
    FileDown, Eye, Edit3, Layout, Type, Palette,
    GripVertical, Plus, X, Save, Download, ChevronDown
} from 'lucide-react';

const TEMPLATES = [
    {
        id: 'minimalist',
        name: 'Minimalist Professional',
        atsScore: 98,
        description: 'Clean, simple layout optimized for ATS',
        colors: ['#000000', '#333333', '#0a66c2']
    },
    {
        id: 'modern',
        name: 'Modern Professional',
        atsScore: 85,
        description: 'Contemporary design with visual elements',
        colors: ['#1a1a2e', '#16537e', '#f7f7f7']
    },
    {
        id: 'executive',
        name: 'Executive',
        atsScore: 92,
        description: 'Sophisticated design for senior roles',
        colors: ['#1a1a1a', '#c9a227', '#ffffff']
    }
];

export default function ResumeEditor({ profile, scores }) {
    const [selectedTemplate, setSelectedTemplate] = useState('minimalist');
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(profile);
    const [showTemplates, setShowTemplates] = useState(false);
    const [customColors, setCustomColors] = useState({
        primary: '#0a66c2',
        secondary: '#333333',
        accent: '#000000'
    });
    const previewRef = useRef(null);

    // Section order for drag and drop
    const [sectionOrder, setSectionOrder] = useState([
        'header', 'summary', 'experience', 'education', 'skills', 'certifications'
    ]);

    const handleDownload = () => {
        const content = generateResumeHTML();
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${profile.name || 'resume'}-${selectedTemplate}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handlePreview = () => {
        const content = generateResumeHTML();
        const newWindow = window.open('', '_blank');
        newWindow.document.write(content);
        newWindow.document.close();
    };

    const generateResumeHTML = () => {
        const data = isEditing ? editedProfile : profile;
        const template = TEMPLATES.find(t => t.id === selectedTemplate);
        const colors = template?.colors || Object.values(customColors);

        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.name || 'Resume'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      line-height: 1.6; 
      color: ${colors[1]}; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 40px;
      background: white;
    }
    .header { 
      border-bottom: 3px solid ${colors[2]}; 
      padding-bottom: 20px; 
      margin-bottom: 30px; 
    }
    h1 { 
      font-size: 28px; 
      color: ${colors[0]}; 
      margin-bottom: 5px; 
    }
    .headline { 
      color: ${colors[2]}; 
      font-size: 16px; 
      font-weight: 500; 
    }
    .contact { 
      margin-top: 10px; 
      font-size: 14px; 
      color: #666; 
    }
    .section { margin-bottom: 25px; }
    .section-title { 
      font-size: 14px; 
      text-transform: uppercase; 
      letter-spacing: 1px; 
      color: ${colors[2]}; 
      border-bottom: 1px solid #ddd; 
      padding-bottom: 5px; 
      margin-bottom: 15px; 
    }
    .job { margin-bottom: 20px; }
    .job-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .job-title { font-weight: 600; color: ${colors[0]}; }
    .company { color: #666; }
    .job-date { color: #888; font-size: 14px; }
    .bullets { padding-left: 20px; }
    .bullets li { margin-bottom: 5px; }
    .skills { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill { 
      background: ${colors[2]}15; 
      padding: 4px 12px; 
      border-radius: 4px; 
      font-size: 14px; 
    }
    .education-item { margin-bottom: 15px; }
    .school { font-weight: 600; }
    .degree { color: #666; }
    @media print {
      body { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.name || 'Your Name'}</h1>
    <div class="headline">${data.headline || ''}</div>
    <div class="contact">${data.email || ''} ${data.location ? '| ' + data.location : ''}</div>
  </div>

  ${data.about ? `
  <div class="section">
    <div class="section-title">Summary</div>
    <p>${data.about}</p>
  </div>
  ` : ''}

  ${data.experiences?.length ? `
  <div class="section">
    <div class="section-title">Experience</div>
    ${data.experiences.map(exp => `
      <div class="job">
        <div class="job-header">
          <div>
            <span class="job-title">${exp.title || ''}</span>
            <span class="company"> at ${exp.company || ''}</span>
          </div>
          <span class="job-date">${exp.duration || ''}</span>
        </div>
        ${exp.bullets?.length ? `
        <ul class="bullets">
          ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${data.education?.length ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${data.education.map(edu => `
      <div class="education-item">
        <div class="school">${edu.school || ''}</div>
        <div class="degree">${edu.degree || ''} ${edu.field ? 'in ' + edu.field : ''} ${edu.year ? '(' + edu.year + ')' : ''}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${data.skills?.length ? `
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills">
      ${data.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
    </div>
  </div>
  ` : ''}

  ${data.licenses?.length ? `
  <div class="section">
    <div class="section-title">Certifications</div>
    ${data.licenses.map(lic => `
      <div class="education-item">
        <div class="school">${lic.name || ''}</div>
        <div class="degree">${lic.issuer || ''} ${lic.issueDate ? '- ' + lic.issueDate : ''}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}
</body>
</html>`;
    };

    const updateEditedField = (section, field, value, index = null) => {
        setEditedProfile(prev => {
            if (index !== null) {
                const items = [...(prev[section] || [])];
                items[index] = { ...items[index], [field]: value };
                return { ...prev, [section]: items };
            }
            return { ...prev, [field]: value };
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <FileDown className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Resume Editor</h2>
                            <p className="text-gray-400">Customize and export your resume</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isEditing ? 'bg-linkedin-500' : 'bg-white/10'
                                }`}
                        >
                            <Edit3 className="w-4 h-4" />
                            {isEditing ? 'Editing' : 'Edit'}
                        </button>
                    </div>
                </div>

                {/* Template Selection */}
                <div className="relative">
                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="w-full p-4 bg-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Layout className="w-5 h-5 text-gray-400" />
                            <div className="text-left">
                                <div className="font-medium">
                                    {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                                </div>
                                <div className="text-sm text-gray-400">
                                    {TEMPLATES.find(t => t.id === selectedTemplate)?.atsScore}% ATS Compatible
                                </div>
                            </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                    </button>

                    {showTemplates && (
                        <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-10">
                            {TEMPLATES.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => {
                                        setSelectedTemplate(template.id);
                                        setShowTemplates(false);
                                    }}
                                    className={`w-full p-4 flex items-center justify-between hover:bg-white/10 transition-colors ${selectedTemplate === template.id ? 'bg-white/10' : ''
                                        }`}
                                >
                                    <div>
                                        <div className="font-medium">{template.name}</div>
                                        <div className="text-sm text-gray-400">{template.description}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {template.colors.map((color, i) => (
                                            <div
                                                key={i}
                                                className="w-4 h-4 rounded-full border border-white/20"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                        <span className="text-sm text-green-400 ml-2">
                                            {template.atsScore}% ATS
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Mode */}
            {isEditing && (
                <div className="glass rounded-2xl p-6 space-y-6">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-linkedin-400" />
                        Edit Resume Content
                    </h3>

                    {/* Name */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
                        <input
                            type="text"
                            value={editedProfile.name || ''}
                            onChange={(e) => updateEditedField(null, 'name', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-linkedin-500 focus:outline-none"
                        />
                    </div>

                    {/* Headline */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Headline</label>
                        <input
                            type="text"
                            value={editedProfile.headline || ''}
                            onChange={(e) => updateEditedField(null, 'headline', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-linkedin-500 focus:outline-none"
                        />
                    </div>

                    {/* About */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">Summary</label>
                        <textarea
                            value={editedProfile.about || ''}
                            onChange={(e) => updateEditedField(null, 'about', e.target.value)}
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:border-linkedin-500 focus:outline-none resize-none"
                        />
                    </div>

                    <button
                        onClick={() => setIsEditing(false)}
                        className="w-full py-3 bg-linkedin-500 rounded-xl font-semibold hover:opacity-90"
                    >
                        <Save className="w-5 h-5 inline mr-2" />
                        Save Changes
                    </button>
                </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={handlePreview}
                    className="glass rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                >
                    <Eye className="w-5 h-5 text-blue-400" />
                    <span>Preview</span>
                </button>
                <button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <Download className="w-5 h-5" />
                    <span>Download HTML</span>
                </button>
            </div>

            {/* Tips */}
            <div className="glass rounded-2xl p-6 bg-gradient-to-r from-green-600/20 to-emerald-500/10 border border-green-500/30">
                <h3 className="font-semibold text-green-400 mb-3">💡 Resume Tips</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                    <li>• Open the HTML file and <strong>Print to PDF</strong> for best results</li>
                    <li>• Minimalist template scores highest with ATS systems</li>
                    <li>• Keep resume to 1-2 pages for most roles</li>
                    <li>• Use the edit mode to customize content before export</li>
                </ul>
            </div>
        </div>
    );
}
