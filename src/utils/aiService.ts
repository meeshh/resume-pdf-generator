import type { ResumeData } from "../types/ResumeData";

export interface AIProviderConfig {
  openaiKey?: string;
  geminiKey?: string;
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
  if (config.openaiKey) localStorage.setItem("resumint_openai_key", config.openaiKey);
  if (config.geminiKey) localStorage.setItem("resumint_gemini_key", config.geminiKey);
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
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${SYSTEM_PROMPT}\n\n${prompt}` },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Gemini API request failed");
  }

  const result = await response.json();
  const text = result.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}

export async function optimizeResume(
  rawText: string,
  schema: string,
  currentLabels: any,
  provider: "openai" | "gemini"
): Promise<ResumeData> {
  const config = getAIConfig();
  const apiKey = provider === "openai" ? config.openaiKey : config.geminiKey;

  if (!apiKey) {
    throw new Error(`${provider === "openai" ? "OpenAI" : "Gemini"} API key is missing`);
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
