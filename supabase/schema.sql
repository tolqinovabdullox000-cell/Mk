create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'teacher')),
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null default '',
  subjects text[] not null default '{}',
  auth_user_id uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  grade integer not null check (grade between 1 and 11),
  letter text not null,
  created_at timestamptz not null default now(),
  constraint classes_grade_letter_key unique (grade, letter)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  subject text not null,
  weekday integer not null check (weekday between 1 and 6),
  lesson_no integer not null check (lesson_no between 1 and 9),
  room text not null,
  allow_shared_room boolean not null default false,
  created_at timestamptz not null default now(),
  constraint lessons_class_weekday_no_key unique (class_id, weekday, lesson_no),
  constraint lessons_teacher_weekday_no_key unique (teacher_id, weekday, lesson_no)
);

create unique index if not exists lessons_room_weekday_no_key
  on public.lessons (lower(btrim(room)), weekday, lesson_no)
  where not allow_shared_room;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.teachers enable row level security;
alter table public.classes enable row level security;
alter table public.lessons enable row level security;

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "teachers_admin_all" on public.teachers;
create policy "teachers_admin_all" on public.teachers
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "teachers_teacher_select" on public.teachers;
create policy "teachers_teacher_select" on public.teachers
  for select to authenticated
  using (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'teacher'));

drop policy if exists "classes_admin_all" on public.classes;
create policy "classes_admin_all" on public.classes
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "classes_teacher_select" on public.classes;
create policy "classes_teacher_select" on public.classes
  for select to authenticated
  using (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'teacher'));

drop policy if exists "lessons_admin_all" on public.lessons;
create policy "lessons_admin_all" on public.lessons
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "lessons_teacher_select" on public.lessons;
create policy "lessons_teacher_select" on public.lessons
  for select to authenticated
  using (exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'teacher'));

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.teachers, public.classes, public.lessons to authenticated;
grant execute on function public.is_admin() to authenticated;
