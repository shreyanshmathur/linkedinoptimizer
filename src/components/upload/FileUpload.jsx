import React, { useState, useCallback } from 'react';
import { Upload, FileText, Image, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function FileUpload({ onFilesProcessed, maxFiles = 20 }) {
    const [files, setFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const processFiles = async (newFiles) => {
        const validFiles = Array.from(newFiles).slice(0, maxFiles - files.length);

        const processedFiles = validFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            type: file.type.includes('pdf') ? 'pdf' : 'image',
            size: file.size,
            status: 'pending',
            preview: file.type.includes('image') ? URL.createObjectURL(file) : null
        }));

        setFiles(prev => [...prev, ...processedFiles]);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [files.length]);

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleProcess = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);

        // Update all files to processing status
        setFiles(prev => prev.map(f => ({ ...f, status: 'processing' })));

        try {
            // Process each file
            const extractedTexts = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                let text = '';

                try {
                    if (file.type === 'pdf') {
                        // PDF processing using pdf.js
                        text = await extractTextFromPDF(file.file);
                    } else {
                        // Image OCR using Tesseract
                        text = await extractTextFromImage(file.file);
                    }

                    extractedTexts.push({ file: file.name, text });

                    setFiles(prev => prev.map(f =>
                        f.id === file.id ? { ...f, status: 'success', extractedText: text } : f
                    ));
                } catch (error) {
                    console.error(`Error processing ${file.name}:`, error);
                    setFiles(prev => prev.map(f =>
                        f.id === file.id ? { ...f, status: 'error', error: error.message } : f
                    ));
                }
            }

            // Combine all extracted text and parse into profile sections
            const combinedText = extractedTexts.map(e => e.text).join('\n\n');
            const parsedProfile = parseLinkedInProfile(combinedText);

            onFilesProcessed?.(parsedProfile, combinedText);
        } catch (error) {
            console.error('Processing error:', error);
        }

        setIsProcessing(false);
    };

    return (
        <div className="glass rounded-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Upload Profile</h2>
                    <p className="text-sm text-gray-400">PDF or screenshots (max {maxFiles} files)</p>
                </div>
            </div>

            {/* Drop zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/20 hover:border-white/40'
                    }`}
            >
                <input
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                        <p className="font-semibold">Drag & drop files here</p>
                        <p className="text-sm text-gray-400">or click to browse</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>PDF</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Image className="w-4 h-4" />
                            <span>PNG, JPG</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* File list */}
            {files.length > 0 && (
                <div className="space-y-2">
                    <div className="text-sm text-gray-400 mb-2">
                        {files.length} file{files.length > 1 ? 's' : ''} selected
                    </div>

                    {files.map((file) => (
                        <div
                            key={file.id}
                            className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                        >
                            {file.preview ? (
                                <img src={file.preview} alt="" className="w-10 h-10 rounded object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded bg-red-500/20 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-red-400" />
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {file.status === 'processing' && (
                                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                )}
                                {file.status === 'success' && (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                )}
                                {file.status === 'error' && (
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                )}

                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="p-1 rounded hover:bg-white/10"
                                >
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Process button */}
            {files.length > 0 && (
                <button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing files...
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            Extract Profile Data
                        </>
                    )}
                </button>
            )}

            {/* Tips */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <h4 className="font-semibold text-purple-400 mb-2">📄 Tips for best results</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Export your LinkedIn profile as PDF for full data</li>
                    <li>• Screenshots should be clear and readable</li>
                    <li>• Include all sections you want analyzed</li>
                    <li>• Higher resolution = better OCR accuracy</li>
                </ul>
            </div>
        </div>
    );
}

// PDF text extraction using pdf.js
async function extractTextFromPDF(file) {
    try {
        // Import PDF.js with proper ESM syntax
        const pdfjs = await import('pdfjs-dist');

        // Set worker source - for pdfjs-dist v5+
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url
        ).toString();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n\n';
        }

        return fullText;
    } catch (error) {
        console.error('PDF extraction error:', error);
        // Fallback: try to read as text if PDF parsing fails
        try {
            const text = await file.text();
            return text;
        } catch {
            throw new Error('Could not extract text from PDF. Please try a different file.');
        }
    }
}

// Image OCR using OpenRouter Vision API for accurate text extraction
// Supports free/cheap vision models like Llama 3.2 Vision and Pixtral
async function extractTextFromImage(file) {
    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

    // Convert file to base64
    const reader = new FileReader();
    const base64Data = await new Promise((resolve, reject) => {
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const extractionPrompt = `Extract all text from this LinkedIn profile screenshot. Format the output as follows:

NAME: [Full name]
HEADLINE: [Professional headline]
LOCATION: [Location if visible]
ABOUT: [About/Summary section text]
EXPERIENCE:
- [Job Title] at [Company] ([Duration])
  [Description/bullets]
EDUCATION:
- [Degree] from [School] ([Year])
SKILLS: [skill1, skill2, skill3, ...]
CERTIFICATIONS: [cert1, cert2, ...]

Extract all visible text accurately. If a section is not visible, skip it.`;

    // If OpenRouter API key is available, use vision model
    if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_api_key') {
        try {
            // Try Llama 3.2 Vision first (cheap), fallback to Pixtral
            const models = [
                'meta-llama/llama-3.2-11b-vision-instruct',
                'mistralai/pixtral-12b',
                'meta-llama/llama-3.2-90b-vision-instruct'
            ];

            for (const model of models) {
                try {
                    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                            'HTTP-Referer': window.location.origin,
                            'X-Title': 'LinkedIn Profile Optimizer'
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: [
                                {
                                    role: 'user',
                                    content: [
                                        {
                                            type: 'text',
                                            text: extractionPrompt
                                        },
                                        {
                                            type: 'image_url',
                                            image_url: {
                                                url: `data:${file.type};base64,${base64Data}`
                                            }
                                        }
                                    ]
                                }
                            ],
                            max_tokens: 2000
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log(`✅ Image processed with ${model}`);
                        return data.choices[0].message.content;
                    }

                    // If model not available, try next one
                    console.log(`Model ${model} not available, trying next...`);
                } catch (modelError) {
                    console.log(`Model ${model} failed:`, modelError.message);
                }
            }

            throw new Error('All vision models failed');
        } catch (error) {
            console.error('OpenRouter Vision error:', error);
            console.log('Falling back to Tesseract OCR...');
        }
    }

    // Fallback: Use Tesseract.js (less accurate but works offline)
    try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');

        const dataUrl = `data:${file.type};base64,${base64Data}`;
        const result = await worker.recognize(dataUrl);
        await worker.terminate();

        return result.data.text;
    } catch (error) {
        console.error('Tesseract OCR error:', error);
        throw new Error('Could not extract text from image. Please add your OpenAI API key in .env for best results.');
    }
}

// Parse extracted text into LinkedIn profile sections
function parseLinkedInProfile(text) {
    const sections = {
        name: '',
        headline: '',
        location: '',
        about: '',
        experiences: [],
        education: [],
        skills: [],
        licenses: [],
        volunteering: [],
        recommendations: []
    };

    // Try to parse OpenAI's structured format first
    const nameMatch = text.match(/NAME:\s*(.+?)(?:\n|$)/i);
    const headlineMatch = text.match(/HEADLINE:\s*(.+?)(?:\n|$)/i);
    const locationMatch = text.match(/LOCATION:\s*(.+?)(?:\n|$)/i);
    const aboutMatch = text.match(/ABOUT:\s*([\s\S]*?)(?=\n(?:EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|$))/i);
    const skillsMatch = text.match(/SKILLS:\s*(.+?)(?:\n|$)/i);
    const certsMatch = text.match(/CERTIFICATIONS:\s*(.+?)(?:\n|$)/i);
    const expMatch = text.match(/EXPERIENCE:\s*([\s\S]*?)(?=\n(?:EDUCATION|SKILLS|CERTIFICATIONS|$))/i);
    const eduMatch = text.match(/EDUCATION:\s*([\s\S]*?)(?=\n(?:SKILLS|CERTIFICATIONS|EXPERIENCE|$))/i);

    // If OpenAI format detected, use it
    if (nameMatch || headlineMatch) {
        if (nameMatch) sections.name = nameMatch[1].trim();
        if (headlineMatch) sections.headline = headlineMatch[1].trim();
        if (locationMatch) sections.location = locationMatch[1].trim();
        if (aboutMatch) sections.about = aboutMatch[1].trim();
        if (skillsMatch) {
            sections.skills = skillsMatch[1].split(/[,;]/).map(s => s.trim()).filter(s => s.length > 1);
        }
        if (certsMatch) {
            sections.licenses = certsMatch[1].split(/[,;]/).map(s => ({
                id: Date.now() + Math.random(),
                name: s.trim(),
                issuer: '',
                date: ''
            })).filter(l => l.name.length > 1);
        }
        if (expMatch) {
            sections.experiences = parseExperiencesFromOpenAI(expMatch[1]);
        }
        if (eduMatch) {
            sections.education = parseEducationFromOpenAI(eduMatch[1]);
        }
        return sections;
    }

    // Fallback: Common section headers to look for
    const sectionPatterns = {
        about: /(?:about|summary)\s*\n([\s\S]*?)(?=\n(?:experience|education|skills|licenses|volunteering|$))/i,
        experience: /experience\s*\n([\s\S]*?)(?=\n(?:education|skills|licenses|volunteering|$))/i,
        education: /education\s*\n([\s\S]*?)(?=\n(?:skills|licenses|volunteering|certifications|$))/i,
        skills: /skills\s*\n([\s\S]*?)(?=\n(?:licenses|certifications|volunteering|recommendations|$))/i,
        licenses: /(?:licenses|certifications)\s*\n([\s\S]*?)(?=\n(?:volunteering|recommendations|$))/i,
        volunteering: /volunteering\s*\n([\s\S]*?)(?=\n(?:recommendations|$))/i
    };

    // Extract headline (usually at the top, after name)
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length > 0) {
        sections.name = lines[0].trim();
    }
    if (lines.length > 1) {
        sections.headline = lines[1].trim();
    }

    // Extract sections
    for (const [section, pattern] of Object.entries(sectionPatterns)) {
        const match = text.match(pattern);
        if (match) {
            if (section === 'about') {
                sections.about = match[1].trim();
            } else if (section === 'skills') {
                sections.skills = match[1].split(/[,\n•·]/).map(s => s.trim()).filter(s => s.length > 1);
            } else if (section === 'experience') {
                sections.experiences = parseExperiences(match[1]);
            } else if (section === 'education') {
                sections.education = parseEducation(match[1]);
            } else if (section === 'licenses') {
                sections.licenses = parseLicenses(match[1]);
            } else if (section === 'volunteering') {
                sections.volunteering = parseVolunteering(match[1]);
            }
        }
    }

    return sections;
}

