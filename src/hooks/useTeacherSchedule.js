import { useCallback } from 'react';
import { useTeacher } from './useTeacher';
import { useAsync } from './useAsync';
import { listTeacherLessons } from '../lib/api/lessons';

export function useTeacherSchedule(userId, weekday) {
  const teacherQuery = useTeacher(userId);
  const teacher = teacherQuery.data;
  const teacherId = teacher?.id;
  const loadLessons = useCallback(async () => {
    if (!teacherId || weekday === 7) return [];
    return listTeacherLessons(teacherId);
  }, [teacherId, weekday]);
  const lessonsQuery = useAsync(loadLessons);

  return {
    teacher,
    lessons: lessonsQuery.data ?? [],
    loading: teacherQuery.loading || Boolean(teacher && lessonsQuery.loading),
    error: teacherQuery.error ?? lessonsQuery.error,
    teacherMissing: !teacherQuery.loading && !teacherQuery.error && !teacher,
  };
}
