import React, { useState } from 'react';
import {
    FileText, Download, Eye, Check, Loader2, FileCheck,
    Briefcase, GraduationCap, Award, Star, Mail, Phone, Globe, MapPin
} from 'lucide-react';

// Resume templates
const TEMPLATES = {
    minimalist: {
        id: 'minimalist',
        name: 'Minimalist Professional',
        description: 'Clean ATS-friendly design with high compatibility',
        atsScore: 98,
        preview: 'Simple, single-column layout with clear hierarchy'
    },
    modern: {
        id: 'modern',
        name: 'Modern Professional',
        description: 'Contemporary design with visual appeal',
        atsScore: 85,
        preview: 'Two-column layout with accent colors'
    }
};

export default function ResumeExport({ profile, scores }) {
    const [selectedTemplate, setSelectedTemplate] = useState('minimalist');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [generatedPDF, setGeneratedPDF] = useState(null);

    // Generate resume content from profile
    const generateResumeContent = () => {
        return {
            name: profile.name || 'Your Name',
            headline: profile.headline || 'Professional Headline',
            email: profile.email || 'email@example.com',
            phone: profile.phone || '(555) 123-4567',
            location: profile.location || 'City, State',
            linkedin: profile.linkedinUrl || 'linkedin.com/in/yourprofile',
            about: profile.about || '',
            experiences: profile.experiences || [],
            skills: profile.skills || [],
            education: profile.education || []
        };
    };

    // Generate HTML for the resume
    const generateResumeHTML = (template) => {
        const content = generateResumeContent();

        if (template === 'minimalist') {
            return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${content.name} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Arial', sans-serif; 
      line-height: 1.5; 
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0a66c2; padding-bottom: 20px; }
    .name { font-size: 28px; font-weight: bold; color: #0a66c2; margin-bottom: 5px; }
    .headline { font-size: 16px; color: #666; margin-bottom: 10px; }
    .contact { font-size: 12px; color: #666; }
    .contact span { margin: 0 10px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #0a66c2; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
    .experience-item { margin-bottom: 15px; }
    .job-title { font-weight: bold; }
    .company { color: #666; }
    .duration { font-size: 12px; color: #888; }
    .bullets { margin-top: 8px; padding-left: 20px; }
    .bullets li { margin-bottom: 5px; font-size: 13px; }
    .skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill { background: #f0f7ff; color: #0a66c2; padding: 4px 12px; border-radius: 15px; font-size: 12px; }
    .education-item { margin-bottom: 10px; }
    .school { font-weight: bold; }
    .degree { color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${content.name}</div>
    <div class="headline">${content.headline}</div>
    <div class="contact">
      <span>${content.email}</span> |
      <span>${content.phone}</span> |
      <span>${content.location}</span> |
      <span>${content.linkedin}</span>
    </div>
  </div>
  
  ${content.about ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <p style="font-size: 13px;">${content.about.substring(0, 500)}</p>
  </div>
  ` : ''}
  
  ${content.experiences.length > 0 ? `
  <div class="section">
    <div class="section-title">Experience</div>
    ${content.experiences.map(exp => `
      <div class="experience-item">
        <div class="job-title">${exp.title || 'Job Title'}</div>
        <div class="company">${exp.company || 'Company'} | <span class="duration">${exp.duration || 'Duration'}</span></div>
        ${exp.bullets && exp.bullets.length > 0 ? `
        <ul class="bullets">
          ${exp.bullets.filter(b => b).map(bullet => `<li>${bullet}</li>`).join('')}
        </ul>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  ${content.skills.length > 0 ? `
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills-list">
      ${content.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
    </div>
  </div>
  ` : ''}
  
  ${content.education.length > 0 ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${content.education.map(edu => `
      <div class="education-item">
        <div class="school">${edu.school || 'University'}</div>
        <div class="degree">${edu.degree || 'Degree'} ${edu.field ? `in ${edu.field}` : ''}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}
</body>
</html>`;
        } else {
            // Modern template
            return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${content.name} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, sans-serif; 
      line-height: 1.6; 
      color: #333;
      display: flex;
    }
    .sidebar {
      width: 280px;
      background: linear-gradient(135deg, #0a66c2, #0d4a8c);
      color: white;
      padding: 40px 25px;
      min-height: 100vh;
    }
    .main {
      flex: 1;
      padding: 40px;
    }
    .name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
    .headline { font-size: 14px; opacity: 0.9; margin-bottom: 25px; }
    .sidebar-section { margin-bottom: 25px; }
    .sidebar-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; opacity: 0.8; }
    .contact-item { font-size: 12px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    .skill-tag { background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 12px; font-size: 11px; margin: 3px; display: inline-block; }
    .main-section { margin-bottom: 30px; }
    .main-title { font-size: 16px; font-weight: bold; color: #0a66c2; border-bottom: 2px solid #0a66c2; padding-bottom: 8px; margin-bottom: 15px; }
    .experience-item { margin-bottom: 20px; }
    .job-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .job-title { font-weight: bold; font-size: 14px; }
    .company { color: #0a66c2; font-size: 13px; }
    .duration { font-size: 12px; color: #888; text-align: right; }
    .bullets { margin-top: 8px; padding-left: 18px; }
    .bullets li { margin-bottom: 5px; font-size: 13px; color: #555; }
  </style>
</head>
<body>
  <div class="sidebar">
    <div class="name">${content.name}</div>
    <div class="headline">${content.headline}</div>
    
    <div class="sidebar-section">
      <div class="sidebar-title">Contact</div>
      <div class="contact-item">📧 ${content.email}</div>
      <div class="contact-item">📱 ${content.phone}</div>
      <div class="contact-item">📍 ${content.location}</div>
      <div class="contact-item">🔗 ${content.linkedin}</div>
    </div>
    
    ${content.skills.length > 0 ? `
    <div class="sidebar-section">
      <div class="sidebar-title">Skills</div>
      <div>
        ${content.skills.slice(0, 12).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
      </div>
    </div>
    ` : ''}
    
    ${content.education.length > 0 ? `
    <div class="sidebar-section">
      <div class="sidebar-title">Education</div>
      ${content.education.map(edu => `
        <div style="margin-bottom: 10px;">
          <div style="font-weight: bold; font-size: 13px;">${edu.school || 'University'}</div>
          <div style="font-size: 12px; opacity: 0.8;">${edu.degree || 'Degree'}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}
  </div>
  
  <div class="main">
    ${content.about ? `
    <div class="main-section">
      <div class="main-title">Professional Summary</div>
      <p style="font-size: 13px; color: #555;">${content.about.substring(0, 500)}</p>
    </div>
    ` : ''}
    
    ${content.experiences.length > 0 ? `
    <div class="main-section">
      <div class="main-title">Professional Experience</div>
      ${content.experiences.map(exp => `
        <div class="experience-item">
          <div class="job-header">
            <div>
              <div class="job-title">${exp.title || 'Job Title'}</div>
              <div class="company">${exp.company || 'Company'}</div>
            </div>
            <div class="duration">${exp.duration || ''}</div>
          </div>
          ${exp.bullets && exp.bullets.length > 0 ? `
          <ul class="bullets">
            ${exp.bullets.filter(b => b).map(bullet => `<li>${bullet}</li>`).join('')}
          </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
  </div>
</body>
</html>`;
        }
    };

    // Handle download
    const handleDownload = async () => {
        setIsGenerating(true);

        try {
            const html = generateResumeHTML(selectedTemplate);

            // Create a blob with the HTML
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            // Download as HTML (can be opened in browser and printed to PDF)
            const a = document.createElement('a');
            a.href = url;
            a.download = `resume-${selectedTemplate}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setGeneratedPDF(true);
        } catch (error) {
            console.error('Error generating resume:', error);
        }

        setIsGenerating(false);
    };

    // Handle preview
    const handlePreview = () => {
        const html = generateResumeHTML(selectedTemplate);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const template = TEMPLATES[selectedTemplate];

    return (
        <div className="glass rounded-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Resume Export</h2>
                    <p className="text-sm text-gray-400">Generate ATS-optimized resume from your profile</p>
                </div>
            </div>

            {/* Template Selection */}
            <div className="grid grid-cols-2 gap-4">
                {Object.values(TEMPLATES).map((tmpl) => (
                    <button
                        key={tmpl.id}
                        onClick={() => setSelectedTemplate(tmpl.id)}
                        className={`p-4 rounded-xl text-left transition-all ${selectedTemplate === tmpl.id
                                ? 'border-2 border-green-500 bg-green-500/10'
                                : 'border border-white/10 bg-white/5 hover:border-white/30'
                            }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{tmpl.name}</h3>
                            {selectedTemplate === tmpl.id && (
                                <Check className="w-5 h-5 text-green-400" />
                            )}
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{tmpl.description}</p>
                        <div className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400">ATS Score: {tmpl.atsScore}%</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Profile Summary */}
            <div className="bg-white/5 rounded-xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Resume will include:
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <span className={profile.headline ? 'text-green-400' : 'text-gray-500'}>
                            {profile.headline ? '✓' : '○'}
                        </span>
                        <span>Headline</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={profile.about ? 'text-green-400' : 'text-gray-500'}>
                            {profile.about ? '✓' : '○'}
                        </span>
                        <span>Summary</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={profile.experiences?.length > 0 ? 'text-green-400' : 'text-gray-500'}>
                            {profile.experiences?.length > 0 ? '✓' : '○'}
                        </span>
                        <span>{profile.experiences?.length || 0} Experience(s)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={profile.skills?.length > 0 ? 'text-green-400' : 'text-gray-500'}>
                            {profile.skills?.length > 0 ? '✓' : '○'}
                        </span>
                        <span>{profile.skills?.length || 0} Skills</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handlePreview}
                    className="flex-1 px-4 py-3 bg-white/10 rounded-xl font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                >
                    <Eye className="w-5 h-5" />
                    Preview
                </button>
                <button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Download HTML
                        </>
                    )}
                </button>
            </div>

            {generatedPDF && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                    <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-semibold">Resume downloaded!</p>
                    <p className="text-sm text-gray-400">Open in browser and use Print → Save as PDF</p>
                </div>
            )}

            {/* Tips */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="font-semibold text-blue-400 mb-2">💡 ATS Tips</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Minimalist template has 98% ATS compatibility</li>
                    <li>• Use standard section headers (Experience, Skills, Education)</li>
                    <li>• Avoid tables, images, and special characters</li>
                    <li>• Keywords from job description improve matching</li>
                </ul>
            </div>
        </div>
    );
}
