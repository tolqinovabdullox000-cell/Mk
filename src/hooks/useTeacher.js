import { useCallback } from 'react';
import { useAsync } from './useAsync';
import { getCurrentTeacher } from '../lib/api/teachers';

export function useTeacher(userId) {
  const loadTeacher = useCallback(() => getCurrentTeacher(userId), [userId]);
  return useAsync(loadTeacher);
}
