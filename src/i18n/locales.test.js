import { describe, expect, it } from 'vitest';
import ru from './ru';
import uz from './uz';
import uzCyrl from './uz-Cyrl';

const locales = { uz, 'uz-Cyrl': uzCyrl, ru };

function flatten(source, prefix = '') {
  return Object.entries(source).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [[path, value]] : flatten(value, path);
  });
}

function placeholders(value) {
  return [...value.matchAll(/\{(\w+)\}/g)].map(([, name]) => name).sort();
}

describe('locale dictionaries', () => {
  it('has identical keys and interpolation placeholders in every locale', () => {
    const reference = flatten(uz);
    for (const [locale, dictionary] of Object.entries(locales)) {
      const entries = flatten(dictionary);
      expect(entries.map(([key]) => key), `${locale} keys`).toEqual(reference.map(([key]) => key));
      const values = new Map(entries);
      for (const [key, value] of reference) {
        expect(placeholders(values.get(key)), `${locale}.${key} placeholders`).toEqual(placeholders(value));
      }
    }
  });
});
