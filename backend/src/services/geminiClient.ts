/**
 * @file Service layer for interacting with the Google Gemini API.
 * @description This file encapsulates all logic for calling the Gemini models,
 * including prompt construction, API calls, and response parsing/validation.
 */

import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";
import * as path from "path";
import { buildReviewPrompt, buildRewritePrompt, buildJobMatchPrompt } from '../prompts/buildPrompt';
import { CvReviewResult, ImprovedCv, CvJobMatchResult } from '../types';

// Load environment variables from the root of the backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set for the backend.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Response Schemas ---
// These schemas ensure that the Gemini API returns data in the expected JSON format.

const reviewSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.INTEGER },
        overallSummary: { type: Type.STRING },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        sectionFeedback: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.ARRAY, items: { type: Type.STRING } },
                experience: { type: Type.ARRAY, items: { type: Type.STRING } },
                education: { type: Type.ARRAY, items: { type: Type.STRING } },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                projects: { type: Type.ARRAY, items: { type: Type.STRING } },
                other: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['summary', 'experience', 'education', 'skills', 'projects', 'other']
        },
    },
    required: ['score', 'overallSummary', 'strengths', 'weaknesses', 'sectionFeedback']
};

const rewriteSchema = {
    type: Type.OBJECT,
    properties: {
      header: {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING }, email: { type: Type.STRING }, phone: { type: Type.STRING },
          location: { type: Type.STRING }, linkedin: { type: Type.STRING }, portfolio: { type: Type.STRING },
        },
        required: ['fullName', 'email'],
      },
      summary: { type: Type.STRING },
      skills: { type: Type.ARRAY, items: { type: Type.STRING } },
      experience: { type: Type.ARRAY, items: { type: Type.OBJECT } },
      education: { type: Type.ARRAY, items: { type: Type.OBJECT } },
      projects: { type: Type.ARRAY, items: { type: Type.OBJECT } },
      extracurriculars: { type: Type.ARRAY, items: { type: Type.OBJECT } },
    },
    required: ['header', 'summary', 'skills', 'experience', 'education', 'projects'],
};

const matchSchema = {
    type: Type.OBJECT,
    properties: {
        fitScore: { type: Type.INTEGER },
        matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommendedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        tailoringAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['fitScore', 'matchedSkills', 'missingSkills', 'recommendedKeywords', 'tailoringAdvice']
};

/**
 * A generic helper to call the Gemini API with a prompt and a response schema.
 * It handles the API call, response parsing, and error handling.
 * @param prompt The complete prompt string to send to the model.
 * @param schema The response schema for structured JSON output.
 * @returns A promise that resolves to the parsed JSON object of type T.
 */
async function callGeminiAndParseJson<T>(prompt: string, schema: any): Promise<T> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
                temperature: 0.2, // Lower temperature for more deterministic and factual JSON output
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as T;
    } catch (error) {
        console.error("Error in callGeminiAndParseJson:", error);
        throw new Error("Failed to process request with the AI model. The model may be unavailable or the input was invalid.");
    }
}


/**
 * Reviews a CV by sending its text content to the Gemini API.
 * @param cvText The raw text extracted from the user's CV.
 * @param language The language for the AI's response.
 * @returns A promise that resolves to a structured `CvReviewResult` object.
 */
export async function reviewCvWithGemini(cvText: string, language: string = 'en'): Promise<CvReviewResult> {
    const prompt = buildReviewPrompt(cvText, language);
    return callGeminiAndParseJson<CvReviewResult>(prompt, reviewSchema);
}

/**
 * Rewrites a CV by sending its text and optional context to the Gemini API.
 * @param input An object containing the CV text and optional target role/job description.
 * @returns A promise that resolves to a structured `ImprovedCv` object.
 */
export async function rewriteCvWithGemini(input: {
  cvText: string;
  targetRole?: string;
  jobDescription?: string;
  language?: string;
}): Promise<ImprovedCv> {
    const prompt = buildRewritePrompt(input);
    return callGeminiAndParseJson<ImprovedCv>(prompt, rewriteSchema);
}

/**
 * Matches a CV against a job description using the Gemini API.
 * @param cvText The raw text of the user's CV.
 * @param jobDescription The raw text of the job description.
 * @returns A promise that resolves to a structured `CvJobMatchResult` object.
 */
export async function jobMatchWithGemini(cvText: string, jobDescription: string): Promise<CvJobMatchResult> {
    const prompt = buildJobMatchPrompt(cvText, jobDescription);
    return callGeminiAndParseJson<CvJobMatchResult>(prompt, matchSchema);
}

/**
 * Analyzes an image with a given prompt using the Gemini API.
 * @param prompt The text prompt to guide the image analysis.
 * @param imageBase64 The base64-encoded image data.
 * @param mimeType The MIME type of the image (e.g., 'image/jpeg').
 * @returns A promise that resolves to the text-based analysis from the model.
 */
export async function analyzeImageWithGemini(prompt: string, imageBase64: string, mimeType: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { data: imageBase64, mimeType } }
                ]
            }]
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing image with Gemini:", error);
        throw new Error("Failed to analyze image. Ensure the file is a supported format and try again.");
    }
}