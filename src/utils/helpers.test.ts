import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  captureMetadata,
  getQueryParams,
  isValidEmail,
  isValidPhone,
  formatPhoneNumber,
} from './helpers';

describe('helpers', () => {
  describe('captureMetadata', () => {
    beforeEach(() => {
      // Reset Date mock
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-04T12:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should capture metadata with timestamp, browser, device, and userAgent', () => {
      const metadata = captureMetadata();

      expect(metadata).toHaveProperty('timestamp');
      expect(metadata).toHaveProperty('browser');
      expect(metadata).toHaveProperty('device');
      expect(metadata).toHaveProperty('userAgent');
      expect(metadata.timestamp).toBe('2026-05-04T12:00:00.000Z');
    });

    it('should detect Chrome browser correctly', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        writable: true,
      });

      const metadata = captureMetadata();
      expect(metadata.browser).toBe('Chrome');
    });

    it('should detect Firefox browser correctly', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        writable: true,
      });

      const metadata = captureMetadata();
      expect(metadata.browser).toBe('Firefox');
    });

    it('should detect Safari browser correctly', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        writable: true,
      });

      const metadata = captureMetadata();
      expect(metadata.browser).toBe('Safari');
    });

    it('should detect Desktop device correctly', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
      });

      const metadata = captureMetadata();
      expect(metadata.device).toBe('Desktop');
    });

    it('should detect Mobile device correctly', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      const metadata = captureMetadata();
      expect(metadata.device).toBe('Mobile');
    });

    it('should detect Tablet device correctly', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
        writable: true,
      });

      const metadata = captureMetadata();
      expect(metadata.device).toBe('Tablet');
    });
  });

  describe('getQueryParams', () => {
    it('should return URLSearchParams from current window location', () => {
      // Mock window.location
      delete (window as any).location;
      window.location = { search: '?param1=value1&param2=value2' } as any;

      const params = getQueryParams();
      expect(params.get('param1')).toBe('value1');
      expect(params.get('param2')).toBe('value2');
    });

    it('should return empty URLSearchParams when no query string', () => {
      delete (window as any).location;
      window.location = { search: '' } as any;

      const params = getQueryParams();
      expect(params.toString()).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
      expect(isValidEmail('test_user@example-domain.com')).toBe(true);
    });

    it('should invalidate incorrect email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('invalid@example')).toBe(false);
      expect(isValidEmail('invalid @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate 10-digit phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('(123) 456-7890')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('123.456.7890')).toBe(true);
    });

    it('should validate 11-digit phone numbers with country code', () => {
      expect(isValidPhone('11234567890')).toBe(true);
      expect(isValidPhone('+1 (123) 456-7890')).toBe(true);
      expect(isValidPhone('1-123-456-7890')).toBe(true);
    });

    it('should invalidate incorrect phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('12345')).toBe(false);
      expect(isValidPhone('123456789')).toBe(false); // 9 digits
      expect(isValidPhone('21234567890')).toBe(false); // 11 digits but not starting with 1
      expect(isValidPhone('123456789012')).toBe(false); // 12 digits
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit phone numbers', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('9876543210')).toBe('(987) 654-3210');
    });

    it('should format 11-digit phone numbers with country code', () => {
      expect(formatPhoneNumber('11234567890')).toBe('+1 (123) 456-7890');
      expect(formatPhoneNumber('19876543210')).toBe('+1 (987) 654-3210');
    });

    it('should handle already formatted phone numbers', () => {
      expect(formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('+1 (123) 456-7890')).toBe('+1 (123) 456-7890');
    });

    it('should return original input for invalid formats', () => {
      expect(formatPhoneNumber('123')).toBe('123');
      expect(formatPhoneNumber('invalid')).toBe('invalid');
      expect(formatPhoneNumber('')).toBe('');
    });

    it('should handle phone numbers with various separators', () => {
      expect(formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('123.456.7890')).toBe('(123) 456-7890');
      expect(formatPhoneNumber('1-123-456-7890')).toBe('+1 (123) 456-7890');
    });
  });
});
