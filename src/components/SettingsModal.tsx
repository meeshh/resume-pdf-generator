import { X, Key, ShieldCheck, Trash2, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import { getAIConfig, saveAIConfig, clearAIConfig } from "../utils/aiService";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [openaiKey, setOpenaiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getAIConfig();
      setOpenaiKey(config.openaiKey || "");
      setGeminiKey(config.geminiKey || "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAIConfig({
      openaiKey: openaiKey.trim() || undefined,
      geminiKey: geminiKey.trim() || undefined,
    });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to remove all API keys?")) {
      clearAIConfig();
      setOpenaiKey("");
      setGeminiKey("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md z-100 flex items-center justify-center p-4">
      <div className="bg-surface-bg border border-border-base rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col transition-colors duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-base flex justify-between items-center bg-surface-bg">
          <div className="flex items-center gap-3">
            <div className="bg-app-bg p-2 rounded-lg">
              <Key size={20} className="text-blue-500 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-text-main tracking-tight">
              AI Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-text-muted hover:text-text-main"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
            <ShieldCheck size={20} className="text-blue-500 dark:text-blue-400 shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your API keys are stored <strong>locally in your browser</strong> and are never sent to our servers.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                OpenAI API Key (GPT-4o)
              </label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-white dark:bg-slate-950 border border-border-base rounded-xl px-4 py-2.5 text-sm text-text-main focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full bg-white dark:bg-slate-950 border border-border-base rounded-xl px-4 py-2.5 text-sm text-text-main focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-bg border-t border-border-base flex justify-between items-center">
          <button
            onClick={handleClear}
            className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
            CLEAR KEYS
          </button>
          
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95"
          >
            {showSaved ? (
              <span className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                <ShieldCheck size={16} /> SAVED
              </span>
            ) : (
              <>
                <Save size={16} /> SAVE KEYS
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
