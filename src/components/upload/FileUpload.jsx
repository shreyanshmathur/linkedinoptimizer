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
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
    }

    return fullText;
}

// Image OCR using Tesseract.js
async function extractTextFromImage(file) {
    const Tesseract = await import('tesseract.js');

    const result = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m)
    });

    return result.data.text;
}

// Parse extracted text into LinkedIn profile sections
function parseLinkedInProfile(text) {
    const sections = {
        name: '',
        headline: '',
        about: '',
        experiences: [],
        education: [],
        skills: [],
        licenses: [],
        volunteering: [],
        recommendations: []
    };

    // Common section headers to look for
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
