import axios from 'axios';
import type { Campaign, SurveySubmission, Question, CampaignBasicData, BasicSubmissionPayload, BasicSubmissionResponse } from '../types/survey';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://guestconnect.stage.byod.ai/api';

interface ApiResponse<T> {
  status: string;
  code: number;
  data: T;
}

/**
 * Fetches campaign basic details by unique URL token
 */
export const fetchCampaignBasic = async (uniqueUrlToken: string): Promise<CampaignBasicData> => {
  const response = await axios.get<ApiResponse<CampaignBasicData>>(
    `${API_BASE_URL}/feedback/campaign/basic/${uniqueUrlToken}`
  );
  return response.data.data;
};

/**
 * Fetches campaign questions by unique URL token
 */
export const fetchCampaignQuestions = async (uniqueUrlToken: string): Promise<Question[]> => {
  interface QuestionsResponse {
    '@context'?: string;
    '@id'?: string;
    '@type'?: string;
    totalItems: number;
    member: Array<{
      '@type'?: string;
      '@id'?: string;
      id: number;
      questionText: string;
      questionType: 'rating' | 'text' | 'multiplechoice' | 'yesno';
      sortOrder: number;
      options?: string[];
      required?: boolean;
    }>;
  }

  const response = await axios.get<ApiResponse<QuestionsResponse>>(
    `${API_BASE_URL}/feedback/campaign/questions/${uniqueUrlToken}`
  );
  const data = response.data.data;
  
  // Extract questions from member array and map to our format
  if (data && data.member && Array.isArray(data.member)) {
    return data.member
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((apiQuestion) => ({
        id: apiQuestion.id.toString(),
        type: mapQuestionType(apiQuestion.questionType),
        question: apiQuestion.questionText,
        required: apiQuestion.required ?? true,
        options: apiQuestion.options,
      }));
  }
  
  return [];
};

/**
 * Maps API question type to internal question type
 */
const mapQuestionType = (apiType: string): 'rating' | 'text' | 'multipleChoice' | 'yesNo' => {
  const typeMap: Record<string, 'rating' | 'text' | 'multipleChoice' | 'yesNo'> = {
    'rating': 'rating',
    'text': 'text',
    'multiplechoice': 'multipleChoice',
    'yesno': 'yesNo',
  };
  
  return typeMap[apiType.toLowerCase()] || 'text';
};

/**
 * Fetches complete campaign details (combines basic info and questions)
 */
export const fetchCampaign = async (uniqueUrlToken: string): Promise<Campaign> => {
  const [basicInfo, questions] = await Promise.all([
    fetchCampaignBasic(uniqueUrlToken),
    fetchCampaignQuestions(uniqueUrlToken),
  ]);

  return {
    ...basicInfo,
    questions,
  } as Campaign;
};

/**
 * Submits basic survey details and user information
 * Phase 1: Create submission record with metadata and user info
 */
export const submitBasicSurveyInfo = async (payload: BasicSubmissionPayload): Promise<BasicSubmissionResponse> => {
  const response = await axios.post<ApiResponse<BasicSubmissionResponse>>(
    `${API_BASE_URL}/feedback/submission/basic`,
    payload
  );
  return response.data.data;
};

/**
 * Submits survey answers
 * Phase 2: Submit answers using the submission ID from phase 1
 */
export const submitSurveyAnswers = async (submissionId: number, answers: Array<{ questionId: number; answer: string | number }>): Promise<void> => {
  await axios.post(`${API_BASE_URL}/feedback/submission/${submissionId}/answers`, {
    answers,
  });
};

/**
 * Submits a survey response (legacy - kept for compatibility)
 */
export const submitSurvey = async (submission: SurveySubmission): Promise<void> => {
  await axios.post(`${API_BASE_URL}/surveys/submit`, submission);
};

/**
 * Checks if user has already submitted today
 */
export const checkDailySubmission = async (
  campaignId: string,
  identifier: string
): Promise<boolean> => {
  const response = await axios.get(
    `${API_BASE_URL}/surveys/check-daily/${campaignId}/${identifier}`
  );
  return response.data.hasSubmittedToday;
};