// Parse experience from OpenAI structured format
function parseExperiencesFromOpenAI(text) {
    const experiences = [];
    const lines = text.split('\n').filter(l => l.trim());

    let current = null;
    for (const line of lines) {
        const lineMatch = line.match(/^-?\s*(.+?)\s+at\s+(.+?)(?:\s*\((.+?)\))?$/i);
        if (lineMatch) {
            if (current) experiences.push(current);
            current = {
                id: Date.now() + Math.random(),
                title: lineMatch[1].trim(),
                company: lineMatch[2].trim(),
                duration: lineMatch[3]?.trim() || '',
                bullets: []
            };
        } else if (current && line.trim()) {
            current.bullets.push(line.replace(/^[•·-]\s*/, '').trim());
        }
    }
    if (current) experiences.push(current);

    return experiences;
}

// Parse education from OpenAI structured format
function parseEducationFromOpenAI(text) {
    const education = [];
    const lines = text.split('\n').filter(l => l.trim());

    for (const line of lines) {
        const eduMatch = line.match(/^-?\s*(.+?)\s+from\s+(.+?)(?:\s*\((.+?)\))?$/i);
        if (eduMatch) {
            education.push({
                id: Date.now() + Math.random(),
                degree: eduMatch[1].trim(),
                school: eduMatch[2].trim(),
                year: eduMatch[3]?.trim() || '',
                field: ''
            });
        }
    }

    return education;
}

