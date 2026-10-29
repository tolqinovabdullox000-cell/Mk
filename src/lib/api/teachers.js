import { db } from './client';

const COLUMNS = 'id, full_name, phone, subjects, auth_user_id, created_at';

export async function listTeachers() {
  const { data, error } = await db().from('teachers').select(COLUMNS).order('full_name');
  if (error) throw error;
  return data ?? [];
}

export async function getCurrentTeacher(userId) {
  const { data, error } = await db().from('teachers')
    .select('id, full_name, subjects')
    .eq('auth_user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function countTeachers() {
  const { count, error } = await db().from('teachers').select('id', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}
