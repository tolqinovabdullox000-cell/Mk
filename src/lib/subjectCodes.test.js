import { describe, expect, it } from 'vitest';
import { normalizeLegacySubject, subjectCodeFromValue } from './subjectCodes';

describe('subject codes', () => {
  it('accepts codes and subject names in each supported locale', () => {
    expect(subjectCodeFromValue('native_language')).toBe('native_language');
    expect(subjectCodeFromValue('Ona tili')).toBe('native_language');
    expect(subjectCodeFromValue('Она тили')).toBe('native_language');
    expect(subjectCodeFromValue('Родной язык')).toBe('native_language');
  });

  it('normalizes apostrophe variants and keeps unknown values unknown', () => {
    expect(subjectCodeFromValue("Tasviriy san'at")).toBe('art');
    expect(subjectCodeFromValue('Tasviriy san‘at')).toBe('art');
    expect(subjectCodeFromValue('Tasviriy san’at')).toBe('art');
    expect(subjectCodeFromValue('Tasviriy san`at')).toBe('art');
    expect(subjectCodeFromValue('Tasviriy san’ат')).toBeNull();
    expect(normalizeLegacySubject('Tasviriy sanʼat')).toBe('art');
    expect(subjectCodeFromValue('not a subject')).toBeNull();
  });
});
