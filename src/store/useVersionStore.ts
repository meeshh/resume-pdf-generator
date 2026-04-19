import { create } from "zustand";
import { get, set, del } from "idb-keyval";
import type { ResumeData } from "../types/ResumeData";
import { useResumeStore } from "./useResumeStore";

export interface ResumeVersionMetadata {
  id: string;
  name: string;
  updatedAt: number;
}

interface VersionStore {
  versions: ResumeVersionMetadata[];
  isLoading: boolean;
  
  // Actions
  fetchVersions: () => Promise<void>;
  saveCurrentVersion: (name: string) => Promise<string>;
  loadVersion: (id: string) => Promise<void>;
  deleteVersion: (id: string) => Promise<void>;
  renameVersion: (id: string, newName: string) => Promise<void>;
}

const METADATA_KEY = "resumint-versions-metadata";

export const useVersionStore = create<VersionStore>((setStore, getStore) => ({
  versions: [],
  isLoading: false,

  fetchVersions: async () => {
    setStore({ isLoading: true });
    try {
      const metadata = await get<ResumeVersionMetadata[]>(METADATA_KEY) || [];
      setStore({ versions: metadata.sort((a, b) => b.updatedAt - a.updatedAt) });
    } catch (error) {
      console.error("Failed to fetch versions:", error);
    } finally {
      setStore({ isLoading: false });
    }
  },

  saveCurrentVersion: async (name: string) => {
    const mainStore = useResumeStore.getState();
    const id = mainStore.versionId || crypto.randomUUID();
    const data = mainStore.data;
    const updatedAt = Date.now();

    // Save actual data
    await set(`resume-data-${id}`, data);

    // Update metadata
    const metadata = await get<ResumeVersionMetadata[]>(METADATA_KEY) || [];
    const existingIndex = metadata.findIndex(m => m.id === id);
    
    if (existingIndex > -1) {
      metadata[existingIndex] = { ...metadata[existingIndex], name, updatedAt };
    } else {
      metadata.push({ id, name, updatedAt });
    }

    await set(METADATA_KEY, metadata);
    mainStore.setVersionId(id);
    
    await getStore().fetchVersions();
    return id;
  },

  loadVersion: async (id: string) => {
    const data = await get<ResumeData>(`resume-data-${id}`);
    if (data) {
      const mainStore = useResumeStore.getState();
      mainStore.setData(data);
      mainStore.setVersionId(id);
    }
  },

  deleteVersion: async (id: string) => {
    await del(`resume-data-${id}`);
    
    const metadata = await get<ResumeVersionMetadata[]>(METADATA_KEY) || [];
    const filtered = metadata.filter(m => m.id !== id);
    await set(METADATA_KEY, filtered);
    
    const mainStore = useResumeStore.getState();
    if (mainStore.versionId === id) {
      mainStore.setVersionId(null);
    }
    
    await getStore().fetchVersions();
  },

  renameVersion: async (id: string, newName: string) => {
    const metadata = await get<ResumeVersionMetadata[]>(METADATA_KEY) || [];
    const index = metadata.findIndex(m => m.id === id);
    if (index > -1) {
      metadata[index].name = newName;
      metadata[index].updatedAt = Date.now();
      await set(METADATA_KEY, metadata);
      await getStore().fetchVersions();
    }
  }
}));
