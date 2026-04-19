import {
  Bot,
  Copy,
  ExternalLink,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useResumeStore } from "../store/useResumeStore";
import {
  type AIProviderConfig,
  getAIConfig,
  optimizeResume,
} from "../utils/aiService";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const JSON_SCHEMA = `
{
  "personal": {
    "firstName": "string",
    "lastName": "string",
    "title": "string",
    "location": "string",
    "email": "string",
    "mobile": "string",
    "photoUrl": "string (optional URL or base64)",
    "summary": "string (HTML supported, use <b>, <ul>, <li> for formatting)"
  },
  "labels": {
    "workExperience": "string",
    "skills": "string",
    "otherSkills": "string",
    "education": "string",
    "certifications": "string",
    "languages": "string",
    "present": "string"
  },
  "professionalExperiences": [
    {
      "id": "string (unique)",
      "title": "string",
      "organization": "string",
      "startDate": "string",
      "endDate": "string (optional, or 'Present')",
      "body": "string (HTML supported, use <ul> and <li> for bullet points)"
    }
  ],
  "techSkills": [{ "id": "string", "name": "string", "knowledge": "number (0-100)" }],
  "softSkills": [{ "id": "string", "name": "string", "knowledge": "number (0-100)" }],
  "otherSkills": [{ "id": "string", "body": "string (HTML supported)" }],
  "educations": [
    {
      "id": "string",
      "degree": "string",
      "organization": "string",
      "startYear": "string",
      "endYear": "string"
    }
  ],
  "certifications": [
    {
      "id": "string",
      "certification": "string",
      "issuer": "string",
      "completionYear": "string",
      "url": "string (optional)",
      "credentialId": "string (optional)"
    }
  ],
  "languages": [{ "id": "string", "language": "string", "level": "number (1-5)" }]
}
`;

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const { data, setData } = useResumeStore();
  const [rawText, setRawText] = useState("");
  const [pastedJson, setPastedJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(getAIConfig());

  useEffect(() => {
    if (isOpen) {
      setAiConfig(getAIConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generatePrompt = () => {
    return `You are a professional resume writer. 
Convert the following unstructured resume data into a valid JSON object that strictly follows this schema:

${JSON_SCHEMA}

IMPORTANT RULES:
1. Respond ONLY with the JSON object. No pre-amble, no explanations.
2. Use basic HTML tags (<b>, <i>, <ul>, <li>, <p>) in the 'summary' and 'body' fields to ensure professional formatting.
3. If data is missing, use empty strings or empty arrays as per the schema.
4. Keep the 'labels' object consistent with: ${JSON.stringify(data.labels, null, 2)}

HERE IS THE DATA TO CONVERT:
---
${rawText || "No data provided yet."}
---`;
  };

  const copyPrompt = () => {
    const prompt = generatePrompt();
    navigator.clipboard.writeText(prompt);
    alert("Prompt copied! Now paste it into ChatGPT or Gemini.");
  };

  const openAI = (platform: "chatgpt" | "gemini") => {
    const prompt = encodeURIComponent(generatePrompt());
    const url =
      platform === "chatgpt"
        ? `https://chatgpt.com/?q=${prompt}`
        : `https://gemini.google.com/app`;
    window.open(url, "_blank");
  };

  const handleAIDirect = async (provider: "openai" | "gemini") => {
    if (!rawText.trim()) {
      setError("Please paste some source info first.");
      return;
    }

    setIsOptimizing(true);
    setError(null);
    try {
      const optimizedData = await optimizeResume(
        rawText,
        JSON_SCHEMA,
        data.labels,
        provider,
      );
      setData(optimizedData);
      setRawText("");
      setPastedJson("");
      setError(null);
      onClose();
    } catch (e: unknown) {
      const error = e as Error;
      setError(
        error.message ||
          "AI optimization failed. Please try again or use manual import.",
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleImport = () => {
    try {
      // Basic cleanup of common AI output mistakes (like code blocks)
      let cleanJson = pastedJson.trim();
      if (cleanJson.startsWith("```json")) {
        cleanJson = cleanJson.replace(/```json\n?/, "").replace(/\n?```/, "");
      } else if (cleanJson.startsWith("```")) {
        cleanJson = cleanJson.replace(/```\n?/, "").replace(/\n?```/, "");
      }

      const parsed = JSON.parse(cleanJson);
      setData(parsed);
      setRawText("");
      setPastedJson("");
      setError(null);
      onClose();
    } catch (_e) {
      setError(
        "Invalid JSON. Make sure you copied the entire object correctly.",
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md z-100 flex items-center justify-center p-4 sm:p-8">
      <div className="bg-surface-bg border border-border-base rounded w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-base flex justify-between items-center bg-surface-bg">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded">
              <Bot
                size={24}
                className="text-emerald-500 dark:text-emerald-400"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-main tracking-tight">
                AI Resume Assistant
              </h2>
              <p className="text-xs text-text-muted font-medium">
                Optional Direct API Support • Use your own keys
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 enabled:hover:bg-slate-100 dark:enabled:hover:bg-slate-700 rounded-full transition-colors text-text-muted enabled:hover:text-text-main cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
          {/* Step 1: Input */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 mb-1">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-black">
                1
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wider">
                Paste Source Info
              </h3>
            </div>
            <div className="relative flex-1 min-h-[200px]">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your current resume, LinkedIn profile text, or just describe your experience..."
                className="w-full h-full bg-white dark:bg-slate-950 border border-border-base rounded p-4 text-text-main text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none custom-scrollbar"
              />
              {rawText && (
                <button
                  type="button"
                  onClick={() => setRawText("")}
                  className="absolute top-2 right-2 p-1.5 bg-slate-100 dark:bg-slate-800 enabled:hover:bg-red-500/10 dark:enabled:hover:bg-red-500/20 text-text-muted enabled:hover:text-red-600 dark:enabled:hover:text-red-400 rounded transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="space-y-3 mt-2">
              {/* Direct API Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAIDirect("openai")}
                  disabled={!aiConfig.openaiKey || isOptimizing}
                  className="group relative flex items-center justify-center gap-2 bg-emerald-600 enabled:hover:bg-emerald-500 disabled:bg-slate-200/50 dark:disabled:bg-slate-900/50 disabled:text-slate-400 dark:disabled:text-slate-600 text-white py-2.5 rounded text-xs font-bold transition-all shadow-lg active:scale-95 enabled:cursor-pointer disabled:cursor-not-allowed"
                >
                  {isOptimizing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Zap
                      size={14}
                      className={aiConfig.openaiKey ? "text-yellow-300" : ""}
                    />
                  )}
                  {aiConfig.openaiKey ? "DIRECT OPTIMIZE (GPT)" : "NO GPT KEY"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAIDirect("gemini")}
                  disabled={!aiConfig.geminiKey || isOptimizing}
                  className="group relative flex items-center justify-center gap-2 bg-emerald-600 enabled:hover:bg-emerald-500 disabled:bg-slate-200/50 dark:disabled:bg-slate-900/50 disabled:text-slate-400 dark:disabled:text-slate-600 text-white py-2.5 rounded text-xs font-bold transition-all shadow-lg active:scale-95 enabled:cursor-pointer disabled:cursor-not-allowed"
                >
                  {isOptimizing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Zap
                      size={14}
                      className={aiConfig.geminiKey ? "text-yellow-300" : ""}
                    />
                  )}
                  {aiConfig.geminiKey
                    ? "DIRECT OPTIMIZE (GEMINI)"
                    : "NO GEMINI KEY"}
                </button>
              </div>

              {/* Manual Browser Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => openAI("chatgpt")}
                  className="flex items-center justify-center gap-2 bg-surface-bg enabled:hover:bg-slate-100 dark:enabled:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 border border-border-base py-2.5 rounded text-xs font-bold transition-all cursor-pointer"
                >
                  <ExternalLink size={14} />
                  OPEN CHATGPT
                </button>
                <button
                  type="button"
                  onClick={() => openAI("gemini")}
                  className="flex items-center justify-center gap-2 bg-surface-bg enabled:hover:bg-slate-100 dark:enabled:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 border border-border-base py-2.5 rounded text-xs font-bold transition-all cursor-pointer"
                >
                  <Sparkles size={14} />
                  OPEN GEMINI
                </button>
              </div>

              <button
                type="button"
                onClick={copyPrompt}
                className="w-full flex items-center justify-center gap-2 bg-app-bg enabled:hover:bg-slate-200 dark:enabled:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-2.5 rounded text-xs font-bold transition-all border border-border-base cursor-pointer"
              >
                <Copy size={14} />
                COPY PROMPT
              </button>
            </div>
          </div>

          {/* Divider for Desktop */}
          <div className="hidden lg:block w-px bg-border-base self-stretch" />

          {/* Step 2: Result */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400 mb-1">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] font-black">
                2
              </div>
              <h3 className="font-bold text-sm uppercase tracking-wider">
                Import Result
              </h3>
            </div>
            <div className="relative flex-1 min-h-[200px]">
              <textarea
                value={pastedJson}
                onChange={(e) => {
                  setPastedJson(e.target.value);
                  setError(null);
                }}
                placeholder="Paste the JSON code block from AI here..."
                className={`w-full h-full bg-white dark:bg-slate-950 border ${error ? "border-red-500/50" : "border-border-base"} rounded p-4 text-emerald-600 dark:text-emerald-400 font-mono text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none custom-scrollbar`}
              />
              {error && (
                <div className="absolute bottom-2 left-2 right-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded text-[10px] text-red-600 dark:text-red-400 font-bold animate-pulse">
                  {error}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleImport}
              disabled={!pastedJson.trim() || isOptimizing}
              className="flex items-center justify-center gap-2 bg-purple-600 enabled:hover:bg-purple-500 disabled:bg-slate-200/50 dark:disabled:bg-slate-900/50 disabled:text-slate-400 dark:disabled:text-slate-600 text-white py-3 rounded text-sm font-black transition-all shadow-xl active:scale-95 mt-2 enabled:cursor-pointer disabled:cursor-not-allowed"
            >
              <Upload size={18} />
              UPDATE RESUME DATA
            </button>
            <p className="text-[10px] text-text-muted text-center leading-relaxed italic">
              AI direct optimization will replace your current data
              automatically. Manual paste requires clicking "Update Resume
              Data".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
