# Claude uchun loyiha prompti

Quyidagi matnni Claude'ga yuborish uchun tayyorlangan. Claude'ga loyihani ham biriktiring yoki loyiha papkasini ochib, prompt bilan birga fayllarni ko'rishini so'rang.

---

## Nusxalab yuboriladigan prompt

Men React va Vite yordamida yaratilgan **UstozPanel** nomli maktab ustozlari va dars jadvalini boshqarish loyihasi ustida ishlayapman. Iltimos, kodga o'zgartirish kiritishdan avval loyiha tuzilmasi va tegishli fayllarni ko'rib chiq. Quyidagi ma'lumotlar loyihani tushunishga yordam beradi, lekin biror vazifa berilganida haqiqiy kodni ham tekshir.

### Loyiha vazifasi

Bu web ilovada ikki xil rol mavjud:

- **Administrator:** ustozlarni ko'radi va qo'shadi, ustozlarni ro'yxat bilan ommaviy kiritadi, sinflar va dars jadvalini boshqaradi, umumiy ko'rsatkichlar va bugungi darslarni ko'radi.
- **Ustoz:** bugungi darslari va haftalik jadvalini ko'radi.

Autentifikatsiya va asosiy ma'lumotlar Supabase orqali boshqariladi. Interfeys o'zbek tilida, yorug'/qorong'i mavzu va mobil ekranga mos menyu mavjud.

### Texnologiyalar va ishga tushirish

- React 19, JavaScript (JSX), Vite 8 va React Router 7 ishlatiladi.
- Ma'lumotlar va login uchun `@supabase/supabase-js` ishlatiladi.
- `npm run dev` — ishlab chiqish serverini ishga tushiradi.
- `npm run build` — production build yaratadi.
- `npm run lint` — Oxlint tekshiruvini bajaradi.
- `npm run preview` — build natijasini lokal ko'rish uchun serverni ishga tushiradi.
- Supabase ulanishi uchun `.env` faylida `VITE_SUPABASE_URL` va `VITE_SUPABASE_ANON_KEY` bo'lishi kerak. Maxfiy qiymatlarni chatga yoki kodga joylama; mavjud `.env` qiymatlarini ko'rsatma.

### Papkalar va fayllar

```text
kundalik-ustoz/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── BulkTeachers.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── TimetableGrid.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── lib/
│   │   ├── storage.js
│   │   └── supabase.js
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Schedule.jsx
│   │   │   └── Users.jsx
│   │   ├── teacher/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Schedule.jsx
│   │   └── Login.jsx
│   ├── styles/
│   │   └── global.css
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── supabase/
│   └── schema.sql
├── .env                 # lokal sozlamalar; qiymatlarini oshkor qilma
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── vercel.json
└── vite.config.js
```

### Har bir fayl nima qiladi?

#### Loyiha ildizidagi fayllar

- `index.html` — brauzer ochadigan HTML sahifa; React ilovasi ulanadigan `root` elementi va `src/main.jsx` kirish fayli shu yerda.
- `package.json` — loyiha nomi, npm buyruqlari va React, Router, Supabase, Vite kabi bog'liqliklar.
- `package-lock.json` — npm o'rnatadigan paketlarning aniq versiyalarini qayd etadi.
- `vite.config.js` — Vite va React plaginini sozlaydi.
- `vercel.json` — Vercel'da SPA yo'naltirishlarini `index.html` ga qayta yozadi, shunda ichki URL manzillar ishlaydi.
- `.oxlintrc.json` — Oxlint plaginlari va React qoidalarini belgilaydi.
- `.gitignore` — `node_modules`, `dist`, loglar va editorning mahalliy fayllarini Git'dan chetda qoldiradi.
- `.env` — Supabase URL va anon key kabi lokal muhit sozlamalari. Qiymatlarini hech qachon chiqarma yoki commit qilma.
- `README.md` — hozircha Vite/React boshlang'ich shablonidan qolgan yo'riqnoma; ilovaning to'liq tavsifi emas.

#### `public/`

- `public/favicon.svg` — brauzer tabida ko'rinadigan sayt belgisi.
- `public/icons.svg` — bir nechta SVG belgi/symbol ta'riflari joylashgan sprite fayli.

#### `src/` — React ilovasining kodi

- `src/main.jsx` — React ilovasini HTML `root` elementiga ulaydi; `BrowserRouter`, `ThemeProvider`, `AuthProvider` va global CSS-ni ishga tushiradi.
- `src/App.jsx` — URL marshrutlarini, administrator/ustoz sahifalarini, umumiy layoutni va foydalanuvchi roli bo'yicha kirish nazoratini boshqaradi.
- `src/App.css` — hozir bo'sh fayl; faol sahifa stillari `src/styles/global.css` ichida.
- `src/index.css` — hozir bo'sh fayl; `main.jsx` tomonidan import qilinmaydi.

##### `src/components/` — qayta ishlatiladigan interfeys qismlari

- `BulkTeachers.jsx` — ustozlarni bir nechta qatorda kiritadi; qatorlarni tekshiradi, fan nomlarini moslaydi va Supabase'ga saqlaydi.
- `Navbar.jsx` — yuqori navigatsiya paneli; menyu tugmasi, mavzu almashtirish, foydalanuvchi nomi va tizimdan chiqishni ko'rsatadi.
- `Sidebar.jsx` — foydalanuvchi roliga qarab yon menyu havolalarini ko'rsatadi; mobil ko'rinishda ochilib-yopiladi.
- `TimetableGrid.jsx` — dushanbadan shanbagacha va 1–9-darslar bo'yicha jadvalni chizadi; administrator uchun darsni o'chirish tugmasi, ko'rish rejimi va bugungi kunni ajratib ko'rsatish imkoniyati bor.

