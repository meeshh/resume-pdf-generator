import { Editor } from "@monaco-editor/react";
import { PDFViewer } from "@react-pdf/renderer";
import {
  Bot,
  Check,
  Copy,
  FileJson,
  FileText,
  RefreshCw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AIAssistant from "./components/AIAssistant";
import FormEditor from "./components/FormEditor";
import OnboardingTour from "./components/OnboardingTour";
import ATSPDF from "./components/PDF/ATSPDF";
import ExecutiveTemplate from "./components/PDF/ExecutiveTemplate";
import MinimalTemplate from "./components/PDF/MinimalTemplate";
import ModernTemplate from "./components/PDF/ModernTemplate";
import VerticalTemplate from "./components/PDF/VerticalTemplate";
import { useResumeStore } from "./store/useResumeStore";
import type { ResumeData } from "./types/ResumeData";
import { generateWordResume } from "./utils/wordGenerator";

type TemplateType = "modern" | "minimal" | "vertical" | "executive" | "ats";

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
    "summary": "string (HTML supported)"
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
      "id": "string",
      "title": "string",
      "organization": "string",
      "startDate": "string",
      "endDate": "string (optional)",
      "body": "string (HTML supported)"
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
  "languages": [{ "id": "string", "language": "string", "level": "number (1-5)" }]
}
`;

function App() {
  const { data, jsonData, error, version, lastInteraction, setData, setJsonData } =
    useResumeStore();
  const [template, setTemplate] = useState<TemplateType>("modern");
  const [accentColor, setAccentColor] = useState<string>("#5350a2");
  const [showSchema, setShowSchema] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [editMode, setEditMode] = useState<"code" | "form">("form");
  const [refreshKey, setRefreshKey] = useState(0);
  // Robust initialization
  const [renderState, setRenderState] = useState<{data: ResumeData, remountKey: number}>(() => ({
    data: useResumeStore.getState().data,
    remountKey: 0
  }));

  // Track structural versions to detect reorders vs text changes
  const lastVersionRef = useRef(version);
  const lastInteractionRef = useRef(lastInteraction);

  useEffect(() => {
    // 1. Detect if this is a structural change (reorder or AI import)
    const isStructural = version !== lastVersionRef.current || lastInteraction !== lastInteractionRef.current;
    
    lastVersionRef.current = version;
    lastInteractionRef.current = lastInteraction;

    if (isStructural) {
      // For reorders, update instantly and force remount
      setRenderState({
        data: data,
        remountKey: Date.now() // Use timestamp for unique remount
      });
      return;
    }

    // 2. For text changes, use a throttled update without remounting
    const timer = setTimeout(() => {
      setRenderState(prev => {
        // Only update data, keep remountKey the same to avoid viewer flash
        return {
          ...prev,
          data: data
        };
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [data, version, lastInteraction]);

  // Memoize the template selection
  const pdfDocument = useMemo(() => {
    switch (template) {
      case "modern":
        return <ModernTemplate data={renderState.data} accentColor={accentColor} />;
      case "minimal":
        return <MinimalTemplate data={renderState.data} accentColor={accentColor} />;
      case "vertical":
        return <VerticalTemplate data={renderState.data} accentColor={accentColor} />;
      case "executive":
        return <ExecutiveTemplate data={renderState.data} accentColor={accentColor} />;
      case "ats":
        return <ATSPDF data={renderState.data} />;
      default:
        return <ModernTemplate data={renderState.data} accentColor={accentColor} />;
    }
  }, [template, renderState.data, accentColor]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setJsonData(event.target?.result as string);
    reader.readAsText(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const updatedData = { ...data };
      updatedData.personal.photoUrl = event.target?.result as string;
      setData(updatedData);
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900 font-sans">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-3 text-blue-400">
          <FileJson
            size={28}
            className="drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]"
          />
          <h1 className="text-lg font-bold tracking-tight text-white uppercase italic">
            ResuMint
          </h1>
        </div>

        <div className="flex gap-2">
          {template === "ats" && (
            <button
              type="button"
              onClick={() => generateWordResume(data)}
              className="cursor-pointer flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-500 transition-colors shadow-lg mr-2"
            >
              <FileText size={14} />
              DOWNLOAD WORD
            </button>
          )}

          <button
            type="button"
            data-tour="tour-ai"
            onClick={() => setShowAIAssistant(true)}
            className="cursor-pointer flex items-center gap-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-black hover:bg-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] mr-2 group"
          >
            <Bot
              size={16}
              className="group-hover:rotate-12 transition-transform"
            />
            MAGIC AI BUILDER
          </button>

          <label className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-blue-500 transition-colors shadow-lg">
            <Upload size={14} />
            IMPORT JSON
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Editor Pane */}
        <div className="w-[40%] flex flex-col border-r border-slate-700">
          <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <div className="flex gap-4" data-tour="tour-mode-toggle">
              <button
                type="button"
                onClick={() => setEditMode("form")}
                className={`cursor-pointer text-[10px] font-black tracking-widest uppercase transition-colors ${editMode === "form" ? "text-blue-400" : "text-slate-500 hover:text-slate-400"}`}
              >
                Form Editor
              </button>
              <button
                type="button"
                onClick={() => setEditMode("code")}
                className={`cursor-pointer text-[10px] font-black tracking-widest uppercase transition-colors ${editMode === "code" ? "text-blue-400" : "text-slate-500 hover:text-slate-400"}`}
              >
                Source Code
              </button>
            </div>
            <div className="flex gap-4">
              <label className="text-[10px] font-bold text-blue-400 cursor-pointer hover:text-blue-300 transition-colors">
                ATTACH PHOTO
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {error && (
                <span className="text-[10px] font-bold text-red-500 animate-pulse">
                  {error}
                </span>
              )}
            </div>
          </div>
          <div
            className="flex-1 overflow-hidden bg-[#0d1117]"
            data-tour="tour-editor"
          >
            {editMode === "code" ? (
              <div className="h-full pt-2">
                <Editor
                  height="100%"
                  defaultLanguage="json"
                  theme="vs-dark"
                  value={jsonData}
                  onChange={(value) => setJsonData(value || "")}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
                    wordWrap: "on",
                    formatOnPaste: true,
                    formatOnType: true,
                    backgroundColor: "#0d1117",
                  }}
                />
              </div>
            ) : (
              <FormEditor />
            )}
          </div>
        </div>

        {/* Preview Pane */}
        <div className="w-[60%] bg-slate-950 flex flex-col relative">
          {/* Template Selector Thumbnails */}
          <div
            className="absolute top-4 left-6 z-20 flex items-center gap-3"
            data-tour="tour-templates"
          >
            {[
              {
                id: "ats",
                name: "ATS",
                icon: (
                  <div className="w-full h-full flex flex-col gap-0.5 p-1">
                    <div className="h-1 bg-slate-400/20 w-full"></div>
                    <div className="h-1 bg-slate-400/20 w-full"></div>
                    <div className="h-1 bg-slate-400/20 w-full"></div>
                    <div className="h-1 bg-slate-400/20 w-full"></div>
                  </div>
                ),
              },
            ].map((tpl) => (
              <button
                type="button"
                key={tpl.id}
                onClick={() => setTemplate(tpl.id as TemplateType)}
                className={`cursor-pointer group relative w-16 h-20 rounded-lg border-2 transition-all flex flex-col overflow-hidden bg-slate-800 ${template === tpl.id ? "border-blue-500 ring-2 ring-blue-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]" : "border-slate-700 hover:border-slate-500"}`}
              >
                <div className="flex-1 bg-slate-900/50">{tpl.icon}</div>
                <div
                  className={`py-1 text-[9px] font-bold text-center uppercase tracking-tighter ${template === tpl.id ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 group-hover:text-slate-200"}`}
                >
                  {tpl.name}
                </div>
                {template === tpl.id && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5 shadow-lg">
                    <Check size={8} strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}

            <div className="h-12 w-px bg-slate-700 mx-1" />

            {[
              {
                id: "modern",
                name: "Modern",
                icon: (
                  <div className="w-full h-full flex flex-col gap-1 p-1">
                    <div className="h-2 bg-blue-500 w-full rounded-xs"></div>
                    <div className="flex gap-1 h-full">
                      <div className="w-3/5 bg-slate-400/20 rounded-xs"></div>
                      <div className="w-2/5 bg-slate-400/20 rounded-xs"></div>
                    </div>
                  </div>
                ),
              },
              {
                id: "minimal",
                name: "Minimal",
                icon: (
                  <div className="w-full h-full flex flex-col gap-1 p-1 items-center">
                    <div className="h-2 bg-slate-400/20 w-1/2 rounded-xs"></div>
                    <div className="h-full bg-slate-400/20 w-full rounded-xs"></div>
                  </div>
                ),
              },
              {
                id: "vertical",
                name: "Vertical",
                icon: (
                  <div className="w-full h-full flex p-1 gap-1">
                    <div className="w-1/3 bg-slate-400/20 rounded-xs h-full"></div>
                    <div className="w-2/3 bg-slate-400/20 rounded-xs h-full"></div>
                  </div>
                ),
              },
              {
                id: "executive",
                name: "Executive",
                icon: (
                  <div className="w-full h-full flex flex-col gap-1 p-1">
                    <div className="h-3 bg-slate-400/20 w-full rounded-xs"></div>
                    <div className="h-1 bg-blue-500 w-full rounded-xs"></div>
                    <div className="h-full bg-slate-400/20 w-full rounded-xs"></div>
                  </div>
                ),
              },
            ].map((tpl) => (
              <button
                type="button"
                key={tpl.id}
                onClick={() => setTemplate(tpl.id as TemplateType)}
                className={`cursor-pointer group relative w-16 h-20 rounded-lg border-2 transition-all flex flex-col overflow-hidden bg-slate-800 ${template === tpl.id ? "border-blue-500 ring-2 ring-blue-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]" : "border-slate-700 hover:border-slate-500"}`}
              >
                <div className="flex-1 bg-slate-900/50">{tpl.icon}</div>
                <div
                  className={`py-1 text-[9px] font-bold text-center uppercase tracking-tighter ${template === tpl.id ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400 group-hover:text-slate-200"}`}
                >
                  {tpl.name}
                </div>
                {template === tpl.id && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5 shadow-lg">
                    <Check size={8} strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="absolute top-4 right-8 z-20 flex flex-col gap-3 items-center">
            <button
              type="button"
              onClick={handleRefresh}
              className="cursor-pointer  p-2 bg-slate-800 text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all border border-slate-700 hover:bg-slate-700"
              title="Refresh Preview"
            >
              <RefreshCw size={18} />
            </button>

            {/* Color Presets Dropdown - only for visual templates */}
            {template !== "ats" && (
              <div className="group flex flex-col items-center gap-2 p-[5px] bg-slate-800 rounded-full border border-slate-700 shadow-xl transition-all duration-300 w-9 h-9 hover:h-[196px] overflow-hidden cursor-pointer">
                {/* Current selected color at the top */}
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm shrink-0"
                  style={{ backgroundColor: accentColor }}
                />

                {/* Remaining colors revealed on hover */}
                {[
                  { name: "Blue", value: "#3d5a80" },
                  { name: "Purple", value: "#5350a2" },
                  { name: "Dark Red", value: "#b91c1c" },
                  { name: "Brown", value: "#92400e" },
                  { name: "Dark Gray", value: "#334155" },
                  { name: "Black", value: "#000000" },
                ]
                  .filter((col) => col.value !== accentColor)
                  .map((col) => (
                    <button
                      type="button"
                      key={col.value}
                      onClick={() => setAccentColor(col.value)}
                      className="cursor-pointer w-6 h-6 rounded-full border border-transparent hover:border-white/30 transition-all hover:scale-110 active:scale-95 shrink-0"
                      style={{ backgroundColor: col.value }}
                      title={col.name}
                    />
                  ))}
              </div>
            )}
          </div>

          <div className="flex-1 p-6 pt-28">
            <div
              className="w-full h-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden bg-white border border-slate-800"
              data-tour="tour-preview"
              data-darkreader-ignore="true"
              data-color-mode="light"
            >
              <PDFViewer
                key={`${template}-${renderState.remountKey}-${refreshKey}-${renderState.data.personal?.photoUrl?.slice(-5)}`}
                width="100%"
                height="100%"
                showToolbar={true}
                className="border-none"
              >

                {pdfDocument}
              </PDFViewer>
            </div>
          </div>
        </div>
      </main>

      {/* Schema Modal */}
      {showSchema && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-blue-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  AI Resume Schema
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSchema(false)}
                className="cursor-pointer text-slate-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-[#0d1117]">
              <div className="mb-4 text-sm text-slate-400">
                Copy this schema and tell your LLM: <br />
                <span className="italic text-blue-300">
                  "Convert my resume text into a JSON object that strictly
                  follows this schema:"
                </span>
              </div>
              <pre className="p-4 bg-slate-900 rounded-lg text-blue-400 text-xs font-mono border border-blue-500/20 whitespace-pre-wrap">
                {JSON_SCHEMA}
              </pre>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3 bg-slate-900/50">
              <button
                type="button"
                onClick={() => copyToClipboard(JSON_SCHEMA)}
                className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600/30 transition-colors"
              >
                <Copy size={16} />
                COPY SCHEMA
              </button>
              <button
                type="button"
                onClick={() => setShowSchema(false)}
                className="cursor-pointer px-4 py-2 text-slate-400 font-bold hover:text-white transition-colors"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
      <OnboardingTour />
    </div>
  );
}

export default App;
