import { arrayMove } from "@dnd-kit/sortable";
import { create } from "zustand";
import type { ResumeData } from "../types/ResumeData";

interface ResumeStore {
  data: ResumeData;
  jsonData: string;
  error: string | null;
  version: number;
  lastInteraction: number;

  // Actions
  setData: (data: ResumeData) => void;
  setJsonData: (json: string) => void;
  updateField: (path: string, value: unknown) => void;
  reorderArray: (
    fieldName: keyof ResumeData,
    activeId: string,
    overId: string,
  ) => void;
}

const initialData: ResumeData = {
  personal: {
    firstName: "JOHN",
    lastName: "DOE",
    title: "Senior Software Engineer",
    location: "City, Country",
    email: "john.doe@example.com",
    mobile: "+00 000 000 00 00",
    photoUrl: "",
    summary:
      "<p>A highly motivated and experienced <strong>Software Engineer</strong> with a proven track record of developing innovative solutions and leading successful teams.</p>",
  },
  labels: {
    workExperience: "Work Experience",
    skills: "Technical Skills",
    otherSkills: "Other Skills",
    education: "Education",
    certifications: "Certifications",
    languages: "Languages",
    present: "Present",
  },
  professionalExperiences: [
    {
      id: "exp-1",
      title: "Senior Software Engineer",
      organization: "Global Tech Solutions",
      startDate: "Jan 2020",
      body: "<ul><li>Spearheaded the development of a cloud-based enterprise application.</li><li>Implemented scalable microservices architecture using modern frameworks.</li><li>Led a team of developers to deliver high-quality code within tight deadlines.</li></ul>",
    },
    {
      id: "exp-2",
      title: "Software Developer",
      organization: "Innovative Startups Inc.",
      startDate: "Jun 2016",
      endDate: "Dec 2019",
      body: "<p>Contributed to the design and implementation of various web-based projects. Focused on optimizing performance and improving user experience.</p>",
    },
  ],
  techSkills: [
    { id: "skill-1", name: "JavaScript / TypeScript", knowledge: 90 },
    { id: "skill-2", name: "React / Angular / Vue", knowledge: 85 },
    { id: "skill-3", name: "Node.js / Python / Go", knowledge: 80 },
    { id: "skill-4", name: "SQL / NoSQL Databases", knowledge: 75 },
  ],
  softSkills: [
    { id: "soft-1", name: "Leadership", knowledge: 85 },
    { id: "soft-2", name: "Problem Solving", knowledge: 95 },
    { id: "soft-3", name: "Communication", knowledge: 90 },
  ],
  otherSkills: [
    {
      id: "other-1",
      body: "<p>Docker, Kubernetes, AWS, CI/CD, Agile Methodologies</p>",
    },
  ],
  educations: [
    {
      id: "edu-1",
      degree: "Bachelor of Science in Computer Science",
      organization: "State University",
      startYear: "2012",
      endYear: "2016",
    },
  ],
  certifications: [],
  languages: [
    { id: "lang-1", language: "English", level: 5 },
    { id: "lang-2", language: "French", level: 3 },
  ],
};

export const useResumeStore = create<ResumeStore>((set, get) => ({
  data: initialData,
  jsonData: JSON.stringify(initialData, null, 2),
  error: null,
  version: 0,
  lastInteraction: Date.now(),

  setData: (data) => {
    set((state) => ({
      data,
      jsonData: JSON.stringify(data, null, 2),
      error: null,
      version: state.version + 1,
      lastInteraction: Date.now(),
    }));
  },

  setJsonData: (jsonData) => {
    try {
      const parsed = JSON.parse(jsonData);
      set((state) => ({
        jsonData,
        data: parsed,
        error: null,
        version: state.version + 1,
        lastInteraction: Date.now(),
      }));
    } catch (_e) {
      set({ jsonData, error: "Invalid JSON format" });
    }
  },

  updateField: (path, value) => {
    const newData = { ...get().data };
    const parts = path.split(".");
    // biome-ignore lint/suspicious/noExplicitAny: Deep path updates with dynamic keys require any for traversal
    let current: any = newData;

    for (let i = 0; i < parts.length - 1; i++) {
      current = { ...current[parts[i]] };
    }
    current[parts[parts.length - 1]] = value;

    set((state) => ({
      data: newData,
      jsonData: JSON.stringify(newData, null, 2),
      version: state.version + 1,
      lastInteraction: Date.now(),
    }));
  },

  reorderArray: (fieldName, activeId, overId) => {
    const { data, version } = get();
    const fieldValue = data[fieldName];
    if (!Array.isArray(fieldValue)) return;

    const items = [...fieldValue] as Array<{ id: string }>;
    if (!items) return;

    const oldIndex = items.findIndex((item) => item.id === activeId);
    const newIndex = items.findIndex((item) => item.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(items, oldIndex, newIndex);
      const newData = { ...data, [fieldName]: newItems };
      set({
        data: newData,
        jsonData: JSON.stringify(newData, null, 2),
        version: version + 1,
        lastInteraction: Date.now(),
      });
      console.log(`Successfully reordered ${fieldName}`);
    }
  },
}));
