
export enum DebriefStatus {
  DRAFT = 'טיוטה',
  IN_REVIEW = 'בבדיקה',
  COMPLETED = 'הושלם'
}

export interface DebriefData {
  id: string;
  timestamp: number;
  title: string;
  whatWasPlanned: string;
  whatHappened: string;
  gaps: string[];
  rootCauses: string[];
  conclusions: string[];
  images: string[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