##### `src/context/` — ilova bo'ylab ishlatiladigan holatlar

- `AuthContext.jsx` — Supabase login/logout, session, foydalanuvchi profilini va rolini yuklash, yuklanish holati va autentifikatsiya xatolarini boshqaradi. `useAuth()` hookini beradi.
- `ThemeContext.jsx` — light/dark mavzuni boshqaradi, tanlovni saqlaydi va birinchi kirishda qurilma mavzusini tekshiradi. `useTheme()` hookini beradi.

##### `src/lib/` — yordamchi modullar

- `storage.js` — `localStorage` qiymatlarini `ustozpanel:` prefiksi bilan xavfsizroq o'qish/yozish/o'chirish va React state bilan bog'lash uchun yordamchilar.
- `supabase.js` — `.env` dagi Vite muhit o'zgaruvchilaridan Supabase client yaratadi; sozlamalar bo'lmasa `supabase` qiymati `null` bo'ladi.

##### `src/pages/` — marshrut sahifalari

- `src/pages/Login.jsx` — email va parol orqali tizimga kirish formasi; muvaffaqiyatli kirganda foydalanuvchini roliga tegishli sahifaga yuboradi.
- `src/pages/admin/Dashboard.jsx` — administrator bosh sahifasi: ustoz/sinf/dars sonlari, sinf jadvali va bugungi darslar.
- `src/pages/admin/Schedule.jsx` — sinf qo'shish, sinfni tanlash, fan/ustoz/xona/vaqt bilan dars qo'shish va jadvaldan dars o'chirish.
- `src/pages/admin/Users.jsx` — ustozlar ro'yxati; ustozni alohida yoki ommaviy qo'shish va o'chirish.
- `src/pages/teacher/Dashboard.jsx` — tizimga kirgan ustozning bugungi darslarini ko'rsatadi.
- `src/pages/teacher/Schedule.jsx` — tizimga kirgan ustozning haftalik jadvalini kunlar bo'yicha ko'rsatadi.

##### `src/styles/`

- `src/styles/global.css` — ilovaning asosiy dizayni: ranglar, light/dark mavzu, layout, formalar, jadvallar, modal oynalar, administrator/ustoz sahifalari va mobil moslashuv.

#### `supabase/`

- `supabase/schema.sql` — Supabase/PostgreSQL bazasi uchun jadvallar, ustunlar, cheklovlar, bog'lanishlar, RLS va ruxsat siyosatlarini tayyorlaydi. Asosiy jadvallar:
  - `profiles` — Supabase Auth foydalanuvchisi bilan bog'langan rol va ism.
  - `teachers` — ustoz ismi, telefoni, fanlari va ixtiyoriy Auth foydalanuvchi bog'lanishi.
  - `classes` — 1–11-sinf va sinf harfi.
  - `lessons` — sinf, ustoz, fan, hafta kuni, dars raqami va xona.
  - Cheklovlar bir sinf yoki ustozga bir vaqtda takroriy dars qo'yilishini oldini oladi. RLS administratorga boshqarish huquqini, autentifikatsiyadan o'tgan ustoz roliga esa o'qish huquqini beradi.

### Ilovaning ishlash tartibi

1. `main.jsx` providerlar va router bilan React ilovasini ishga tushiradi.
2. `App.jsx` URL va foydalanuvchi roliga qarab login, administrator yoki ustoz sahifasini tanlaydi.
3. `AuthContext.jsx` Supabase sessiyasidan foydalanuvchi profilini topadi; ruxsat etilgan rollar `admin` va `teacher`.
4. Sahifalar ma'lumotlarni Supabase jadvallaridan oladi; muvaffaqiyatsizlik holatlari sahifada xabar qilinadi.
5. Mavzu tanlovi brauzer xotirasida saqlanadi; dars/ustoz/sinf ma'lumotlari Supabase'da saqlanadi.

### Kodga o'zgartirish kiritish qoidalari

- Avval vazifaga tegishli fayllarni ochib, mavjud kod uslubini va ma'lumotlar modelini tekshir.
- Keraksiz katta qayta yozish qilma; faqat so'ralgan vazifaga tegishli, kichik va to'liq yechim kirit.
- Yangi sahifa yoki komponent qo'shilsa, marshrut, navigatsiya va mobil ko'rinishga ta'sirini ham tekshir.
- Supabase jadvali, ustuni yoki ruxsatlari o'zgarsa, `supabase/schema.sql` bilan frontend ishlatadigan nomlar mosligini tekshir.
- Xatolarni foydalanuvchidan yashirma; loyiha uslubiga mos xabar ber.
- `.env`, parol, token yoki maxfiy kalitlarni javobda ko'rsatma, kodga qo'shma va commit qilma.
- Ish tugagach, tegishli tekshiruvlarni bajar (`npm run lint`, kerak bo'lsa `npm run build`) va natijani qisqacha ayt.
- Agar talab noaniq bo'lsa yoki muhim xatti-harakat tanlovi kerak bo'lsa, kodni o'zgartirishdan oldin savol ber.

Endi men beradigan vazifani shu loyiha kontekstida bajar. Avval tegishli fayllarni tekshir, so'ng kerakli o'zgarishni kirit va tekshiruv natijasini ayt.

---

## Loyiha ichida mavjud, lekin promptga ko'chirilmagan papkalar

- `node_modules/` — npm o'rnatgan uchinchi tomon paketlari; manba kodi emas.
- `dist/` — `npm run build` yaratadigan deploy/build natijasi; manba fayl emas.

Bu papkalarni Claude'ga alohida yuborish shart emas. Manba fayllar va `package.json` yetarli.
