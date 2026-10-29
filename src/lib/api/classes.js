import { db } from './client';

export async function listClasses() {
  const { data, error } = await db().from('classes').select('id, grade, letter, created_at').order('grade').order('letter');
  if (error) throw error;
  return data ?? [];
}
