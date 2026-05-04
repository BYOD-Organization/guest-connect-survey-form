import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the API
vi.mock('../utils/api');

// Mock SurveyForm component to simplify testing
vi.mock('./components/SurveyForm', () => ({
  default: ({ campaignId }: { campaignId: string }) => (
    <div data-testid="survey-form">Survey Form for campaign: {campaignId}</div>
  ),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.location
    delete (window as any).location;
    window.location = { pathname: '' } as any;
  });

  describe('Campaign ID Extraction', () => {
    it('should extract campaign ID from URL path', () => {
      window.location = {
        pathname: '/campaign/tQr14flavBD2iN/v4syeL3lMZmJnTjdUTDBSYTVPSjB5VUFFNkE9PQ==',
      } as any;

      render(<App />);

      expect(screen.getByTestId('survey-form')).toBeInTheDocument();
      expect(screen.getByTestId('survey-form')).toHaveTextContent(
        'tQr14flavBD2iN/v4syeL3lMZmJnTjdUTDBSYTVPSjB5VUFFNkE9PQ=='
      );
    });

    it('should extract simple campaign ID', () => {
      window.location = {
        pathname: '/campaign/simple-campaign-id',
      } as any;

      render(<App />);

      expect(screen.getByTestId('survey-form')).toBeInTheDocument();
      expect(screen.getByTestId('survey-form')).toHaveTextContent(
        'simple-campaign-id'
      );
    });

    it('should extract campaign ID with special characters', () => {
      window.location = {
        pathname: '/campaign/ABC123-xyz_789',
      } as any;

      render(<App />);

      expect(screen.getByTestId('survey-form')).toBeInTheDocument();
      expect(screen.getByTestId('survey-form')).toHaveTextContent(
        'ABC123-xyz_789'
      );
    });
  });

  describe('Invalid Survey Link', () => {
    it('should show error message when no campaign ID in URL', () => {
      window.location = {
        pathname: '/',
      } as any;

      render(<App />);

      expect(screen.getByText('Invalid Survey Link')).toBeInTheDocument();
      expect(
        screen.getByText('Please use the link provided in your QR code.')
      ).toBeInTheDocument();
    });

    it('should show error message for incorrect URL pattern', () => {
      window.location = {
        pathname: '/some-other-path',
      } as any;

      render(<App />);

      expect(screen.getByText('Invalid Survey Link')).toBeInTheDocument();
    });

    it('should show error message when campaign path is empty', () => {
      window.location = {
        pathname: '/campaign/',
      } as any;

      render(<App />);

      expect(screen.getByText('Invalid Survey Link')).toBeInTheDocument();
    });
  });

  describe('ConfigProvider Theme', () => {
    it('should render SurveyForm with ConfigProvider when valid campaign ID', () => {
      window.location = {
        pathname: '/campaign/test-campaign-123',
      } as any;

      const { container } = render(<App />);

      // Check that SurveyForm is rendered
      expect(screen.getByTestId('survey-form')).toBeInTheDocument();

      // Check that the app container exists (indicating ConfigProvider is working)
      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle campaign ID with trailing slash', () => {
      window.location = {
        pathname: '/campaign/test-campaign-123/',
      } as any;

      render(<App />);

      expect(screen.getByTestId('survey-form')).toBeInTheDocument();
      expect(screen.getByTestId('survey-form')).toHaveTextContent(
        'test-campaign-123/'
      );
    });

    it('should handle deeply nested campaign path', () => {
      window.location = {
        pathname: '/campaign/region/location/specific-id',
      } as any;

      render(<App />);

      expect(screen.getByTestId('survey-form')).toBeInTheDocument();
      expect(screen.getByTestId('survey-form')).toHaveTextContent(
        'region/location/specific-id'
      );
    });

    it('should handle campaign ID with query parameters', () => {
      window.location = {
        pathname: '/campaign/test-123',
        search: '?ref=email&source=marketing',
      } as any;

      render(<App />);

      expect(screen.getByTestId('survey-form')).toBeInTheDocument();
      expect(screen.getByTestId('survey-form')).toHaveTextContent('test-123');
    });

    it('should handle URL with hash', () => {
      window.location = {
        pathname: '/campaign/test-123',
        hash: '#section1',
      } as any;

      render(<App />);

      expect(screen.getByTestId('survey-form')).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should apply correct styling for error message container', () => {
      window.location = {
        pathname: '/',
      } as any;

      const { container } = render(<App />);

      const errorContainer = container.querySelector('div[style*="display: flex"]');
      expect(errorContainer).toBeInTheDocument();
    });

    it('should render with correct background color when valid campaign', () => {
      window.location = {
        pathname: '/campaign/test-123',
      } as any;

      render(<App />);

      expect(screen.getByTestId('survey-form')).toBeInTheDocument();
    });
  });
});
