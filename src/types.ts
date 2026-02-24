export type AgeGroup = '3-4' | '4-5' | '5-6';

export interface PoemRequest {
  theme: string;
  ageGroup: AgeGroup;
}

export interface PoemResponse {
  title: string;
  content: string;
}
