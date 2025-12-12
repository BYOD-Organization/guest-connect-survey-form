/**
 * Mock Data for Local Development
 * 
 * This file provides sample campaign data for testing the survey form
 * without needing a backend API.
 */

import type { Campaign } from '../types/survey';

export const mockCampaign: Campaign = {
  id: 'mock-campaign-123',
  title: 'Customer Feedback Survey',
  logoUrl: 'https://via.placeholder.com/200x80?text=Company+Logo',
  isActive: true,
  isRewardSurvey: true,
  rewardDetailsText: 'Thank you for your feedback! We will draw random names on January 3rd, 2026, and notify the winner by email. Good Luck!',
  disclaimer: 'Your privacy is important to us. We will not share your information with third parties.',
  allowMultipleEntriesPerDay: false,
  questions: [
    {
      id: 'q1',
      type: 'rating',
      question: 'How would you rate your overall experience?',
      required: true,
      maxRating: 5,
    },
    {
      id: 'q2',
      type: 'yesNo',
      question: 'Would you recommend us to a friend?',
      required: true,
    },
    {
      id: 'q3',
      type: 'multipleChoice',
      question: 'How did you hear about us?',
      required: true,
      options: [
        'Social Media',
        'Friend/Family',
        'Search Engine',
        'Advertisement',
        'Other',
      ],
    },
    {
      id: 'q4',
      type: 'text',
      question: 'What could we improve?',
      required: false,
    },
    {
      id: 'q5',
      type: 'text',
      question: 'Any additional comments?',
      required: false,
    },
  ],
};

export const mockInactiveCampaign: Campaign = {
  ...mockCampaign,
  id: 'mock-inactive-campaign',
  isActive: false,
};

export const mockNonRewardCampaign: Campaign = {
  ...mockCampaign,
  id: 'mock-non-reward-campaign',
  isRewardSurvey: false,
  rewardDetailsText: undefined,
  questions: [
    {
      id: 'q1',
      type: 'rating',
      question: 'How satisfied are you with our service?',
      required: true,
      maxRating: 5,
    },
    {
      id: 'q2',
      type: 'text',
      question: 'What did you like most?',
      required: true,
    },
  ],
};
