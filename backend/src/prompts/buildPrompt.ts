/**
 * @file Utility functions for building complete Gemini prompts from templates.
 * @description These helpers take raw data (like CV text) and safely inject it into the
 * prompt templates from `cvPrompts.ts`. This prevents injection issues and centralizes
 * the logic for constructing prompts with context.
 */

import { CV_REVIEW_PROMPT, CV_REWRITE_PROMPT, JD_MATCH_PROMPT } from './cvPrompts';

/**
 * Builds the complete prompt for the CV review task.
 * @param cvText - The raw text content of the user's CV.
 * @param language - The language for the AI's response (e.g., 'en', 'zh').
 * @returns A formatted prompt string ready to be sent to the Gemini API.
 */
export function buildReviewPrompt(cvText: string, language: string = 'en'): string {
    if (cvText.includes('---')) {
        throw new Error("CV text cannot contain the '---' sequence.");
    }
    return CV_REVIEW_PROMPT
        .replace('{{CV_TEXT}}', cvText)
        .replace('{{LANGUAGE}}', language);
}

/**
 * Builds the complete prompt for the CV rewrite task, including optional context.
 * @param input - An object containing cvText, and optional targetRole, jobDescription, and language.
 * @returns A formatted prompt string ready to be sent to the Gemini API.
 */
export function buildRewritePrompt(input: {
    cvText: string;
    targetRole?: string;
    jobDescription?: string;
    language?: string;
}): string {
    const { cvText, targetRole, jobDescription, language = 'en' } = input;
    if (cvText.includes('---')) {
        throw new Error("CV text cannot contain the '---' sequence.");
    }

    let additionalContext = '';
    if (targetRole || jobDescription) {
        let contextParts = ['\n**Additional Context for Tailoring:**'];
        if (targetRole) {
            contextParts.push(`- Target Role: ${targetRole}`);
        }
        if (jobDescription) {
            const truncatedJd = jobDescription.length > 500 ? `${jobDescription.substring(0, 500)}...` : jobDescription;
            contextParts.push(`- Job Description Snippet: ${truncatedJd}`);
        }
        additionalContext = contextParts.join('\n');
    }

    return CV_REWRITE_PROMPT
        .replace('{{ADDITIONAL_CONTEXT}}', additionalContext)
        .replace('{{CV_TEXT}}', cvText)
        .replace('{{LANGUAGE}}', language);
}


/**
 * Builds the complete prompt for matching a CV against a job description.
 * @param cvText - The raw text content of the user's CV.
 * @param jobDescription - The raw text of the job description to compare against.
 * @returns A formatted prompt string ready to be sent to the Gemini API.
 */
export function buildJobMatchPrompt(cvText: string, jobDescription: string): string {
    if (cvText.includes('---') || jobDescription.includes('---')) {
        throw new Error("Input text cannot contain the '---' sequence.");
    }
    return JD_MATCH_PROMPT
        .replace('{{CV_TEXT}}', cvText)
        .replace('{{JOB_DESCRIPTION}}', jobDescription);
}
