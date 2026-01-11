
export interface SectionFeedback {
  summary: string[];
  experience: string[];
  education: string[];
  skills: string[];
  projects: string[];
  other: string[];
}

export interface CvReview {
  score: number;
  overallSummary: string;
  strengths: string[];
  weaknesses: string[];
  sectionFeedback: SectionFeedback;
}

export interface ImprovedCv {
  header: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    bullets?: string[];
  }>;
  projects: Array<{
    name: string;
    role?: string;
    technologies?: string[];
    bullets: string[];
  }>;
  extracurriculars?: Array<{
    name: string;
    role?: string;
    bullets?: string[];
  }>;
}

export type AppMode = 'cv' | 'image';
