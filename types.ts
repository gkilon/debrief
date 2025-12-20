
export enum DebriefStatus {
  DRAFT = 'טיוטה',
  IN_REVIEW = 'בבדיקה',
  COMPLETED = 'הושלם'
}

export interface WhatHappenedStructured {
  process: string;
  result: string;
  atmosphere: string;
  resources: string;
  safety: string;
  other: string;
}

export interface DebriefData {
  id: string;
  timestamp: number;
  title: string;
  whatWasPlanned: string;
  whatHappened: string | WhatHappenedStructured; // supporting both for migration/flexibility
  gaps: string[];
  rootCauses: string[];
  conclusions: string[];
  images: string[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
