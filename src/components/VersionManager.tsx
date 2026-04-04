import {
  History,
  Plus,
  Trash2,
  FileText,
  Calendar,
  Save,
  Pencil,
  Check,
  X,
  Loader2
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useVersionStore, type ResumeVersionMetadata } from "../store/useVersionStore";

interface VersionManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const VersionManager: React.FC<VersionManagerProps> = ({ isOpen, onClose }) => {
  const { 
    versions, 
    isLoading, 
    fetchVersions, 
    saveCurrentVersion, 
    loadVersion, 
    deleteVersion,
    renameVersion
  } = useVersionStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, fetchVersions]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const name = prompt("Enter a name for this version:", `Resume ${versions.length + 1}`);
    if (name) {
      setIsSaving(true);
      await saveCurrentVersion(name);
      setIsSaving(false);
    }
  };

  const handleLoad = async (id: string) => {
    await loadVersion(id);
    onClose();
  };

  const startEditing = (v: ResumeVersionMetadata) => {
    setEditingId(v.id);
    setNewName(v.name);
  };

  const handleRename = async (id: string) => {
    if (newName.trim()) {
      await renameVersion(id, newName.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md z-100 flex items-center justify-center p-4">
      <div className="bg-surface-bg border border-border-base rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] transition-colors duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-base flex justify-between items-center bg-surface-bg">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-xl">
              <History size={24} className="text-purple-500 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-main tracking-tight">
                Resume Versions
              </h2>
              <p className="text-xs text-text-muted font-medium">
                Stored locally in your browser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-text-muted hover:text-text-main"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-app-bg hover:bg-slate-100 dark:hover:bg-slate-700 border border-border-base border-dashed text-text-muted py-4 rounded-xl text-sm font-bold transition-all mb-6 group"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} className="group-hover:scale-110 transition-transform" />
            )}
            SAVE CURRENT AS NEW VERSION
          </button>

          <div className="space-y-3">
            {isLoading && versions.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 text-text-muted">
                <Loader2 size={32} className="animate-spin" />
                <p className="text-sm font-medium">Loading versions...</p>
              </div>
            ) : versions.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-4 text-text-muted border border-border-base border-dashed rounded-2xl">
                <FileText size={48} className="opacity-20" />
                <p className="text-sm font-medium">No saved versions found</p>
              </div>
            ) : (
              versions.map((version) => (
                <div
                  key={version.id}
                  className="group bg-surface-bg border border-border-base hover:border-slate-300 dark:hover:border-slate-600 rounded-xl p-4 flex items-center gap-4 transition-all"
                >
                  <div className="bg-app-bg p-2.5 rounded-lg text-text-muted group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                    <FileText size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingId === version.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleRename(version.id)}
                          className="flex-1 bg-white dark:bg-slate-900 border border-purple-500/50 rounded px-2 py-1 text-sm text-text-main focus:outline-none"
                        />
                        <button 
                          onClick={() => handleRename(version.id)}
                          className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="text-text-muted hover:text-slate-600 dark:hover:text-slate-400"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-text-main truncate">
                            {version.name}
                          </h3>
                          <button
                            onClick={() => startEditing(version)}
                            className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                          >
                            <Pencil size={12} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[10px] text-text-muted font-medium">
                            <Calendar size={10} />
                            {new Date(version.updatedAt).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-slate-300 dark:text-slate-700">•</span>
                          <span className="text-[10px] text-text-muted font-medium">
                            {new Date(version.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleLoad(version.id)}
                      className="bg-purple-600/10 hover:bg-purple-600 text-purple-600 dark:text-purple-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black transition-all"
                    >
                      LOAD
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${version.name}"?`)) {
                          deleteVersion(version.id);
                        }
                      }}
                      className="p-2 text-text-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-bg border-t border-border-base">
           <p className="text-[10px] text-text-muted text-center leading-relaxed italic">
             Versions are unique to this browser. Clear your cache or use a different browser and they won't be visible.
           </p>
        </div>
      </div>
    </div>
  );
};

export default VersionManager;
