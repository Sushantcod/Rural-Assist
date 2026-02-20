
export interface FarmProfile {
  name: string;
  location: string;
  size: string;
  soilType: string;
  primaryCrops: string[];
  waterResources: string;
  language: 'en' | 'hi' | 'pa' | 'mr';
  isGuest?: boolean;
  avatarId?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  audio?: string;
}

export interface GrowthRecord {
  id: string;
  date: string;
  image: string;
  cropType: string;
  analysis: string;
  stage: string;
}

export interface FertilizerAdvice {
  type: string;
  quantity: string;
  timing: string;
  applicationMethod: string;
  precautions: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  eligibility: string;
  benefits: string;
  category: 'subsidy' | 'insurance' | 'finance';
}
