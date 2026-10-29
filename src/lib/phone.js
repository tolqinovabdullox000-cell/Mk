export function normalizePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (/^\d{9}$/.test(digits)) return `+998${digits}`;
  if (/^998\d{9}$/.test(digits)) return `+${digits}`;
  return null;
}
