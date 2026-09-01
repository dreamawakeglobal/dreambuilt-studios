// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { sanitizeInput, isValidEmail, saveSubmissionLocally, clearSubmissionLocally } from '../forms.js';

describe('Form Validation & Security Sanitization', () => {
  describe('sanitizeInput', () => {
    it('strips dangerous HTML angle brackets to prevent XSS injection', () => {
      const input = '<script>alert("hack")</script>Hello World';
      const output = sanitizeInput(input);
      expect(output).toBe('scriptalert("hack")/scriptHello World');
      expect(output).not.toContain('<');
      expect(output).not.toContain('>');
    });

    it('trims leading and trailing whitespace', () => {
      const input = '   Dream Built Studios   ';
      expect(sanitizeInput(input)).toBe('Dream Built Studios');
    });

    it('limits unbounded payload lengths to 5000 characters', () => {
      const hugeInput = 'A'.repeat(6000);
      const output = sanitizeInput(hugeInput);
      expect(output.length).toBe(5000);
    });

    it('returns non-string values as-is safely', () => {
      expect(sanitizeInput(null)).toBe(null);
      expect(sanitizeInput(undefined)).toBe(undefined);
      expect(sanitizeInput(12345)).toBe(12345);
    });
  });

  describe('isValidEmail', () => {
    it('accepts valid email addresses', () => {
      expect(isValidEmail('tariq@dreambuiltstudios.com')).toBe(true);
      expect(isValidEmail('client.support+vip@example.co.uk')).toBe(true);
      expect(isValidEmail('hello@domain.org')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('plainaddress')).toBe(false);
      expect(isValidEmail('@missingusername.com')).toBe(false);
      expect(isValidEmail('missingdomain@.com')).toBe(false);
      expect(isValidEmail('spaces in@domain.com')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });
  });

  describe('LocalStorage Backup & Recovery', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('saves submission locally for recovery and limits history to 5 entries', () => {
      for (let i = 1; i <= 7; i++) {
        saveSubmissionLocally('consultations', { testId: i, name: `Client ${i}` });
      }

      const stored = JSON.parse(localStorage.getItem('dreambuilt_form_submissions'));
      expect(stored).toBeInstanceOf(Array);
      expect(stored.length).toBe(5);
      expect(stored[0].testId).toBe(7); // Most recent first
    });

    it('clears stored submissions after confirmed transmission', () => {
      saveSubmissionLocally('consultations', { email: 'client@example.com' });
      saveSubmissionLocally('project_submissions', { company: 'Dream Brand' });

      clearSubmissionLocally('consultations');

      const remaining = JSON.parse(localStorage.getItem('dreambuilt_form_submissions'));
      expect(remaining.length).toBe(1);
      expect(remaining[0].table).toBe('project_submissions');
    });
  });
});
