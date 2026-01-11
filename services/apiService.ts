import { CvReview, ImprovedCv } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface UploadResponse {
    success: boolean;
    cvText: string;
    review: CvReview;
    error?: string;
}

interface RewriteResponse {
    success: boolean;
    improvedCv: ImprovedCv;
    error?: string;
}

interface AnalyzeImageResponse {
    success: boolean;
    result: string;
    error?: string;
}


export async function uploadAndReviewCv(file: File, language: string): Promise<{ cvText: string; review: CvReview }> {
    const formData = new FormData();
    formData.append('cvFile', file);
    formData.append('language', language);

    const response = await fetch(`${API_BASE_URL}/api/cv/upload`, {
        method: 'POST',
        body: formData,
    });

    const data: UploadResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload and review CV.');
    }

    return { cvText: data.cvText, review: data.review };
}


export async function rewriteCv(input: { cvText: string; targetRole?: string; language?: string }): Promise<ImprovedCv> {
    const response = await fetch(`${API_BASE_URL}/api/cv/rewrite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
    });
    
    const data: RewriteResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to rewrite CV.');
    }

    return data.improvedCv;
}

export async function analyzeImage(prompt: string, imageBase64: string, mimeType: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/image/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, imageBase64, mimeType }),
    });

    const data: AnalyzeImageResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze image.');
    }

    return data.result;
}