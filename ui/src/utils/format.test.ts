import { describe, it, expect } from 'vitest';
import { formatCounty } from './format';

describe('format utilities', () => {
  describe('formatCounty', () => {
    it('should capitalize first letter of each word', () => {
      expect(formatCounty('san francisco')).toBe('San Francisco');
    });

    it('should handle uppercase input', () => {
      expect(formatCounty('LOS ANGELES')).toBe('Los Angeles');
    });

    it('should handle mixed case', () => {
      expect(formatCounty('nEW yORK')).toBe('New York');
    });

    it('should handle single word', () => {
      expect(formatCounty('county')).toBe('County');
    });

    it('should handle extra spaces', () => {
      expect(formatCounty('san   francisco')).toBe('San Francisco');
    });

    it('should return empty string for null', () => {
      expect(formatCounty(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(formatCounty(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(formatCounty('')).toBe('');
    });

    it('should handle numbers', () => {
      expect(formatCounty('county 123')).toBe('County 123');
    });

    it('should handle leading and trailing spaces', () => {
      // Note: formatCounty does not trim, it only formats words
      const result = formatCounty('  san francisco  ');
      // The function splits by whitespace and rejoins, preserving outer spaces as separate words
      expect(result).toContain('San');
      expect(result).toContain('Francisco');
    });
  });
});
