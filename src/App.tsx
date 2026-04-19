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
  X,
  Undo2,
  Redo2,
  Settings,
  History,
  Sun,
  Moon,
  Activity,
  Lock,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AIAssistant from "./components/AIAssistant";
import ATSAnalyzer from "./components/ATSAnalyzer";
import FormEditor from "./components/FormEditor";
import OnboardingTour from "./components/OnboardingTour";
import SettingsModal from "./components/SettingsModal";
import VersionManager from "./components/VersionManager";
import ATSPDF from "./components/PDF/ATSPDF";
import ExecutiveTemplate from "./components/PDF/ExecutiveTemplate";
import MinimalTemplate from "./components/PDF/MinimalTemplate";
import ModernTemplate from "./components/PDF/ModernTemplate";
import VerticalTemplate from "./components/PDF/VerticalTemplate";
import { useResumeStore } from "./store/useResumeStore";
import { useThemeStore } from "./store/useThemeStore";
import type { ResumeData } from "./types/ResumeData";
import { generateWordResume } from "./utils/wordGenerator";
import { getAIConfig } from "./utils/aiService";

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
  const { undo, redo, pastStates, futureStates } = useResumeStore.temporal.getState();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [template, setTemplate] = useState<TemplateType>("modern");
  const [accentColor, setAccentColor] = useState<string>("#5350a2");
  const [showSchema, setShowSchema] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showATSAnalyzer, setShowATSAnalyzer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [editMode, setEditMode] = useState<"code" | "form">("form");
  const [refreshKey, setRefreshKey] = useState(0);

  const aiConfig = useMemo(() => getAIConfig(), [showAIAssistant, showATSAnalyzer, showSettings]);
  const hasAIKeys = !!(aiConfig.openaiKey || aiConfig.geminiKey);

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

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // Sync theme with root element class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

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
    <div className="flex flex-col h-screen overflow-hidden bg-app-bg font-sans transition-colors duration-300">
      {/* Header */}
      <header className="bg-surface-bg border-b border-border-base px-6 py-3 flex justify-between items-center z-10 transition-colors duration-300">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-emerald-500 dark:text-emerald-400">
            <img 
              src="/favicon.svg" 
              alt="ResuMint Logo" 
              className="w-8 h-8 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
            />
            <h1 className="text-lg font-bold tracking-tight text-text-main uppercase italic">
              ResuMint
            </h1>
          </div>

          <div className="h-6 w-px bg-border-base hidden md:block" />

          {/* Undo/Redo Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => undo()}
              disabled={pastStates.length === 0}
              className="p-2 text-text-muted enabled:hover:text-text-main enabled:hover:bg-slate-100 dark:enabled:hover:bg-slate-700 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed rounded-lg transition-all"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={() => redo()}
              disabled={futureStates.length === 0}
              className="p-2 text-text-muted enabled:hover:text-text-main enabled:hover:bg-slate-100 dark:enabled:hover:bg-slate-700 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed rounded-lg transition-all"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={18} />
            </button>
          </div>
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
            onClick={() => setShowVersions(true)}
            className="cursor-pointer flex items-center gap-2 bg-surface-bg text-text-main px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all border border-border-base mr-2"
          >
            <History size={16} />
            VERSIONS
          </button>

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

          <button
            type="button"
            onClick={() => hasAIKeys ? setShowATSAnalyzer(true) : setShowSettings(true)}
            className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black transition-all mr-2 group ${hasAIKeys ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-200 dark:bg-slate-800 text-text-muted hover:text-text-main border border-border-base'}`}
            title={hasAIKeys ? "Analyze Resume with ATS" : "Configure API Keys to enable ATS Analysis"}
          >
            {hasAIKeys ? <Activity size={16} className="group-hover:animate-pulse" /> : <Lock size={16} />}
            ATS ANALYZER
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 text-text-muted hover:text-text-main hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all border border-transparent hover:border-border-base cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="p-1.5 text-text-muted hover:text-text-main hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all border border-transparent hover:border-border-base cursor-pointer"
            title="AI Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Editor Pane */}
        <div className="w-[40%] max-w-[600px] flex flex-col border-r border-border-base">
          <div className="px-4 py-2 bg-surface-bg border-b border-border-base flex justify-between items-center">
            <div className="flex gap-4" data-tour="tour-mode-toggle">
              <button
                type="button"
                onClick={() => setEditMode("form")}
                className={`cursor-pointer text-[10px] font-black tracking-widest uppercase transition-colors ${editMode === "form" ? "text-emerald-500 dark:text-emerald-400" : "text-text-muted hover:text-text-main"}`}
              >
                Form Editor
              </button>
              <button
                type="button"
                onClick={() => setEditMode("code")}
                className={`cursor-pointer text-[10px] font-black tracking-widest uppercase transition-colors ${editMode === "code" ? "text-emerald-500 dark:text-emerald-400" : "text-text-muted hover:text-text-main"}`}
              >
                Source Code
              </button>
            </div>
            <div className="flex gap-4 items-center">
              <label className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">
                ATTACH PHOTO
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              
              <div className="h-4 w-px bg-border-base" />
              
              <label className="text-[10px] font-bold text-text-muted cursor-pointer hover:text-text-main transition-colors">
                IMPORT JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
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
            className="flex-1 overflow-hidden bg-app-bg"
            data-tour="tour-editor"
          >
            {editMode === "code" ? (
              <div className="h-full pt-2">
                <Editor
                  height="100%"
                  defaultLanguage="json"
                  theme={isDarkMode ? "vs-dark" : "light"}
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
                  }}
                />
              </div>
            ) : (
              <FormEditor />
            )}
          </div>
        </div>

        {/* Preview Pane */}
        <div className="w-[60%] bg-app-bg flex flex-col relative transition-colors duration-300">
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
                className={`cursor-pointer group relative w-16 h-20 rounded-lg border-2 transition-all flex flex-col overflow-hidden bg-surface-bg ${template === tpl.id ? "border-blue-500 ring-2 ring-blue-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]" : "border-border-base hover:border-slate-400 dark:hover:border-slate-500"}`}
              >
                <div className="flex-1 bg-app-bg">{tpl.icon}</div>
                <div
                  className={`py-1 text-[9px] font-bold text-center uppercase tracking-tighter ${template === tpl.id ? "bg-blue-500 text-white" : "bg-surface-bg text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"}`}
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

            <div className="h-12 w-px bg-border-base mx-1" />

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
                className={`cursor-pointer group relative w-16 h-20 rounded-lg border-2 transition-all flex flex-col overflow-hidden bg-surface-bg ${template === tpl.id ? "border-blue-500 ring-2 ring-blue-500/20 shadow-[0_0_15px_rgba(99,102,241,0.3)]" : "border-border-base hover:border-slate-400 dark:hover:border-slate-500"}`}
              >
                <div className="flex-1 bg-app-bg">{tpl.icon}</div>
                <div
                  className={`py-1 text-[9px] font-bold text-center uppercase tracking-tighter ${template === tpl.id ? "bg-blue-500 text-white" : "bg-surface-bg text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"}`}
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
              className="cursor-pointer p-2 bg-surface-bg text-slate-600 dark:text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all border border-border-base hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Refresh Preview"
            >
              <RefreshCw size={18} />
            </button>

            {/* Color Presets Dropdown - only for visual templates */}
            {template !== "ats" && (
              <div className="group flex flex-col items-center gap-2 p-[5px] bg-surface-bg rounded-full border border-border-base shadow-xl transition-all duration-300 w-9 h-9 hover:h-[196px] overflow-hidden cursor-pointer">
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
              className="w-full h-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden bg-white border border-border-base"
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
          <div className="bg-surface-bg border border-border-base rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-border-base flex justify-between items-center bg-app-bg">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-blue-500 dark:text-blue-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  AI Resume Schema
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSchema(false)}
                className="cursor-pointer text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-surface-bg">
              <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                Copy this schema and tell your LLM: <br />
                <span className="italic text-emerald-600 dark:text-emerald-300">
                  "Convert my resume text into a JSON object that strictly
                  follows this schema:"
                </span>
              </div>
              <pre className="p-4 bg-app-bg rounded-lg text-emerald-600 dark:text-emerald-400 text-xs font-mono border border-emerald-500/30 whitespace-pre-wrap">
                {JSON_SCHEMA}
              </pre>
            </div>
            <div className="px-6 py-4 border-t border-border-base flex justify-end gap-3 bg-app-bg">
              <button
                type="button"
                onClick={() => copyToClipboard(JSON_SCHEMA)}
                className="cursor-pointer flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-500 transition-colors"
              >
                <Copy size={16} />
                COPY SCHEMA
              </button>
              <button
                type="button"
                onClick={() => setShowSchema(false)}
                className="cursor-pointer px-4 py-2 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition-colors"
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
      <ATSAnalyzer
        isOpen={showATSAnalyzer}
        onClose={() => setShowATSAnalyzer(false)}
      />
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <VersionManager 
        isOpen={showVersions}
        onClose={() => setShowVersions(false)}
      />
      <OnboardingTour />
    </div>
  );
}

export default App;

