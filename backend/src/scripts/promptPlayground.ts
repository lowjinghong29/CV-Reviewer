// Fix: Add a triple-slash directive to include Node.js types, fixing errors related to 'process' and '__dirname'.
/// <reference types="node" />

import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import * as path from "path";
import { buildReviewPrompt, buildRewritePrompt, buildJobMatchPrompt } from "../prompts/buildPrompt";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Fix: Use the standard 'API_KEY' environment variable as per the coding guidelines.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        },
    },
};

const rewriteSchema = {
    type: Type.OBJECT,
    properties: {
      header: { type: Type.OBJECT },
      summary: { type: Type.STRING },
      skills: { type: Type.ARRAY, items: { type: Type.STRING } },
      experience: { type: Type.ARRAY, items: { type: Type.OBJECT } },
      education: { type: Type.ARRAY, items: { type: Type.OBJECT } },
      projects: { type: Type.ARRAY, items: { type: Type.OBJECT } },
      extracurriculars: { type: Type.ARRAY, items: { type: Type.OBJECT } },
    },
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
};


async function callGemini(prompt: string, schema: any) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema,
                temperature: 0.2,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API. The prompt may be invalid or the service may be down.", error);
        throw error; // Re-throw the error to be caught by the main execution block
    }
}

function validateResponse(data: any, schema: any) {
    console.log("\n--- Validating Response ---");
    let isValid = true;
    for (const key in schema.properties) {
        if (data[key] === undefined) {
            console.warn(`[WARNING] Missing key: ${key}`);
            isValid = false;
        }
    }
    if (isValid) {
        console.log("[SUCCESS] All top-level keys are present.");
    }
    return isValid;
}

async function main() {
  const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.split('=');
    acc[key.replace('--', '')] = value;
    return acc;
  }, {} as Record<string, string>);

  const { mode, cv, jd, lang } = args;

  if (!mode || !cv) {
    console.error("Usage: npm run prompt:play -- --mode=<review|rewrite|match> --cv=<path_to_cv.txt> [--jd=<path_to_jd.txt>] [--lang=<en|zh>]");
    process.exit(1);
  }

  const cvPath = path.resolve(__dirname, '..', '..', 'samples', cv);
  const cvText = await fs.readFile(cvPath, 'utf-8');
  console.log(`Loaded CV from: ${cvPath}`);

  let prompt;
  let schema;
  let jdText = '';

  if (jd) {
    const jdPath = path.resolve(__dirname, '..', '..', 'samples', jd);
    jdText = await fs.readFile(jdPath, 'utf-8');
    console.log(`Loaded JD from: ${jdPath}`);
  }

  switch (mode) {
    case 'review':
      console.log("--- Running CV Review Prompt ---");
      prompt = buildReviewPrompt(cvText, lang);
      schema = reviewSchema;
      break;

    case 'rewrite':
      console.log("--- Running CV Rewrite Prompt ---");
      prompt = buildRewritePrompt({ cvText, jobDescription: jdText || undefined, language: lang });
      schema = rewriteSchema;
      break;

    case 'match':
      console.log("--- Running CV Match Prompt ---");
      if (!jdText) {
        console.error("Error: --jd parameter is required for 'match' mode.");
        process.exit(1);
      }
      prompt = buildJobMatchPrompt(cvText, jdText);
      schema = matchSchema;
      break;

    default:
      console.error(`Unknown mode: ${mode}`);
      process.exit(1);
  }

  const rawResponse = await callGemini(prompt, schema);
  console.log("\n--- Raw Gemini Response ---");
  console.log(rawResponse);

  try {
    const parsedJson = JSON.parse(rawResponse);
    console.log("\n--- Parsed JSON Response ---");
    console.log(JSON.stringify(parsedJson, null, 2));
    validateResponse(parsedJson, schema);
  } catch (error) {
    console.error("\n--- JSON Parsing Failed ---");
    console.error("The response from the model was not valid JSON.");
  }
}

main().catch(error => {
    console.error("\n--- Playground script failed ---");
    // The specific error is already logged in the `callGemini` function
    process.exit(1);
});