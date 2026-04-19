import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Cpu,
  Loader2,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useResumeStore } from "../store/useResumeStore";
import {
  type ATSAnalysisResult,
  analyzeATS,
  getAIConfig,
} from "../utils/aiService";

interface ATSAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ATSAnalyzer: React.FC<ATSAnalyzerProps> = ({ isOpen, onClose }) => {
  const { data, setData } = useResumeStore();
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiConfig, setAiConfig] = useState(getAIConfig());

  useEffect(() => {
    if (isOpen) {
      setAiConfig(getAIConfig());
      // Clear results when opening a new session
      if (!isAnalyzing && !result) {
        setError(null);
      }
    }
  }, [isOpen, isAnalyzing, result]);

  if (!isOpen) return null;

  const handleAnalyze = async (provider: "openai" | "gemini") => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const analysis = await analyzeATS(data, jobDescription, provider);
      setResult(analysis);
    } catch (e: any) {
      setError(e.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestion = (suggestion: ATSAnalysisResult["suggestions"][0]) => {
    const newData = { ...data };

    if (suggestion.section.toLowerCase() === "summary") {
      newData.personal.summary = suggestion.suggested;
    } else if (suggestion.section.toLowerCase() === "skills" || suggestion.section.toLowerCase() === "technical skills") {
      if (suggestion.type === "add") {
        newData.techSkills.push({
          id: `skill-${Math.random().toString(36).substr(2, 9)}`,
          name: suggestion.suggested,
          knowledge: 80,
        });
      }
    } else if (suggestion.section.toLowerCase() === "experience" || suggestion.section.toLowerCase() === "professional experience") {
        // Find the experience that matches the original text to paraphrase
        const expIndex = newData.professionalExperiences.findIndex(exp => 
            exp.body.includes(suggestion.original) || suggestion.original.includes(exp.organization)
        );
        if (expIndex > -1) {
            newData.professionalExperiences[expIndex].body = suggestion.suggested;
        }
    }

    setData(newData);
    // Remove the suggestion from the list after applying
    if (result) {
      setResult({
        ...result,
        suggestions: result.suggestions.filter((s) => s !== suggestion),
      });
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md z-100 flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ats-title"
    >
      <div className="bg-surface-bg border border-border-base rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-base flex justify-between items-center bg-surface-bg">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-xl">
              <Activity size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 id="ats-title" className="text-xl font-bold text-text-main tracking-tight">
                ATS Match Analyzer
              </h2>
              <p className="text-xs text-text-muted font-medium">
                Compare your resume against a Job Description
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-text-muted hover:text-text-main cursor-pointer"
            aria-label="Close analyzer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left Side: Input JD */}
          <div className="w-full lg:w-1/2 p-6 border-r border-border-base flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <ClipboardList size={18} />
              <h3 className="font-bold text-sm uppercase tracking-wider">
                Job Description
              </h3>
            </div>
            
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="flex-1 min-h-[300px] w-full bg-white dark:bg-slate-950 border border-border-base rounded-xl p-4 text-text-main text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none custom-scrollbar"
              aria-label="Paste Job Description here"
            />

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAnalyze("openai")}
                  disabled={!aiConfig.openaiKey || isAnalyzing}
                  className="flex items-center justify-center gap-2 bg-emerald-600 enabled:hover:bg-emerald-500 disabled:bg-slate-200/50 dark:disabled:bg-slate-900/50 disabled:text-slate-400 dark:disabled:text-slate-600 text-white py-3 rounded-xl text-[10px] font-bold transition-all shadow-lg active:scale-95 enabled:cursor-pointer disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Zap size={16} className={aiConfig.openaiKey ? "text-yellow-300" : ""} />
                  )}
                  {aiConfig.openaiKey ? "ANALYZE WITH GPT" : "NO GPT KEY"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAnalyze("gemini")}
                  disabled={!aiConfig.geminiKey || isAnalyzing}
                  className="flex items-center justify-center gap-2 bg-blue-600 enabled:hover:bg-blue-500 disabled:bg-slate-200/50 dark:disabled:bg-slate-900/50 disabled:text-slate-400 dark:disabled:text-slate-600 text-white py-3 rounded-xl text-[10px] font-bold transition-all shadow-lg active:scale-95 enabled:cursor-pointer disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Cpu size={16} className={aiConfig.geminiKey ? "text-blue-300" : ""} />
                  )}
                  {aiConfig.geminiKey ? "ANALYZE WITH GEMINI" : "NO GEMINI KEY"}
                </button>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-bold animate-pulse bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Results */}
          <div className="w-full lg:w-1/2 bg-app-bg/50 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
            {!result && !isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                <Sparkles size={48} className="mb-4 text-text-muted" />
                <h4 className="font-bold text-text-main mb-2">Ready to Analyze</h4>
                <p className="text-sm text-text-muted">Paste a job description and click analyze to see your ATS match score and improvements.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Loader2 size={48} className="mb-4 text-emerald-500 animate-spin" />
                <h4 className="font-bold text-text-main mb-2">Analyzing Resume...</h4>
                <p className="text-sm text-text-muted animate-pulse">Running AI comparison against Job Description...</p>
              </div>
            )}

            {result && (
              <>
                {/* Score Circle */}
                <div className="bg-surface-bg border border-border-base rounded-2xl p-6 flex items-center justify-between shadow-sm">
                  <div>
                    <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Match Score</h4>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-black ${result.score > 80 ? "text-emerald-500" : result.score > 50 ? "text-amber-500" : "text-red-500"}`}>
                        {result.score}%
                      </span>
                      <span className="text-text-muted text-sm font-bold">/ 100</span>
                    </div>
                  </div>
                  <div className="text-right max-w-[60%]">
                    <p className="text-xs text-text-main font-medium leading-relaxed italic">
                      "{result.overallFeedback}"
                    </p>
                  </div>
                </div>

                {/* Keywords */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={12} /> Keywords Found & Missing
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.foundKeywords.map((kw) => (
                      <span key={kw} className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-bold">
                        {kw}
                      </span>
                    ))}
                    {result.missingKeywords.map((kw) => (
                      <span key={kw} className="px-2 py-1 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded text-[10px] font-bold">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} /> Smart Suggestions
                  </h4>
                  
                  <div className="space-y-3">
                    {result.suggestions.map((s, idx) => (
                      <div key={idx} className="bg-surface-bg border border-border-base rounded-xl p-4 shadow-sm group hover:border-emerald-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-black px-2 py-0.5 bg-app-bg text-text-muted rounded border border-border-base uppercase tracking-tighter">
                            {s.section}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${s.type === 'add' ? 'text-emerald-500' : s.type === 'remove' ? 'text-red-500' : 'text-emerald-500'}`}>
                            {s.type}
                          </span>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          {s.original && (
                            <div className="text-xs text-text-muted line-through opacity-60 italic">
                              {s.original}
                            </div>
                          )}
                          <div className="text-xs text-text-main font-medium leading-relaxed bg-app-bg/30 p-2 rounded-lg border border-dashed border-border-base">
                            <div dangerouslySetInnerHTML={{ __html: s.suggested }} />
                          </div>
                          <div className="text-[10px] text-text-muted bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                            <strong>Reason:</strong> {s.reason}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => applySuggestion(s)}
                          className="w-full flex items-center justify-center gap-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-600 hover:text-white py-2 rounded-lg text-xs font-black transition-all group-hover:shadow-md"
                        >
                          APPLY IMPROVEMENT
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSAnalyzer;
