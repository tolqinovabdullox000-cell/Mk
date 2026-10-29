import { supabase } from '../supabase';

export function db() {
  if (!supabase) {
    const error = new Error('Supabase sozlanmagan. VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY sozlang.');
    error.code = 'SUPABASE_NOT_CONFIGURED';
    throw error;
  }
  return supabase;
}

export function toAppError(error) {
  const code = error?.code;
  const constraint = error?.constraint ?? error?.details ?? '';
  if (code === '23505') {
    if (/teacher_weekday_no/i.test(constraint)) return 'errors.teacherBusy';
    if (/room_weekday_no/i.test(constraint)) return 'errors.roomBusy';
    if (/class_weekday_no/i.test(constraint)) return 'errors.classBusy';
    return 'errors.duplicate';
  }
  if (code === '23503') return 'errors.foreignKey';
  if (code === '23502') return 'errors.required';
  if (code === '42501') return 'errors.permissionDenied';
  if (error?.code === 'SUPABASE_NOT_CONFIGURED') return 'errors.notConfigured';
  return 'errors.generic';
}
