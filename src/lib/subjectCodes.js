import uz from '../i18n/uz';
import uzCyrl from '../i18n/uz-Cyrl';
import ru from '../i18n/ru';
import { SUBJECT_CODES } from './constants';

const dictionaries = [uz, uzCyrl, ru];

function normalize(value) {
  return String(value ?? '')
    .normalize('NFC')
    .toLocaleLowerCase('uz')
    .replace(/['\u2018\u2019\u02bc`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function subjectCodeFromValue(value) {
  const normalized = normalize(value);
  const code = SUBJECT_CODES.find((item) => item === normalized);
  if (code) return code;
  return SUBJECT_CODES.find((item) => dictionaries.some((dictionary) => (
    normalize(dictionary.subjects[item]) === normalized
  ))) ?? null;
}

export function normalizeLegacySubject(value) {
  return subjectCodeFromValue(value);
}
