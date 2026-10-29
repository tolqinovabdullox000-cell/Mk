export const SCHOOL_TZ = 'Asia/Tashkent';

function partsInSchoolTime(value) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SCHOOL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value instanceof Date ? value : new Date(value));
  return Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
}

export function toISODate(value = new Date()) {
  const parts = partsInSchoolTime(value);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getWeekday(value = new Date()) {
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00Z`)
    : value instanceof Date ? value : new Date(value);
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: SCHOOL_TZ,
    weekday: 'short',
  }).format(date);
  return ({ Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 })[weekday];
}

export function formatTime(value) {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}(:\d{2})?$/.test(value)) return value ?? '';
  return value.slice(0, 5);
}

function millisecondsUntilSchoolMidnight(now) {
  const date = toISODate(now);
  const nextDay = new Date(`${date}T00:00:00Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: SCHOOL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const local = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const localAsUtc = Date.UTC(
    Number(local.year), Number(local.month) - 1, Number(local.day),
    Number(local.hour), Number(local.minute), Number(local.second),
  );
  const offset = localAsUtc - now.getTime();
  const target = nextDay.getTime() - offset;
  return Math.max(1000, target - now.getTime());
}

export function useToday() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer;
    const refresh = () => {
      const current = new Date();
      setNow(current);
      clearTimeout(timer);
      timer = setTimeout(refresh, millisecondsUntilSchoolMidnight(current) + 100);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    refresh();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return { weekday: getWeekday(now), isoDate: toISODate(now) };
}

export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
