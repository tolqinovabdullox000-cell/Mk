begin;

do $$
begin
  if to_regclass('public.teachers') is null or to_regclass('public.lessons') is null then
    raise exception 'Baseline tables are missing. Run supabase/migrations/0001_baseline.sql first.';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'teachers' and column_name = 'subjects'
  ) or not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'lessons' and column_name = 'subject'
  ) then
    raise exception 'Subject columns are missing. Restore the expected teachers.subjects and lessons.subject columns before migrating.';
  end if;
end
$$;

create temporary table subject_code_map (
  normalized_label text primary key,
  subject_code text not null
) on commit drop;

insert into subject_code_map (normalized_label, subject_code)
select
  replace(replace(replace(replace(lower(btrim(label)), chr(8216), chr(39)), chr(8217), chr(39)), chr(96), chr(39)), chr(700), chr(39)),
  subject_code
from (values
  ('Ona tili', 'native_language'), ('Она тили', 'native_language'), ('Родной язык', 'native_language'),
  ('Adabiyot', 'literature'), ('Адабиёт', 'literature'), ('Литература', 'literature'),
  ('Matematika', 'math'), ('Математика', 'math'),
  ('Algebra', 'algebra'), ('Алгебра', 'algebra'),
  ('Geometriya', 'geometry'), ('Геометрия', 'geometry'),
  ('Fizika', 'physics'), ('Физика', 'physics'),
  ('Kimyo', 'chemistry'), ('Кимё', 'chemistry'), ('Химия', 'chemistry'),
  ('Biologiya', 'biology'), ('Биология', 'biology'),
  ('Tarix', 'history'), ('Тарих', 'history'), ('История', 'history'),
  ('Geografiya', 'geography'), ('География', 'geography'),
  ('Ingliz tili', 'english'), ('Инглиз тили', 'english'), ('Английский язык', 'english'),
  ('Rus tili', 'russian'), ('Рус тили', 'russian'), ('Русский язык', 'russian'),
  ('Informatika', 'informatics'), ('Информатика', 'informatics'),
  ('Jismoniy tarbiya', 'pe'), ('Жисмоний тарбия', 'pe'), ('Физкультура', 'pe'),
  ('Texnologiya', 'technology'), ('Технология', 'technology'),
  ('Tasviriy san''at', 'art'), ('Тасвирий санъат', 'art'), ('Изобразительное искусство', 'art'),
  ('Musiqa', 'music'), ('Мусиқа', 'music'), ('Музыка', 'music'),
  ('Boshlang''ich sinf', 'primary_school'), ('Бошланғич синф', 'primary_school'), ('Начальная школа', 'primary_school'),
  ('native_language', 'native_language'), ('literature', 'literature'), ('math', 'math'),
  ('algebra', 'algebra'), ('geometry', 'geometry'), ('physics', 'physics'),
  ('chemistry', 'chemistry'), ('biology', 'biology'), ('history', 'history'),
  ('geography', 'geography'), ('english', 'english'), ('russian', 'russian'),
  ('informatics', 'informatics'), ('pe', 'pe'), ('technology', 'technology'),
  ('art', 'art'), ('music', 'music'), ('primary_school', 'primary_school')
) as labels(label, subject_code);

do $$
declare
  unknown_value text;
begin
  for unknown_value in
    select distinct teacher_subjects.value as subject
    from public.teachers teachers
    cross join lateral unnest(teachers.subjects) as teacher_subjects(value)
    where not exists (
      select 1 from subject_code_map mapping
      where mapping.normalized_label =
        replace(replace(replace(replace(lower(btrim(teacher_subjects.value)), chr(8216), chr(39)), chr(8217), chr(39)), chr(96), chr(39)), chr(700), chr(39))
    )
  loop
    raise notice 'Unmapped teachers.subjects value kept unchanged: %', unknown_value;
  end loop;

  for unknown_value in
    select distinct lessons.subject
    from public.lessons
    where not exists (
      select 1 from subject_code_map mapping
      where mapping.normalized_label =
        replace(replace(replace(replace(lower(btrim(lessons.subject)), chr(8216), chr(39)), chr(8217), chr(39)), chr(96), chr(39)), chr(700), chr(39))
    )
  loop
    raise notice 'Unmapped lessons.subject value kept unchanged: %', unknown_value;
  end loop;
end
$$;

update public.teachers teachers
set subjects = (
  select coalesce(array_agg(coalesce(mapping.subject_code, subject_values.value) order by subject_values.ordinality), '{}')
  from unnest(teachers.subjects) with ordinality as subject_values(value, ordinality)
  left join subject_code_map mapping
    on mapping.normalized_label =
      replace(replace(replace(replace(lower(btrim(subject_values.value)), chr(8216), chr(39)), chr(8217), chr(39)), chr(96), chr(39)), chr(700), chr(39))
);

update public.lessons lessons
set subject = coalesce((
  select mapping.subject_code
  from subject_code_map mapping
  where mapping.normalized_label =
    replace(replace(replace(replace(lower(btrim(lessons.subject)), chr(8216), chr(39)), chr(8217), chr(39)), chr(96), chr(39)), chr(700), chr(39))
), lessons.subject);

commit;
