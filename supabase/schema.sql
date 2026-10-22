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
  created_at timestamptz not null default now(),
  constraint lessons_class_weekday_no_key unique (class_id, weekday, lesson_no),
  constraint lessons_teacher_weekday_no_key unique (teacher_id, weekday, lesson_no)
);

alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

alter table public.teachers add column if not exists id uuid default gen_random_uuid();
alter table public.teachers add column if not exists full_name text not null default '';
alter table public.teachers add column if not exists phone text not null default '';
alter table public.teachers add column if not exists subjects text[] not null default '{}';
alter table public.teachers add column if not exists auth_user_id uuid;
alter table public.teachers add column if not exists created_at timestamptz not null default now();

alter table public.classes add column if not exists id uuid default gen_random_uuid();
alter table public.classes add column if not exists grade integer not null default 1;
alter table public.classes add column if not exists letter text not null default 'A';
alter table public.classes add column if not exists created_at timestamptz not null default now();

alter table public.lessons add column if not exists id uuid default gen_random_uuid();
alter table public.lessons add column if not exists class_id uuid;
alter table public.lessons add column if not exists teacher_id uuid;
alter table public.lessons add column if not exists subject text not null default '';
alter table public.lessons add column if not exists weekday integer not null default 1;
alter table public.lessons add column if not exists lesson_no integer not null default 1;
alter table public.lessons add column if not exists room text not null default '';
alter table public.lessons add column if not exists created_at timestamptz not null default now();

update public.teachers set id = gen_random_uuid() where id is null;
update public.classes set id = gen_random_uuid() where id is null;
update public.lessons set id = gen_random_uuid() where id is null;
alter table public.teachers alter column id set not null;
alter table public.classes alter column id set not null;
alter table public.lessons alter column id set not null;

create unique index if not exists teachers_id_key on public.teachers (id);
create unique index if not exists teachers_auth_user_id_key on public.teachers (auth_user_id);
create unique index if not exists classes_id_key on public.classes (id);
create unique index if not exists classes_grade_letter_key on public.classes (grade, letter);
create unique index if not exists lessons_id_key on public.lessons (id);
create unique index if not exists lessons_class_weekday_no_key on public.lessons (class_id, weekday, lesson_no);
create unique index if not exists lessons_teacher_weekday_no_key on public.lessons (teacher_id, weekday, lesson_no);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_check' and conrelid = 'public.profiles'::regclass) then
    alter table public.profiles add constraint profiles_role_check
      check (role in ('admin', 'teacher')) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'classes_grade_check' and conrelid = 'public.classes'::regclass) then
    alter table public.classes add constraint classes_grade_check
      check (grade between 1 and 11) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'lessons_weekday_check' and conrelid = 'public.lessons'::regclass) then
    alter table public.lessons add constraint lessons_weekday_check
      check (weekday between 1 and 6) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'lessons_lesson_no_check' and conrelid = 'public.lessons'::regclass) then
    alter table public.lessons add constraint lessons_lesson_no_check
      check (lesson_no between 1 and 9) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'lessons_class_id_fkey' and conrelid = 'public.lessons'::regclass) then
    alter table public.lessons add constraint lessons_class_id_fkey
      foreign key (class_id) references public.classes(id) on delete cascade not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'lessons_teacher_id_fkey' and conrelid = 'public.lessons'::regclass) then
    alter table public.lessons add constraint lessons_teacher_id_fkey
      foreign key (teacher_id) references public.teachers(id) on delete cascade not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'teachers_auth_user_id_fkey' and conrelid = 'public.teachers'::regclass) then
    alter table public.teachers add constraint teachers_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users(id) on delete set null not valid;
  end if;
end $$;

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

-- Supabase Auth'da hisob yaratilgach, uning UUIDsi bilan profil qo'shing:
-- insert into public.profiles (id, role, full_name)
-- values ('AUTH_USER_UUID', 'admin', 'Administrator');
