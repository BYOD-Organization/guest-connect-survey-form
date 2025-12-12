export interface Question {
  id: string | number;
  type: 'rating' | 'text' | 'multipleChoice' | 'yesNo';
  question: string;
  required: boolean;
  options?: string[]; // For multiple choice questions
  minRating?: number;
  maxRating?: number;
}

export interface ApiQuestion {
  '@type'?: string;
  '@id'?: string;
  id: number;
  questionText: string;
  questionType: 'rating' | 'text' | 'multiplechoice' | 'yesno';
  sortOrder: number;
  options?: string[];
  required?: boolean;
}

export interface GuestConnectReward {
  '@id'?: string;
  '@type'?: string;
  id: number;
  title: string;
  description: string;
}

export interface Workplace {
  '@id'?: string;
  '@type'?: string;
  id: number;
  name: string;
}

export interface GuestConnectSetting {
  disclaimerText: string;
  logoPath: string;
}

export interface CampaignBasicData {
  '@context'?: Record<string, string>;
  '@type'?: string;
  '@id'?: string;
  title: string;
  rewardDetailsText?: string;
  reward?: GuestConnectReward;
  winnersCount?: number;
  workplace?: Workplace;
  startDate?: string;
  endDate?: string;
  active: boolean;
  guestConnectSetting?: GuestConnectSetting;
}

export interface Campaign extends CampaignBasicData {
  questions: Question[];
}

export interface SurveyAnswer {
  questionId: string | number;
  answer: string | number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  optOutOfContest?: boolean;
}

export interface SurveyMetadata {
  ipAddress?: string;
  timestamp: string;
  browser: string;
  device: string;
  userAgent: string;
}

export interface SurveySubmission {
  campaignId: string;
  answers: SurveyAnswer[];
  customerInfo?: CustomerInfo;
  metadata: SurveyMetadata;
}

export interface BasicSubmissionPayload {
  name?: string;
  email?: string;
  phone?: string;
  rewardOptIn: boolean;
  metadataJson: Record<string, unknown>[];
  workplace: string;
  uniqueUrlToken: string;
}

export interface BasicSubmissionResponse {
  '@context'?: string;
  '@id'?: string;
  '@type'?: string;
  id: number;
  campaign: {
    '@context'?: string;
    '@id'?: string;
    '@type'?: string;
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    reward?: string;
    winnersCount: number;
    uniqueUrlToken: string;
    questions: Question[];
  };
  ipAddress: string;
  userAgent: string;
  browser: string;
  device: string;
  name?: string;
  email?: string;
  phone?: string;
  rewardOptIn: boolean;
  metadataJson?: Record<string, unknown>[];
  workplace?: string;
  submittedAt: string;
}

export type SurveyError = 
  | 'CAMPAIGN_INACTIVE'
  | 'ALREADY_ENTERED_TODAY'
  | 'TOO_MANY_ATTEMPTS'
  | 'INVALID_PARAMETERS'
  | 'SUBMISSION_ERROR';
