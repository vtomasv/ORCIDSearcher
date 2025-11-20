import { describe, it, expect } from 'vitest';
import { normalizeText, buildOrcidSearchUrl } from './utils';

describe('normalizeText', () => {
  it('should remove accents from text', () => {
    expect(normalizeText('José María')).toBe('jose maria');
    expect(normalizeText('François')).toBe('francois');
    expect(normalizeText('Müller')).toBe('muller');
  });

  it('should convert to lowercase', () => {
    expect(normalizeText('JOHN DOE')).toBe('john doe');
    expect(normalizeText('John Doe')).toBe('john doe');
  });

  it('should remove special characters except spaces', () => {
    expect(normalizeText('O\'Brien')).toBe('obrien');
    expect(normalizeText('Jean-Paul')).toBe('jeanpaul');
  });

  it('should handle empty strings', () => {
    expect(normalizeText('')).toBe('');
  });

  it('should handle strings with only special characters', () => {
    expect(normalizeText('---')).toBe('');
    expect(normalizeText('!!!')).toBe('');
  });

  it('should preserve spaces between words', () => {
    expect(normalizeText('María José García')).toBe('maria jose garcia');
  });
});

describe('buildOrcidSearchUrl', () => {
  it('should build URL with all parameters', () => {
    const url = buildOrcidSearchUrl('John', 'Doe', 'MIT');
    expect(url).toContain('firstName=John');
    expect(url).toContain('lastName=Doe');
    expect(url).toContain('institution=MIT');
  });

  it('should encode special characters', () => {
    const url = buildOrcidSearchUrl('José', 'García', 'Universidad de La República');
    expect(url).toContain('firstName=Jos%C3%A9');
    expect(url).toContain('lastName=Garc%C3%ADa');
    expect(url).toContain('institution=Universidad');
  });

  it('should handle empty institution', () => {
    const url = buildOrcidSearchUrl('John', 'Doe', '');
    expect(url).toContain('firstName=John');
    expect(url).toContain('lastName=Doe');
    expect(url).not.toContain('institution=');
  });

  it('should handle undefined institution', () => {
    const url = buildOrcidSearchUrl('John', 'Doe');
    expect(url).toContain('firstName=John');
    expect(url).toContain('lastName=Doe');
    expect(url).not.toContain('institution');
  });

  it('should start with correct base URL', () => {
    const url = buildOrcidSearchUrl('John', 'Doe');
    expect(url).toMatch(/^https:\/\/orcid\.org\/orcid-search\/search\?/);
  });
});
