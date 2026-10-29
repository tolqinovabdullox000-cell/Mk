import { db } from './client';

export async function listClasses() {
  const { data, error } = await db().from('classes').select('id, grade, letter').order('grade').order('letter');
  if (error) throw error;
  return data ?? [];
}

export async function createClass(values) {
  const { data, error } = await db().from('classes')
    .insert(values)
    .select('id, grade, letter')
    .single();
  if (error) throw error;
  return data;
}

export async function countClasses() {
  const { count, error } = await db().from('classes').select('id', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}
