begin;

do $$
begin
  if to_regclass('public.lessons') is null then
    raise exception 'The lessons table was not found. Run supabase/migrations/0001_baseline.sql first.';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'lessons' and column_name = 'room'
  ) or not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'lessons' and column_name = 'weekday'
  ) or not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'lessons' and column_name = 'lesson_no'
  ) then
    raise exception 'Required lessons columns are missing. Restore room, weekday, and lesson_no before migrating.';
  end if;
end
$$;

alter table public.lessons
  add column if not exists allow_shared_room boolean not null default false;

do $$
declare
  duplicate_slots text;
begin
  select string_agg(
    format('room "%s", weekday %s, lesson %s: classes %s', room_key, weekday, lesson_no, class_names),
    E'\n'
  )
  into duplicate_slots
  from (
    select
      lower(btrim(lessons.room)) as room_key,
      lessons.weekday,
      lessons.lesson_no,
      string_agg(format('%s-%s (%s)', classes.grade, classes.letter, lessons.class_id), ', ' order by classes.grade, classes.letter) as class_names
    from public.lessons
    join public.classes on classes.id = lessons.class_id
    where not lessons.allow_shared_room
    group by lower(btrim(lessons.room)), lessons.weekday, lessons.lesson_no
    having count(*) > 1
  ) duplicates;

  if duplicate_slots is not null then
    raise exception 'Cannot enforce shared-room rules because these room/time slots are already duplicated. Review the classes or mark intentional shared lessons allow_shared_room=true, then rerun: %', duplicate_slots;
  end if;
end
$$;

create unique index if not exists lessons_room_weekday_no_key
  on public.lessons (lower(btrim(room)), weekday, lesson_no)
  where not allow_shared_room;

commit;
