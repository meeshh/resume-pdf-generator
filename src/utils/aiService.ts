import type { ResumeData } from "../types/ResumeData";

export interface AIProviderConfig {
  openaiKey?: string;
  geminiKey?: string;
}

export interface ATSAnalysisResult {
  score: number;
  foundKeywords: string[];
  missingKeywords: string[];
  suggestions: {
    section: string;
    original: string;
    suggested: string;
    reason: string;
    type: "paraphrase" | "add" | "remove";
  }[];
  overallFeedback: string;
}

const SYSTEM_PROMPT = `You are a professional resume writer. 
Convert the provided data into a valid JSON object following the specified schema.
Use basic HTML tags (<b>, <i>, <ul>, <li>, <p>) in 'summary' and 'body' fields.
Respond ONLY with the JSON object.`;

export const getAIConfig = (): AIProviderConfig => ({
  openaiKey: localStorage.getItem("resumint_openai_key") || undefined,
  geminiKey: localStorage.getItem("resumint_gemini_key") || undefined,
});

export const saveAIConfig = (config: AIProviderConfig) => {
  if (config.openaiKey)
    localStorage.setItem("resumint_openai_key", config.openaiKey);
  if (config.geminiKey)
    localStorage.setItem("resumint_gemini_key", config.geminiKey);
};

export const clearAIConfig = () => {
  localStorage.removeItem("resumint_openai_key");
  localStorage.removeItem("resumint_gemini_key");
};

async function callOpenAI(prompt: string, apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API request failed");
  }

  const result = await response.json();
  return JSON.parse(result.choices[0].message.content);
}

async function callGemini(prompt: string, apiKey: string) {
  // Use the most compatible and current model names and endpoints
  const attempts = [
    { version: "v1", model: "gemini-2.5-flash" },
    { version: "v1", model: "gemini-flash-latest" },
    { version: "v1", model: "gemini-2.0-flash" },
    { version: "v1beta", model: "gemini-2.5-flash" },
  ];

  let lastError: { status?: number; message?: string } | null = null;

  for (const attempt of attempts) {
    try {
      // Using ?key= is the most universal method for browser fetch
      const response = await fetch(
        `https://generativelanguage.googleapis.com/${attempt.version}/models/${attempt.model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }] }],
            // Removed generationConfig for maximum compatibility across all free-tier regions
          }),
        },
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorBody.error?.message || response.statusText,
        };
      }

      const result = await response.json();
      let text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error("Empty response from AI");

      // Manually extract JSON from the text response
      // This handles cases where the AI wraps JSON in ```json blocks
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }

      return JSON.parse(text);
    } catch (e: unknown) {
      const error = e as { status?: number; message?: string };
      console.warn(
        `Attempt with ${attempt.model} (${attempt.version}) failed:`,
        error.message,
      );
      lastError = error;
      if (error.status === 401 || error.status === 403) break; // Don't retry on auth errors
    }
  }

  throw new Error(
    lastError?.status === 404
      ? "Gemini API could not find the model. Please ensure your API key is from Google AI Studio (aistudio.google.com) and the 'Generative Language API' is enabled."
      : `Gemini Error: ${lastError?.message || "Connection failed"}`,
  );
}

export async function optimizeResume(
  rawText: string,
  schema: string,
  currentLabels: ResumeData["labels"],
  provider: "openai" | "gemini",
): Promise<ResumeData> {
  const config = getAIConfig();
  const apiKey = provider === "openai" ? config.openaiKey : config.geminiKey;

  if (!apiKey) {
    throw new Error(
      `${provider === "openai" ? "OpenAI" : "Gemini"} API key is missing`,
    );
  }

  const prompt = `Convert the following unstructured resume data into a valid JSON object that strictly follows this schema:

${schema}

IMPORTANT RULES:
1. Use basic HTML tags (<b>, <i>, <ul>, <li>, <p>) in 'summary' and 'body' fields.
2. Keep labels consistent with: ${JSON.stringify(currentLabels)}
3. If data is missing, use empty strings/arrays.

HERE IS THE DATA TO CONVERT:
---
${rawText}
---`;

  if (provider === "openai") {
    return await callOpenAI(prompt, apiKey);
  } else {
    return await callGemini(prompt, apiKey);
  }
}

export async function analyzeATS(
  resumeData: ResumeData,
  jobDescription: string,
  provider: "openai" | "gemini",
): Promise<ATSAnalysisResult> {
  const config = getAIConfig();
  const apiKey = provider === "openai" ? config.openaiKey : config.geminiKey;

  if (!apiKey) {
    throw new Error(
      `${provider === "openai" ? "OpenAI" : "Gemini"} API key is missing`,
    );
  }

  const prompt = `Analyze the following resume against the provided job description for ATS (Applicant Tracking System) compatibility.
  
  RESUME DATA (JSON):
  ${JSON.stringify(resumeData)}
  
  JOB DESCRIPTION:
  ${jobDescription}
  
  Provide a JSON response with the following schema:
  {
    "score": number (0-100),
    "foundKeywords": string[],
    "missingKeywords": string[],
    "suggestions": [
      {
        "section": string (e.g., "Summary", "Experience", "Skills"),
        "original": string (the text to change or reference),
        "suggested": string (the new text or addition),
        "reason": string (why this change helps),
        "type": "paraphrase" | "add" | "remove"
      }
    ],
    "overallFeedback": string
  }
  
  IMPORTANT: Suggestions for "Experience" or "Summary" sections should include basic HTML tags (<b>, <ul>, <li>) if appropriate.`;

  if (provider === "openai") {
    return await callOpenAI(prompt, apiKey);
  } else {
    return await callGemini(prompt, apiKey);
  }
}
