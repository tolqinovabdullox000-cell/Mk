import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { getWeekday, toISODate, useNow, useToday } from './dates';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('date hooks', () => {
  it('returns today and the current time without throwing', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-29T07:00:00.000Z'));

    const today = renderHook(() => useToday());
    const now = renderHook(() => useNow());

    expect(today.result.current.isoDate).toBe('2026-10-29');
    expect(today.result.current.weekday).toBe(4);
    expect(now.result.current).toEqual(new Date('2026-10-29T07:00:00.000Z'));
  });

  it('uses Sunday as weekday 7 and rolls over at midnight in Tashkent', () => {
    expect(getWeekday('2026-10-25')).toBe(7);
    expect(toISODate(new Date('2026-10-28T18:59:59.000Z'))).toBe('2026-10-28');
    expect(toISODate(new Date('2026-10-28T19:00:00.000Z'))).toBe('2026-10-29');

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-28T18:59:59.000Z'));
    const { result } = renderHook(() => useToday());
    expect(result.current.isoDate).toBe('2026-10-28');
    act(() => vi.advanceTimersByTime(1_100));
    expect(result.current.isoDate).toBe('2026-10-29');
    expect(result.current.weekday).toBe(4);
  });
});
