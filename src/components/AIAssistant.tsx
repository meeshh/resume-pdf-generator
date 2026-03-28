import {
  Bot,
  Copy,
  ExternalLink,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import type { ResumeData } from "../types/ResumeData";

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateData: (newData: ResumeData) => void;
  currentData: ResumeData;
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

const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  onClose,
  onUpdateData,
  currentData,
}) => {
  const [rawText, setRawText] = useState("");
  const [pastedJson, setPastedJson] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const generatePrompt = () => {
    return `You are a professional resume writer. 
Convert the following unstructured resume data into a valid JSON object that strictly follows this schema:

${JSON_SCHEMA}

IMPORTANT RULES:
1. Respond ONLY with the JSON object. No pre-amble, no explanations.
2. Use basic HTML tags (<b>, <i>, <ul>, <li>, <p>) in the 'summary' and 'body' fields to ensure professional formatting.
3. If data is missing, use empty strings or empty arrays as per the schema.
4. Keep the 'labels' object consistent with: ${JSON.stringify(currentData.labels, null, 2)}

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
        : `https://gemini.google.com/app?prompt=${prompt}`;
    window.open(url, "_blank");
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
      onUpdateData(parsed);
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-100 flex items-center justify-center p-4 sm:p-8">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-xl">
              <Bot size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                AI Resume Assistant
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                No token needed • Use your own free AI account
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
          {/* Step 1: Input */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-black">
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
                className="w-full h-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
              />
              {rawText && (
                <button
                  type="button"
                  onClick={() => setRawText("")}
                  className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                type="button"
                onClick={() => openAI("chatgpt")}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95"
              >
                <ExternalLink size={14} />
                OPEN CHATGPT
              </button>
              <button
                type="button"
                onClick={() => openAI("gemini")}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95"
              >
                <Sparkles size={14} />
                OPEN GEMINI
              </button>
            </div>
            <button
              type="button"
              onClick={copyPrompt}
              className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-600"
            >
              <Copy size={14} />
              COPY PROMPT INSTEAD
            </button>
          </div>

          {/* Divider for Desktop */}
          <div className="hidden lg:block w-px bg-slate-800 self-stretch" />

          {/* Step 2: Result */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
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
                className={`w-full h-full bg-slate-950 border ${error ? "border-red-500/50" : "border-slate-700"} rounded-xl p-4 text-blue-400 font-mono text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all resize-none`}
              />
              {error && (
                <div className="absolute bottom-2 left-2 right-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg text-[10px] text-red-400 font-bold animate-pulse">
                  {error}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleImport}
              disabled={!pastedJson.trim()}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-black transition-all shadow-xl active:scale-95 mt-2"
            >
              <Upload size={18} />
              UPDATE RESUME DATA
            </button>
            <p className="text-[10px] text-slate-500 text-center leading-relaxed italic">
              This will replace your current editor content with the new data.
              You can always undo in the editor if needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
