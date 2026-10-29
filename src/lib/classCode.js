const CYRILLIC_LOOKALIKS = new Map([
  ['А', 'A'], ['В', 'B'], ['С', 'C'], ['Е', 'E'], ['К', 'K'], ['М', 'M'],
  ['Н', 'H'], ['О', 'O'], ['Р', 'P'], ['Т', 'T'], ['Х', 'X'],
]);

export function parseClassCode(value) {
  const normalized = String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/[АВСЕКМНОРТХ]/g, (letter) => CYRILLIC_LOOKALIKS.get(letter))
    .replace(/[\s-]+/g, '');
  const match = normalized.match(/^(1[01]|[1-9])([A-Z])$/);
  if (!match) return null;
  return { grade: Number(match[1]), letter: match[2] };
}
