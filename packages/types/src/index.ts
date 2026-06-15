export interface StartupIdea {
  id: string;
  name: string;
  description: string;
  userId: string;
}

export interface ValidationResult {
  marketScore: number;
  competitors: string[];
  techStackRecs: string[];
  summary: string;
}
