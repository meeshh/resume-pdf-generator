export type ResumeData = {
  personal: {
    firstName: string;
    lastName: string;
    title: string;
    location: string;
    email: string;
    mobile: string;
    photoUrl?: string;
    summary: string; // HTML supported
  };
  labels: {
    workExperience: string;
    skills: string;
    otherSkills: string;
    education: string;
    certifications: string;
    languages: string;
    present: string;
  };
  professionalExperiences: Array<{
    id: string;
    title: string;
    organization: string;
    startDate: string;
    endDate?: string;
    body: string; // HTML supported
  }>;
  techSkills: Array<{
    id: string;
    name: string;
    knowledge: number; // 0-100
  }>;
  softSkills: Array<{
    id: string;
    name: string;
    knowledge: number; // 0-100
  }>;
  otherSkills: Array<{
    id: string;
    body: string; // HTML supported
  }>;
  educations: Array<{
    id: string;
    degree: string;
    organization: string;
    startYear: string;
    endYear: string;
  }>;
  certifications: Array<{
    id: string;
    certification: string;
    issuer: string;
    completionYear: string;
    url?: string;
    credentialId?: string;
  }>;
  languages: Array<{
    id: string;
    language: string;
    level: number; // 1-5
  }>;
};
