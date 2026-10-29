# UstozPanel

UstozPanel — maktabdagi sinflar, o‘qituvchilar va haftalik dars jadvalini boshqarish uchun veb-ilova. Interfeys o‘zbek (lotin), o‘zbek (kirill) va rus tillarini qo‘llaydi.

## Texnologiyalar

- React 19 va Vite 8
- JavaScript (ES modules), React Router 7
- Supabase Auth, Postgres va Row Level Security (RLS)
- Vercel hosting

## Ishga tushirish

1. Node.js LTS va npm o‘rnating.
2. `npm ci` buyrug‘i bilan paketlarni o‘rnating.
3. `.env.example` faylidan `.env` nusxa oling va `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` qiymatlarini kiriting. Brauzerga faqat publishable/anon kalit beriladi. `service_role` kalitini frontend, `.env` yoki Git repository’ga hech qachon joylamang.
4. Ma’lumotlar bazasini zaxiralang, so‘ng `supabase/migrations/0001_baseline.sql`, `0002_subject_codes.sql` va `0003_shared_rooms.sql` fayllarini shu tartibda bajaring.
5. `npm run dev` bilan mahalliy serverni ishga tushiring.

`.env` mahalliy fayl bo‘lib, Git tomonidan kuzatilmaydi. Production uchun Vercel loyihasidagi **Settings → Environment Variables** bo‘limida ikkita `VITE_` qiymatni kiriting va deployment’ni qayta ishga tushiring.

## Ma’lumotlar bazasi migratsiyalari

Migratsiyalar `supabase/migrations/` ichida raqam tartibida saqlanadi va mavjud ma’lumotlarni hisobga olgan holda bajariladi.

**Supabase SQL Editor:** avval database backup oling, so‘ng migration fayllarini `0001_baseline.sql` dan boshlab to‘liq va tartib bilan bajaring. Keyingisiga faqat oldingisi muvaffaqiyatli tugagach o‘ting. `0003_shared_rooms.sql` avvalgi jadvalda bir vaqtda band qilingan xonalar topsa, dublikatlarni ko‘rsatib to‘xtaydi; ma’lumotlarni tekshirib, so‘ng migratsiyani qayta bajaring.

RLS tekshiruvi (natija bo‘sh bo‘lishi kerak):

```sql
select relname from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
```

RLS siyosatlarini sinov foydalanuvchilari bilan tekshiring: administrator ma’lumotlarni boshqaradi, o‘qituvchi esa sinflar va darslarni ko‘rishi mumkin, ammo ularni boshqara olmaydi.

## Birinchi administrator

Avval Supabase Dashboard → Authentication → Users orqali admin foydalanuvchi yarating (yoki foydalanuvchining UUID’sini oling), so‘ng SQL Editor’da:

```sql
insert into public.profiles (id, role, full_name)
values ('AUTH_USER_UUID', 'admin', 'Maktab administratori')
on conflict (id) do update
set role = excluded.role, full_name = excluded.full_name;
```

`AUTH_USER_UUID` o‘rniga Auth’dagi haqiqiy UUID’ni yozing. O‘qituvchi hisobida ham Supabase Auth foydalanuvchisi va `role = 'teacher'` profili bo‘lishi kerak.

## Rollar

- `admin`: maktab ma’lumotlari va foydalanuvchilarni boshqaradi.
- `teacher`: ustozlar ro‘yxati, sinflar va darslarni ko‘radi, lekin ularni boshqara olmaydi.

## Papkalar

- `src/components/`: umumiy React komponentlari va interfeys elementlari.
- `src/context/`: autentifikatsiya va ko‘rinish holati.
- `src/hooks/`: qayta ishlatiladigan React hook’lari.
- `src/i18n/`: o‘zbek lotin, o‘zbek kirill va ruscha tarjimalar.
- `src/lib/`: Supabase, API, sana va validatsiya yordamchilari.
- `src/pages/`: administrator va o‘qituvchi sahifalari.
- `supabase/migrations/`: tartib raqamli SQL migratsiyalari.

## Buyruqlar

- `npm run dev` — mahalliy ishlab chiqish serveri.
- `npm run lint` — Oxlint tekshiruvi.
- `npm test` — Vitest testlari.
- `npm run build` — production build.
- `npm run preview` — build natijasini mahalliy ko‘rish.

GitHub Actions CI `npm ci`, lint, test va build bosqichlarini bajaradi. Build Supabase muhit o‘zgaruvchilarisiz ham muvaffaqiyatli yakunlanishi kerak.
