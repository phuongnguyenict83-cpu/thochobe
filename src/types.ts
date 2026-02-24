export type AgeGroup = '3-4' | '4-5' | '5-6';

export interface PoemRequest {
  theme: string;
  ageGroup: AgeGroup;
  customIdea?: string;
}

export interface PoemResponse {
  title: string;
  content: string;
  imageUrl?: string;
}
