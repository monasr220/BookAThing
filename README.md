**User:**

https://github.com/monasr220/BookAThing

---

**Assistant:**

This repository is **BookAThing**, a full-stack movie-ticket booking platform.

- **Backend:** Node.js, Express 5, MongoDB/Mongoose
- **Frontend:** React 18, Vite, React Router, Axios
- **Core features:** authentication with OTP/JWT, movies, theaters, screens, showtimes, seat booking, payments, reviews, offers, and theater-owner dashboard.
- **Backend entry point:** `backend/server.js:1`
- **Frontend routes:** `frontend/app/src/App.jsx:16`
- **API base URL:** `http://localhost:5000/api`
- **Health check:** `GET /health`

Run it from the repository root:

```bash
npm install
npm run install:all

cd backend
cp .env.example .env
# Configure MongoDB and JWT settings in .env

npm run migrate:up
npm run seed
cd ..

npm run dev
```

The backend runs on port `5000`; the React frontend runs on port `3000`.

One notable implementation detail: although the README mentions Stripe, the current backend does not import the Stripe SDK. `backend/services/paymentServices.js:8` currently marks payments as completed internally and generates a transaction reference, so payment processing appears to be simulated rather than connected to Stripe.

---

**User:**

MongoDB connection successful.
Fetching movie lists from TMDB...
Seeding failed: Error: TMDB request failed (401): /movie/popular?language=en-US&page=1
    at tmdbFetch (D:\Nasr\Booking\backend\seed\seedMovies.js:34:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async fetchMovieList (D:\Nasr\Booking\backend\seed\seedMovies.js:40:18)
    at async run (D:\Nasr\Booking\backend\seed\seedMovies.js:80:29)
Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 76

---

**Assistant:**

The MongoDB connection is working. The failure is specifically TMDB authentication:

```text
TMDB request failed (401)
```

In `backend/seed/seedMovies.js:31`, the project sends the value as a **TMDB v3 API key**:

```js
const url = `${TMDB_BASE_URL}${path}...&api_key=${TMDB_API_KEY}`;
```

### Fix

1. Go to TMDB API settings:  
   https://www.themoviedb.org/settings/api

2. Copy the **API Key (v3 auth)**, not the **API Read Access Token (v4 auth)**.

3. Put it in `backend/.env`:

```env
TMDB_API_KEY=your_actual_v3_api_key
```

Do not use:

```env
TMDB_API_KEY=your_tmdb_api_key
```

Also avoid accidentally including labels, quotes, or whitespace.

4. Run the seeder from `backend`:

```powershell
cd D:\Nasr\Booking\backend
npm run seed:movies
```

You can verify that the environment variable is loaded without printing the secret:

```powershell
node -e "require('dotenv').config(); console.log(Boolean(process.env.TMDB_API_KEY), process.env.TMDB_API_KEY?.length)"
```

It should print something like:

```text
true 32
```

### If you copied the v4 Read Access Token instead

The code must use a Bearer header instead:

```js
async function tmdbFetch(path) {
    const res = await fetch(`${TMDB_BASE_URL}${path}`, {
        headers: {
            Authorization: `Bearer ${TMDB_API_KEY}`,
            Accept: 'application/json'
        }
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`TMDB request failed (${res.status}): ${path} - ${body}`);
    }

    return res.json();
}
```

The existing query-string implementation expects the v3 key, so using the v3 key is the simplest solution.

The Windows error:

```text
Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)
```

is a secondary Node/libuv shutdown issue after the failed request. Fix the TMDB 401 first. The seeder also uses `process.exit(1)` in its catch block, which can cause abrupt shutdown; replacing it with `process.exitCode = 1` would make cleanup safer.

---

**User:**

check now and make a REAMME.md file that match the project in arabic and make a summary of every routes and its page in frontend

---

**Assistant:**

راجعت المشروع الحالي. لا أستطيع إنشاء الملف مباشرة داخل المستودع من خلال أدوات الاستكشاف المتاحة هنا، لكن هذا محتوى `README.md` جاهز لاستبدال الملف الحالي به. يغطي جميع Routes في الـ Backend وصفحات الـ Frontend الموجودة فعليًا.

```markdown
# 🎬 BookAThing

منصة متكاملة لحجز تذاكر الأفلام وإدارة دور السينما.

المشروع يحتوي على:

- تطبيق Frontend مبني باستخدام React و Vite.
- REST API مبني باستخدام Node.js و Express.
- قاعدة بيانات MongoDB باستخدام Mongoose.
- نظام تسجيل ودخول باستخدام OTP و JWT.
- إدارة الأفلام ودور العرض والشاشات ومواعيد العرض.
- اختيار المقاعد وإنشاء الحجوزات.
- نظام مدفوعات واسترداد.
- التقييمات والعروض الترويجية.
- لوحة تحكم لأصحاب دور السينما والمديرين.

---

## 📁 هيكل المشروع

```text
BookAThing/
├── backend/
│   ├── config/              # إعداد الاتصال بقاعدة البيانات
│   ├── controllers/         # Controllers الخاصة بالـ API
│   ├── exceptions/          # أنواع الأخطاء الخاصة بالمشروع
│   ├── middelware/          # Authentication و Validation و Rate Limiting
│   ├── migrations/          # تغييرات قاعدة البيانات
│   ├── models/              # نماذج MongoDB
│   ├── routes/              # مسارات الـ API
│   ├── seed/                # بيانات تجريبية وبيانات الأفلام
│   ├── services/            # منطق الأعمال
│   ├── utils/               # دوال مساعدة
│   ├── .env.example
│   └── server.js            # نقطة تشغيل الـ Backend
│
├── frontend/
│   └── app/
│       ├── public/
│       └── src/
│           ├── lib/
│           └── pages/
│
├── package.json             # أوامر تشغيل المشروع بالكامل
└── README.md
```

---

## 🛠️ التقنيات المستخدمة

### Backend

- Node.js
- Express 5
- MongoDB
- Mongoose
- JSON Web Token
- bcryptjs
- Nodemailer
- express-validator
- express-rate-limit
- migrate-mongo
- dotenv

### Frontend

- React 18
- Vite
- React Router
- Axios
- Bootstrap
- Font Awesome
- Swiper

---

## ⚙️ المتطلبات

قبل تشغيل المشروع، يجب تثبيت:

- Node.js إصدار 18 أو أحدث
- npm
- MongoDB محليًا أو MongoDB Atlas
- مفتاح TMDB اختياري لتعبئة الأفلام

---

## 🚀 تشغيل المشروع

### 1. تثبيت الحزم

من مجلد المشروع الرئيسي:

```bash
npm install
npm run install:all
```

أو بشكل منفصل:

```bash
cd backend
npm install

cd ../frontend/app
npm install
```

---

### 2. إعداد ملف البيئة

أنشئ الملف التالي:

```bash
cd backend
cp .env.example .env
```

مثال:

```env
MONGO_URI=mongodb://localhost:27017/booking

JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRE=15m

JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=7d

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

NODE_ENV=development
PORT=5000

CLIENT_URLS=http://localhost:3000

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

TMDB_API_KEY=your_tmdb_v3_api_key
```

> يجب استخدام **TMDB API Key (v3)** مع الكود الحالي، وليس TMDB API Read Access Token (v4).

---

### 3. إعداد Frontend

أنشئ ملف البيئة:

```bash
cd frontend/app
cp .env.example .env
```

القيمة الافتراضية:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

### 4. تشغيل Migrations

من مجلد `backend`:

```bash
npm run migrate:up
```

لعرض حالة الـ Migrations:

```bash
npm run migrate:status
```

للتراجع عن آخر Migration:

```bash
npm run migrate:down
```

---

### 5. تعبئة البيانات

تعبئة الأفلام من TMDB:

```bash
npm run seed:movies
```

تعبئة دور السينما والشاشات ومواعيد العرض:

```bash
npm run seed:demo
```

تشغيل الاثنين:

```bash
npm run seed
```

> يحتاج `seed:movies` إلى قيمة صحيحة في `TMDB_API_KEY`.

---

### 6. تشغيل Backend و Frontend

من مجلد المشروع الرئيسي:

```bash
npm run dev
```

أو في نافذتين منفصلتين:

```bash
cd backend
npm run dev
```

```bash
cd frontend/app
npm run dev
```

العناوين الافتراضية:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/health

---

# 🔌 Backend API

Base URL:

```text
http://localhost:5000/api
```

معظم المسارات المحمية تحتاج إلى:

```http
Authorization: Bearer <accessToken>
```

الأدوار المتاحة:

- `user`: مستخدم عادي
- `owner`: صاحب دار سينما
- `admin`: مدير النظام

---

## 1. Authentication

Prefix:

```text
/api/auth
```

| Method | Route | الصلاحية | الوظيفة |
|---|---|---|---|
| POST | `/send-signup-otp` | عامة | إرسال رمز OTP لإنشاء حساب |
| POST | `/complete-signup` | عامة | التحقق من OTP وإنشاء الحساب |
| POST | `/login` | عامة | تسجيل الدخول |
| POST | `/refresh-token` | عامة | إنشاء Access Token جديد باستخدام Refresh Token |
| POST | `/logout` | مستخدم مسجل | تسجيل الخروج وإبطال Refresh Tokens |
| POST | `/forgot-password` | عامة | إرسال OTP لإعادة تعيين كلمة المرور |
| POST | `/reset-password` | عامة | إعادة تعيين كلمة المرور |

---

## 2. Movies

Prefix:

```text
/api/movies
```

| Method | Route | الصلاحية | الوظيفة |
|---|---|---|---|
| GET | `/` | عامة | جلب جميع الأفلام |
| GET | `/search` | عامة | البحث عن الأفلام |
| GET | `/now-in-cinemas` | عامة | جلب الأفلام الموجودة حاليًا في دور السينما |
| GET | `/coming-soon` | عامة | جلب الأفلام القادمة |
| GET | `/popular` | عامة | جلب الأفلام الأكثر شعبية |
| GET | `/upcoming` | عامة | جلب الأفلام القادمة |
| GET | `/:id` | عامة | جلب تفاصيل فيلم محدد |
| GET | `/:id/booking-stats` | Admin / Owner | جلب إحصائيات حجوزات الفيلم |
| POST | `/` | Admin | إنشاء فيلم |
| PUT | `/:id` | Admin | تعديل فيلم |
| DELETE | `/:id` | Admin | حذف فيلم |

---

## 3. Theaters and Screens

Prefix:

```text
/api/theaters
```

### دور السينما

| Method | Route | الصلاحية | الوظيفة |
|---|---|---|---|
| POST | `/` | Owner / Admin | إنشاء دار سينما |
| GET | `/` | عامة | جلب جميع دور السينما |
| GET | `/mine` | Owner | جلب دور السينما الخاصة بالمالك |
| GET | `/:theaterId` | عامة | جلب تفاصيل دار سينما |
| PUT | `/:theaterId` | مالك الدار / Admin | تعديل دار سينما |
| DELETE | `/:theaterId` | مالك الدار / Admin | حذف دار سينما |

### الشاشات

| Method | Route | الصلاحية | الوظيفة |
|---|---|---|---|
| POST | `/:theaterId/screens` | مالك الدار / Admin | إنشاء شاشة |
| GET | `/:theaterId/screens` | عامة | جلب شاشات دار السينما |
| GET | `/:theaterId/screens/:screenId` | عامة | جلب تفاصيل شاشة |
| PUT | `/:theaterId/screens/:screenId` | مالك الدار / Admin | تعديل شاشة |
| DELETE | `/:theaterId/screens/:screenId` | مالك الدار / Admin | حذف شاشة |

---

## 4. Showtimes

Prefix:

```text
/api/showtimes
```

| Method | Route | الصلاحية | الوظيفة |
|---|---|---|---|
| POST | `/` | Owner / Admin | إنشاء موعد عرض |
| GET | `/movie/:movieId` | عامة | جلب مواعيد عرض فيلم |
| GET | `/theater/:theaterId` | عامة | جلب مواعيد عرض دار سينما |
| GET | `/:id` | عامة | جلب موعد عرض محدد |
| PUT | `/:id` | Owner / Admin | تعديل موعد عرض |
| DELETE | `/:id` | Admin | حذف موعد عرض |
| PATCH | `/:id/cancel` | Owner / Admin | إلغاء موعد عرض |

---

## 5. Seats

Prefix:

```text
/api/seats
```

| Method | Route | الصلاحية | الوظيفة |
|---|---|---|---|
| GET | `/screen/:screenId/layout/:showtimeId` | عامة | جلب مخطط المقاعد مع حالة الحجز |
| GET | `/screen/:screenId` | عامة | جلب مقاعد الشاشة |
| PUT | `/screen/:screenId` | Owner / Admin | تعديل إعدادات المقاعد |

---

## 6. Bookings

Prefix:

```text
/api/bookings
```

| Method | Route | الصلاحية | الوظيفة |
|---|---|---|---|
| POST | `/` | مستخدم مسجل | إنشاء حجز |
| GET | `/my-bookings` | مستخدم مسجل | جلب حجوزات المستخدم |
| DELETE | `/:bookingId` | مستخدم مسجل | إلغاء حجز |

عملية الحجز في الـ Frontend تشمل:

1. اختيار دار السينما.
2. اختيار موعد العرض.
3. اختيار المقاعد.
4. إدخال كود الخصم اختياريًا.
5. مراجعة تفاصيل الحجز.
6. تنفيذ الدفع.
7. عرض تأكيد الحجز والإيصال.

---

## 7. Payments

Prefix:

```text
/api/payments
```

| Method | Route | الصلاحية | الوظيفة |
|---|---|---|---|
| POST | `/` | مستخدم مسجل | تنفيذ الدفع لحجز |
| GET | `/booking/:bookingId` | مستخدم مسجل | جلب دفعة مرتبطة بحجز |
| POST | `/:id/refund` | Owner / Admin | استرداد قيمة الدفع |

> حاليًا يتم تسجيل الدفع داخليًا وتغيير حالة الحجز إلى `confirmed`. لا يوجد استدعاء فعلي إلى Stripe داخل `paymentServices.js` رغم وجود متغيرات Stripe في ملف البيئة.

---

## 8. Reviews

Prefix:

```text
/api/reviews
```

| Method | Route | الصلاحية | الوظيفة |
|---|---|---|---|
| GET | `/movie/:movieId` | عامة | جلب تقييمات فيلم |
| POST | `/` | مستخدم مسجل | إضافة تقييم |
| PUT | `/:id` | مستخدم مسجل | تعديل تقييم |
| DELETE | `/:id` | مستخدم مسجل | حذف تقييم |

---

## 9. Offers

Prefix:

```text
/api/offers
```

| Method | Route | الصلاحية | الوظيفة |
|---|---|---|---|
| GET | `/active` | عامة | جلب العروض الفعالة |
| POST | `/` | Admin | إنشاء عرض |
| GET | `/` | Admin | جلب جميع العروض |
| GET | `/:id` | Admin | جلب عرض محدد |
| PUT | `/:id` | Admin | تعديل عرض |
| DELETE | `/:id` | Admin | حذف عرض |
| PATCH | `/:id/deactivate` | Admin | تعطيل عرض |

أنواع العروض الموجودة:

- Promo Code
- Conditional Offer
- خصم بنسبة مئوية
- خصم بقيمة ثابتة
- عرض على جميع الأفلام
- عرض على فيلم محدد
- عرض لأول حجز

---

## 10. Theater Dashboard

Prefix:

```text
/api/theaters/:theaterId/dashboard
```

| Method | Route | الصلاحية | الوظيفة |
|---|---|---|---|
| GET | `/overview` | مالك الدار / Admin | إحصائيات عامة |
| GET | `/revenue-by-movie` | مالك الدار / Admin | الإيرادات حسب الفيلم |
| GET | `/upcoming-showtimes` | مالك الدار / Admin | مواعيد العرض القادمة |

---

# 🖥️ Frontend Routes

يتم تعريف المسارات الرئيسية في:

```text
frontend/app/src/App.jsx
```

## صفحات المستخدم

| Route | الصفحة | الوظيفة |
|---|---|---|
| `/` | Home | الصفحة الرئيسية، الأفلام الحالية والقادمة والأفلام الشائعة |
| `/auth` | AuthForm | تسجيل الدخول وإنشاء حساب واستعادة كلمة المرور |
| `/offers` | ActiveOffers | عرض العروض والخصومات الفعالة |
| `/search` | SearchResults | عرض نتائج البحث عن الأفلام |
| `/theaters` | TheatersBrowse | تصفح دور السينما |
| `/theaters/:theaterId` | TheaterDetail | تفاصيل دار سينما محددة |
| `/movie/:id` | MovieBooking | تفاصيل الفيلم وتنفيذ عملية الحجز |
| `/receipt/:bookingId` | Receipt | عرض إيصال الحجز |
| `/my-bookings` | MyBookings | عرض حجوزات المستخدم وإلغاء الحجز |

---

## تفاصيل صفحات المستخدم

### `/`

صفحة Home وتحتوي على:

- Hero Section
- الأفلام المعروضة حاليًا
- الأفلام القادمة
- الأفلام الشائعة
- البحث
- روابط دور السينما والعروض

الملفات الرئيسية:

```text
frontend/app/src/pages/home/Home.jsx
frontend/app/src/pages/home/HeroSection.jsx
frontend/app/src/pages/home/NowShowing.jsx
frontend/app/src/pages/home/ComingSoon.jsx
frontend/app/src/pages/home/PopularMovies.jsx
```

---

### `/auth`

صفحة المصادقة وتدعم:

- تسجيل الدخول.
- إنشاء حساب جديد.
- التحقق من OTP.
- إعادة إرسال OTP.
- إعادة تعيين كلمة المرور.

الملفات:

```text
frontend/app/src/pages/auth/AuthForm.jsx
frontend/app/src/pages/auth/authService.js
frontend/app/src/pages/auth/components/OtpModal.jsx
frontend/app/src/pages/auth/components/ResetPasswordModal.jsx
```

---

### `/offers`

تعرض العروض المتاحة للعامة، وتسمح للمستخدم بـ:

- مشاهدة الخصم.
- معرفة نطاق العرض.
- نسخ كود الخصم.
- معرفة تاريخ بداية ونهاية العرض.

الملف:

```text
frontend/app/src/pages/offers/ActiveOffers.jsx
```

---

### `/search`

تعرض نتائج البحث القادمة من:

```text
GET /api/movies/search
```

الملف:

```text
frontend/app/src/pages/home/SearchResults.jsx
```

---

### `/theaters`

تعرض قائمة دور السينما المتاحة، مع إمكانية فتح تفاصيل كل دار سينما.

الملف:

```text
frontend/app/src/pages/home/TheatersBrowse.jsx
```

---

### `/theaters/:theaterId`

تعرض:

- اسم دار السينما.
- العنوان والمدينة.
- معلومات التواصل.
- الشاشات أو مواعيد العرض المرتبطة بها.

الملف:

```text
frontend/app/src/pages/home/TheaterDetail.jsx
```

---

### `/movie/:id`

صفحة تنفيذ الحجز، وتتكون من الخطوات التالية:

1. اختيار دار السينما.
2. اختيار موعد العرض.
3. عرض المقاعد المتاحة.
4. اختيار المقاعد.
5. مراجعة الحجز.
6. إدخال كود الخصم.
7. اختيار وسيلة الدفع.
8. تأكيد الحجز.

الملفات:

```text
frontend/app/src/pages/booking/MovieBooking.jsx
frontend/app/src/pages/booking/MovieReviews.jsx
frontend/app/src/pages/booking/bookingApi.js
frontend/app/src/pages/booking/reviewsApi.js
```

---

### `/receipt/:bookingId`

تعرض بيانات الحجز بعد إتمام العملية، مثل:

- الفيلم.
- دار السينما.
- الشاشة.
- موعد العرض.
- المقاعد.
- السعر.
- رقم الحجز.
- حالة الدفع.

الملف:

```text
frontend/app/src/pages/booking/Receipt.jsx
```

---

### `/my-bookings`

تعرض حجوزات المستخدم الحالية والسابقة، وتسمح بإلغاء الحجز حسب حالته.

الملف:

```text
frontend/app/src/pages/booking/MyBookings.jsx
```

---

# 🏢 Theater Dashboard

المسار الرئيسي:

```text
/theater
```

يتم تشغيل لوحة التحكم داخل:

```text
frontend/app/src/pages/theater/TheaterApp.jsx
```

يجب أن يكون المستخدم مسجلًا بدور:

- `owner`
- `admin`

إذا لم يكن المستخدم مسجلًا، تظهر صفحة تسجيل الدخول الخاصة باللوحة.

---

## صفحات المالك

| الصفحة الداخلية | Component | الوظيفة |
|---|---|---|
| Dashboard | `Dashboard.jsx` | الإحصائيات والإيرادات ومواعيد العرض القادمة |
| Theaters | `Theaters.jsx` | إنشاء وتعديل وحذف دور السينما |
| Screens | `Screens.jsx` | إنشاء وتعديل وحذف الشاشات وإعداد المقاعد |
| Showtimes | `Showtimes.jsx` | إدارة مواعيد العرض |
| Bookings | `Bookings.jsx` | عرض إحصائيات الحجوزات والإيرادات |
| Refunds | `Refunds.jsx` | البحث عن دفعة باستخدام Booking ID وتنفيذ الاسترداد |

هذه الصفحات لا تستخدم Routes منفصلة داخل React Router، بل يتم التنقل بينها باستخدام Sidebar داخل `TheaterApp.jsx`.

---

## صفحات المدير Admin

| الصفحة الداخلية | Component | الوظيفة |
|---|---|---|
| Movies | `AdminMovies.jsx` | إنشاء وتعديل وحذف الأفلام وعرض إحصائيات الحجز |
| Offers | `AdminOffers.jsx` | إنشاء وتعديل وتعطيل وحذف العروض |
| Refunds | `Refunds.jsx` | البحث عن المدفوعات وتنفيذ الاسترداد |

المدير يبدأ افتراضيًا من صفحة الأفلام، بينما صاحب السينما يبدأ من لوحة المعلومات.

---

# 🔐 إدارة جلسة المستخدم

يستخدم Frontend:

```text
localStorage
```

لحفظ:

- `accessToken`
- `refreshToken`
- بيانات المستخدم

ويقوم Axios تلقائيًا بإرسال Access Token:

```http
Authorization: Bearer <accessToken>
```

عند انتهاء Access Token:

1. يتم إرسال Refresh Token إلى `/api/auth/refresh-token`.
2. يتم حفظ Access Token الجديد.
3. يعاد تنفيذ الطلب الأصلي.
4. إذا فشل Refresh Token يتم حذف الجلسة وإعادة المستخدم إلى `/auth`.

الملف المسؤول:

```text
frontend/app/src/lib/api.js
```

---

# 🧪 فحص تشغيل الـ Backend

بعد تشغيل السيرفر:

```bash
curl http://localhost:5000/health
```

الاستجابة المتوقعة:

```json
{
  "status": "ok"
}
```

---

# ⚠️ ملاحظات مهمة

1. يجب تشغيل MongoDB قبل تشغيل الـ Backend.
2. يجب استخدام TMDB v3 API Key مع Seeder الأفلام.
3. لا ترفع ملف `.env` إلى GitHub.
4. الدفع الحالي يتم تسجيله داخل قاعدة البيانات ولا يستخدم Stripe فعليًا.
5. صفحة Refunds تحتاج إدخال `bookingId` يدويًا لأن الـ Backend لا يوفر حاليًا Endpoint لجلب جميع حجوزات دار سينما.
6. عمليات الحجز والمدفوعات تستخدم MongoDB Transactions، ولذلك قد تحتاج MongoDB إلى Replica Set عند التشغيل في بعض البيئات.
7. يوجد Middleware للتحقق من الصلاحيات والأدوار قبل تنفيذ المسارات المحمية.
8. يوجد Rate Limiting لمسارات OTP وتسجيل الدخول.

---

# 📚 التوثيق الإضافي

التوثيق التفصيلي للـ API موجود في:

```text
backend/API_DOCUMENTATION.md
```

ملفات Postman موجودة في:

```text
backend/postman/
```

---

# 📄 الترخيص

المشروع مخصص للأغراض التعليمية ومشروع تخرج.
```

ملاحظتان مهمتان أثناء تحديث الملف:

- اسم الملف يجب أن يكون `README.md` وليس `REAMME.md`.
- الوصف أعلاه يعكس الكود الحالي، بما في ذلك أن الدفع الحالي محلي/محاكى وليس تكامل Stripe فعليًا، وأن صفحات لوحة التحكم الداخلية لا تملك URLs مستقلة بل يتم تبديلها داخل `/theater`.
