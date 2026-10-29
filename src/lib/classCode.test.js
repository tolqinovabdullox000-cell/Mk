import { describe, expect, it } from 'vitest';
import { parseClassCode } from './classCode';

describe('parseClassCode', () => {
  it('parses valid grade and letter values including Cyrillic lookalikes', () => {
    expect(parseClassCode('10-A')).toEqual({ grade: 10, letter: 'A' });
    expect(parseClassCode('7-В')).toEqual({ grade: 7, letter: 'B' });
  });

  it('rejects invalid grade and letter combinations', () => {
    expect(parseClassCode('12-A')).toBeNull();
    expect(parseClassCode('2-Я')).toBeNull();
  });
});