function parseExperiences(text) {
    // Simple parsing - can be enhanced
    const experiences = [];
    const blocks = text.split(/\n(?=[A-Z])/);

    for (const block of blocks) {
        const lines = block.split('\n').filter(l => l.trim());
        if (lines.length >= 2) {
            experiences.push({
                id: Date.now() + Math.random(),
                title: lines[0].trim(),
                company: lines[1]?.trim() || '',
                duration: lines[2]?.trim() || '',
                bullets: lines.slice(3).map(l => l.replace(/^[•·-]\s*/, '').trim()).filter(l => l)
            });
        }
    }

    return experiences;
}

function parseEducation(text) {
    const education = [];
    const blocks = text.split(/\n(?=[A-Z])/);

    for (const block of blocks) {
        const lines = block.split('\n').filter(l => l.trim());
        if (lines.length >= 1) {
            education.push({
                id: Date.now() + Math.random(),
                school: lines[0].trim(),
                degree: lines[1]?.trim() || '',
                field: lines[2]?.trim() || '',
                year: lines[3]?.trim() || ''
            });
        }
    }

    return education;
}

function parseLicenses(text) {
    const licenses = [];
    const blocks = text.split(/\n(?=[A-Z])/);

    for (const block of blocks) {
        const lines = block.split('\n').filter(l => l.trim());
        if (lines.length >= 1) {
            licenses.push({
                id: Date.now() + Math.random(),
                name: lines[0].trim(),
                issuer: lines[1]?.trim() || '',
                date: lines[2]?.trim() || ''
            });
        }
    }

    return licenses;
}

function parseVolunteering(text) {
    const volunteering = [];
    const blocks = text.split(/\n(?=[A-Z])/);

    for (const block of blocks) {
        const lines = block.split('\n').filter(l => l.trim());
        if (lines.length >= 1) {
            volunteering.push({
                id: Date.now() + Math.random(),
                role: lines[0].trim(),
                organization: lines[1]?.trim() || '',
                description: lines.slice(2).join(' ').trim()
            });
        }
    }

    return volunteering;
}
