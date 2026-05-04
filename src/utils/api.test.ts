import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import {
  fetchCampaignBasic,
  fetchCampaignQuestions,
  fetchCampaign,
  submitBasicSurveyInfo,
  submitSurveyAnswers,
  submitSurvey,
} from './api';
import type {
  CampaignBasicData,
  BasicSubmissionPayload,
  AnswersSubmissionPayload,
  SurveySubmission,
} from '../types/survey';

describe('api', () => {
  let mock: MockAdapter;
  const API_BASE_URL = 'https://guestconnect.stage.byod.ai/api';

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  describe('fetchCampaignBasic', () => {
    it('should fetch campaign basic data successfully', async () => {
      const uniqueUrlToken = 'test-token-123';
      const mockCampaignData: CampaignBasicData = {
        title: 'Test Campaign',
        workplace: {
          '@id': '/api/workplaces/1',
          '@type': 'Workplace',
          id: 1,
          name: 'Test Workplace',
        },
        reward: {
          '@id': '/api/rewards/1',
          '@type': 'Reward',
          id: 1,
          title: 'Test Reward',
          description: 'Win a prize!',
        },
        winnersCount: 5,
        rewardDetailsText: 'Enter to win!',
        active: true,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        guestConnectSetting: {
          logoPath: '/logo.png',
          disclaimerText: '',
        },
      };

      mock.onGet(`${API_BASE_URL}/feedback/campaign/basic/${uniqueUrlToken}`).reply(200, {
        status: 'success',
        code: 200,
        data: mockCampaignData,
      });

      const result = await fetchCampaignBasic(uniqueUrlToken);

      expect(result).toEqual(mockCampaignData);
      expect(result.title).toBe('Test Campaign');
      expect(result.workplace?.name).toBe('Test Workplace');
    });

    it('should throw error when API request fails', async () => {
      const uniqueUrlToken = 'invalid-token';

      mock.onGet(`${API_BASE_URL}/feedback/campaign/basic/${uniqueUrlToken}`).reply(404, {
        status: 'error',
        code: 404,
        message: 'Campaign not found',
      });

      await expect(fetchCampaignBasic(uniqueUrlToken)).rejects.toThrow();
    });
  });

  describe('fetchCampaignQuestions', () => {
    it('should fetch and transform campaign questions successfully', async () => {
      const uniqueUrlToken = 'test-token-123';
      const mockQuestionsResponse = {
        '@context': '/api/contexts/Question',
        '@id': '/api/questions',
        '@type': 'hydra:Collection',
        totalItems: 2,
        member: [
          {
            '@type': 'Question',
            '@id': '/api/questions/1',
            id: 1,
            questionText: 'How was your experience?',
            questionType: 'rating',
            sortOrder: 1,
            required: true,
          },
          {
            '@type': 'Question',
            '@id': '/api/questions/2',
            id: 2,
            questionText: 'Any comments?',
            questionType: 'text',
            sortOrder: 2,
            required: false,
          },
        ],
      };

      mock.onGet(`${API_BASE_URL}/feedback/campaign/questions/${uniqueUrlToken}`).reply(200, {
        status: 'success',
        code: 200,
        data: mockQuestionsResponse,
      });

      const result = await fetchCampaignQuestions(uniqueUrlToken);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: '1',
        type: 'rating',
        question: 'How was your experience?',
        required: true,
        options: undefined,
      });
      expect(result[1]).toEqual({
        id: '2',
        type: 'text',
        question: 'Any comments?',
        required: false,
        options: undefined,
      });
    });

    it('should handle multiple choice questions with options', async () => {
      const uniqueUrlToken = 'test-token-123';
      const mockQuestionsResponse = {
        totalItems: 1,
        member: [
          {
            id: 1,
            questionText: 'Select your preference',
            questionType: 'multiplechoice',
            sortOrder: 1,
            required: true,
            options: ['Option A', 'Option B', 'Option C'],
          },
        ],
      };

      mock.onGet(`${API_BASE_URL}/feedback/campaign/questions/${uniqueUrlToken}`).reply(200, {
        status: 'success',
        code: 200,
        data: mockQuestionsResponse,
      });

      const result = await fetchCampaignQuestions(uniqueUrlToken);

      expect(result[0].type).toBe('multipleChoice');
      expect(result[0].options).toEqual(['Option A', 'Option B', 'Option C']);
    });

    it('should sort questions by sortOrder', async () => {
      const uniqueUrlToken = 'test-token-123';
      const mockQuestionsResponse = {
        totalItems: 3,
        member: [
          {
            id: 3,
            questionText: 'Question 3',
            questionType: 'text',
            sortOrder: 3,
          },
          {
            id: 1,
            questionText: 'Question 1',
            questionType: 'text',
            sortOrder: 1,
          },
          {
            id: 2,
            questionText: 'Question 2',
            questionType: 'text',
            sortOrder: 2,
          },
        ],
      };

      mock.onGet(`${API_BASE_URL}/feedback/campaign/questions/${uniqueUrlToken}`).reply(200, {
        status: 'success',
        code: 200,
        data: mockQuestionsResponse,
      });

      const result = await fetchCampaignQuestions(uniqueUrlToken);

      expect(result[0].question).toBe('Question 1');
      expect(result[1].question).toBe('Question 2');
      expect(result[2].question).toBe('Question 3');
    });

    it('should return empty array when no questions', async () => {
      const uniqueUrlToken = 'test-token-123';

      mock.onGet(`${API_BASE_URL}/feedback/campaign/questions/${uniqueUrlToken}`).reply(200, {
        status: 'success',
        code: 200,
        data: { totalItems: 0, member: [] },
      });

      const result = await fetchCampaignQuestions(uniqueUrlToken);

      expect(result).toEqual([]);
    });
  });

  describe('fetchCampaign', () => {
    it('should fetch complete campaign with basic info and questions', async () => {
      const uniqueUrlToken = 'test-token-123';
      const mockBasicData: CampaignBasicData = {
        title: 'Test Campaign',
        active: true,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        guestConnectSetting: {
          logoPath: '/logo.png',
          disclaimerText: '',
        },
      };

      const mockQuestionsResponse = {
        totalItems: 1,
        member: [
          {
            id: 1,
            questionText: 'How was it?',
            questionType: 'rating',
            sortOrder: 1,
            required: true,
          },
        ],
      };

      mock.onGet(`${API_BASE_URL}/feedback/campaign/basic/${uniqueUrlToken}`).reply(200, {
        status: 'success',
        code: 200,
        data: mockBasicData,
      });

      mock.onGet(`${API_BASE_URL}/feedback/campaign/questions/${uniqueUrlToken}`).reply(200, {
        status: 'success',
        code: 200,
        data: mockQuestionsResponse,
      });

      const result = await fetchCampaign(uniqueUrlToken);

      expect(result.title).toBe('Test Campaign');
      expect(result.questions).toHaveLength(1);
      expect(result.questions![0].question).toBe('How was it?');
    });

    it('should handle errors from either endpoint', async () => {
      const uniqueUrlToken = 'test-token-123';

      mock.onGet(`${API_BASE_URL}/feedback/campaign/basic/${uniqueUrlToken}`).reply(500);
      mock.onGet(`${API_BASE_URL}/feedback/campaign/questions/${uniqueUrlToken}`).reply(200, {
        status: 'success',
        code: 200,
        data: { totalItems: 0, member: [] },
      });

      await expect(fetchCampaign(uniqueUrlToken)).rejects.toThrow();
    });
  });

  describe('submitBasicSurveyInfo', () => {
    it('should submit basic survey info successfully', async () => {
      const payload: BasicSubmissionPayload = {
        rewardOptIn: true,
        metadataJson: [{ timestamp: '2026-05-04T12:00:00Z', browser: 'Chrome', device: 'Desktop' }],
        workplace: '/api/workplaces/1',
        uniqueUrlToken: 'test-token-123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
      };

      const mockResponse = {
        id: 'submission-123',
        createdAt: '2026-05-04T12:00:00Z',
      };

      mock.onPost(`${API_BASE_URL}/feedback/submission/basic`).reply(200, {
        status: 'success',
        code: 200,
        data: mockResponse,
      });

      const result = await submitBasicSurveyInfo(payload);

      expect(result.id).toBe('submission-123');
      expect(mock.history.post).toHaveLength(1);
      expect(JSON.parse(mock.history.post[0].data)).toEqual(payload);
    });

    it('should handle submission errors', async () => {
      const payload: BasicSubmissionPayload = {
        rewardOptIn: false,
        metadataJson: [{ timestamp: '2026-05-04T12:00:00Z' }],
        workplace: '/api/workplaces/1',
        uniqueUrlToken: 'test-token-123',
      };

      mock.onPost(`${API_BASE_URL}/feedback/submission/basic`).reply(400, {
        status: 'error',
        code: 400,
        message: 'Invalid payload',
      });

      await expect(submitBasicSurveyInfo(payload)).rejects.toThrow();
    });
  });

  describe('submitSurveyAnswers', () => {
    it('should submit survey answers successfully', async () => {
      const payload: AnswersSubmissionPayload = {
        uniqueUrlToken: 'test-token-123',
        feedbackSubmissionId: 1,
        answers: [
          { questionId: 1, value: 5 },
          { questionId: 2, value: 'Great service!' },
        ],
      };

      mock.onPost(`${API_BASE_URL}/feedback/submission/answers`).reply(200, {
        status: 'success',
        code: 200,
      });

      await submitSurveyAnswers(payload);

      expect(mock.history.post).toHaveLength(1);
      expect(JSON.parse(mock.history.post[0].data)).toEqual(payload);
    });

    it('should handle rate limiting (429)', async () => {
      const payload: AnswersSubmissionPayload = {
        uniqueUrlToken: 'test-token-123',
        feedbackSubmissionId: 1,
        answers: [],
      };

      mock.onPost(`${API_BASE_URL}/feedback/submission/answers`).reply(429, {
        status: 'error',
        code: 429,
        message: 'Too many requests',
      });

      await expect(submitSurveyAnswers(payload)).rejects.toThrow();
    });
  });

  describe('submitSurvey (legacy)', () => {
    it('should submit survey using legacy endpoint', async () => {
      const submission: SurveySubmission = {
        campaignId: 'campaign-123',
        answers: [
          { questionId: 1, answer: 5 },
          { questionId: 2, answer: 'Good' }
        ],
        metadata: {
          browser: 'Chrome',
          device: 'Desktop',
          timestamp: '2026-05-04T12:00:00.000Z',
          userAgent: 'test-agent'
        },
      };

      mock.onPost(`${API_BASE_URL}/surveys/submit`).reply(200, {
        status: 'success',
        code: 200,
      });

      await submitSurvey(submission);

      expect(mock.history.post).toHaveLength(1);
      expect(JSON.parse(mock.history.post[0].data)).toEqual(submission);
    });
  });
});
