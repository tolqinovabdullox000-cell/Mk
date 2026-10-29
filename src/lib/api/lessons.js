import { db } from './client';

export const LESSON_COLUMNS = 'id, class_id, teacher_id, subject, weekday, lesson_no, room, allow_shared_room, classes(id, grade, letter), teachers(id, full_name)';

export async function listLessons() {
  const { data, error } = await db().from('lessons').select(LESSON_COLUMNS).order('weekday').order('lesson_no');
  if (error) throw error;
  return data ?? [];
}

export async function listTeacherLessons(teacherId) {
  const { data, error } = await db().from('lessons')
    .select('id, class_id, teacher_id, subject, weekday, lesson_no, room, classes(id, grade, letter)')
    .eq('teacher_id', teacherId).order('weekday').order('lesson_no');
  if (error) throw error;
  return data ?? [];
}
