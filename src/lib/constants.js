export const DAYS = [
  { value: 1, key: 'weekdays.monday' },
  { value: 2, key: 'weekdays.tuesday' },
  { value: 3, key: 'weekdays.wednesday' },
  { value: 4, key: 'weekdays.thursday' },
  { value: 5, key: 'weekdays.friday' },
  { value: 6, key: 'weekdays.saturday' },
  { value: 7, key: 'weekdays.sunday' },
];

export const LESSON_NUMBERS = Array.from({ length: 9 }, (_, index) => index + 1);
export const CLASS_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const SUBJECT_CODES = [
  'native_language', 'literature', 'math', 'algebra', 'geometry', 'physics',
  'chemistry', 'biology', 'history', 'geography', 'english', 'russian',
  'informatics', 'pe', 'technology', 'art', 'music', 'primary_school',
];
