# 🎬 BookAThing — Movie Booking API

نظام حجز تذاكر أفلام (Booking System) مبني بـ **Node.js / Express / MongoDB**، يوفر Backend كامل لإدارة الأفلام، دور العرض، الحجوزات، المدفوعات، التقييمات، والعروض الترويجية — تم تطويره كمشروع تخرج (Final Project).

---

## 📋 المحتويات

- [نظرة عامة](#-نظرة-عامة)
- [الميزات](#-الميزات)
- [التقنيات المستخدمة](#️-التقنيات-المستخدمة)
- [هيكل المشروع](#-هيكل-المشروع)
- [المتطلبات الأساسية](#-المتطلبات-الأساسية)
- [خطوات التشغيل](#-خطوات-التشغيل)
- [متغيرات البيئة (.env)](#-متغيرات-البيئة-env)
- [أوامر npm المتاحة](#-أوامر-npm-المتاحة)
- [اختبار الـ API](#-اختبار-الـ-api)
- [توثيق الـ API](#-توثيق-الـ-api)

---

## 📖 نظرة عامة

الـ Backend موجود بالكامل داخل مجلد `backend/`، وهو الجزء الذي سيتم تشغيله. يوفر REST API متكامل لتطبيق حجز تذاكر سينما (مشابه لـ TMDB/Movieverse)، بما يشمل: المصادقة عبر OTP و JWT، إدارة الأفلام والعروض، حجز المقاعد، الدفع (Stripe)، التقييمات، العروض والخصومات، ولوحة تحكم لأصحاب دور العرض.

## ✨ الميزات

- 🔐 **مصادقة كاملة**: تسجيل عبر OTP بالبريد الإلكتروني، تسجيل دخول، JWT Access/Refresh Tokens مع تدوير تلقائي.
- 🎥 **إدارة الأفلام**: جلب بيانات حقيقية من TMDB عند الـ seeding.
- 🏢 **دور العرض والشاشات**: إدارة Theaters و Screens و Showtimes.
- 💺 **حجز المقاعد**: منطق حجز مقاعد لحظي يمنع التعارض.
- 💳 **المدفوعات**: تكامل مع Stripe.
- ⭐ **التقييمات والمراجعات** للأفلام.
- 🏷️ **العروض والخصومات** (Offers).
- 📊 **لوحة تحكم** خاصة بأصحاب دور العرض (Theater Dashboard).
- 🛡️ **حماية إضافية**: Rate Limiting، Input Validation، معالجة أخطاء مركزية.

## 🛠️ التقنيات المستخدمة

| التقنية | الاستخدام |
|---|---|
| Node.js + Express 5 | السيرفر و الـ REST API |
| MongoDB + Mongoose | قاعدة البيانات |
| migrate-mongo | إدارة الـ Migrations |
| JWT (jsonwebtoken) | المصادقة |
| bcryptjs | تشفير كلمات المرور |
| express-validator / validator | التحقق من المدخلات |
| express-rate-limit | تحديد معدل الطلبات |
| Nodemailer | إرسال بريد الـ OTP |
| Stripe | معالجة الدفع |
| dotenv | إدارة متغيرات البيئة |

## 📂 هيكل المشروع

```
BookAThing/
├── API_DOCUMENTATION.md          # توثيق تفصيلي لكل الـ Endpoints
├── MovieBookingAPI.postman_collection.json
├── test-api.sh                   # اختبار كامل للـ API عبر curl
└── backend/                      # ← مجلد المشروع الفعلي (هنا شغل الأوامر)
    ├── config/                   # الاتصال بقاعدة البيانات
    ├── controllers/               # منطق التحكم بكل Resource
    ├── models/                    # موديلات Mongoose
    ├── routes/                    # مسارات الـ API
    ├── services/                  # منطق الأعمال (Business Logic)
    ├── middelware/                 # Auth, Validation, Rate Limiting
    ├── migrations/                 # Migrations لقاعدة البيانات
    ├── seed/                       # سكربتات تعبئة بيانات تجريبية
    ├── .env.example                # نموذج متغيرات البيئة
    ├── setup.sh                    # سكربت إعداد تلقائي بخطوة واحدة
    └── server.js                   # نقطة تشغيل السيرفر
```

## ✅ المتطلبات الأساسية

قبل البدء تأكد من توفر:

- **Node.js** (يفضل الإصدار 18 أو أحدث) و **npm**
  ```bash
  node -v
  npm -v
  ```
- **MongoDB** يعمل محليًا أو حساب [MongoDB Atlas](https://www.mongodb.com/atlas/database)
- (اختياري) مفتاح **TMDB API** مجاني لتعبئة بيانات أفلام حقيقية: https://www.themoviedb.org/settings/api
- (اختياري) مفاتيح **Stripe** لتجربة الدفع
- (اختياري) بيانات حساب Gmail (App Password) لإرسال رسائل الـ OTP فعليًا

## 🚀 خطوات التشغيل

### 1. استنساخ المشروع

```bash
git clone https://github.com/monasr220/BookAThing.git
cd BookAThing/backend
```

> ⚠️ ملاحظة: كل الأوامر التالية تُنفَّذ من داخل مجلد `backend`، فهو المشروع الفعلي (وليس مجلد الجذر).

### 2. تثبيت الحزم (Dependencies)

```bash
npm install
```

### 3. إعداد متغيرات البيئة

انسخ ملف القالب وعدّل القيم:

```bash
cp .env.example .env
```

ثم افتح `.env` واملأ القيم الحقيقية الخاصة بك (راجع [جدول المتغيرات](#-متغيرات-البيئة-env) بالأسفل).

### 4. تشغيل قاعدة البيانات

تأكد أن MongoDB يعمل، وأن `MONGO_URI` في `.env` يشير إليها بشكل صحيح.

### 5. تطبيق الـ Migrations

```bash
npm run migrate:up
```

### 6. تعبئة بيانات تجريبية (Seeding) — اختياري لكن مُوصى به

```bash
npm run seed:movies   # يجلب أفلام حقيقية من TMDB (يتطلب TMDB_API_KEY)
npm run seed:demo     # يضيف دور عرض وشاشات وعروض تجريبية

# أو الاثنين معًا:
npm run seed
```

### 7. تشغيل السيرفر

للتطوير (مع إعادة تشغيل تلقائي عند أي تعديل):
```bash
npm run dev
```

للإنتاج:
```bash
npm start
```

بشكل افتراضي، السيرفر يعمل على: `http://localhost:5000`

للتأكد أن كل شيء يعمل:
```bash
curl http://localhost:5000/health
```

### 🧰 الإعداد التلقائي بخطوة واحدة (بديل للخطوات 2 و 5 و 6)

بعد إعداد ملف `.env`، يمكنك استخدام سكربت جاهز ينفذ التثبيت + الـ Migrations + الـ Seeding دفعة واحدة:

```bash
bash setup.sh
```

## 🔑 متغيرات البيئة (.env)

| المتغير | الوصف |
|---|---|
| `JWT_ACCESS_SECRET` | مفتاح سري لتوقيع Access Token |
| `JWT_ACCESS_EXPIRE` | مدة صلاحية Access Token (مثال: `15m`) |
| `JWT_REFRESH_SECRET` | مفتاح سري لتوقيع Refresh Token |
| `JWT_REFRESH_EXPIRE` | مدة صلاحية Refresh Token (مثال: `7d`) |
| `MONGO_URI` | رابط الاتصال بقاعدة بيانات MongoDB |
| `EMAIL_SERVICE` | مزود البريد (مثال: `gmail`) |
| `EMAIL_USER` | البريد الإلكتروني المستخدم لإرسال OTP |
| `EMAIL_PASS` | App Password الخاص بالبريد |
| `NODE_ENV` | `development` أو `production` |
| `PORT` | منفذ تشغيل السيرفر (افتراضي `5000`) |
| `CLINET_URL` | رابط الفرونت إند (للسماح بـ CORS) |
| `RATE_LIMIT_WINDOW_MS` | نافذة تحديد معدل الطلبات بالمللي ثانية |
| `RATE_LIMIT_MAX` | أقصى عدد طلبات مسموح بها في التطوير |
| `JWT_SECRET_KEY` | مفتاح JWT إضافي مستخدم في بعض الأجزاء |
| `STRIPE_SECRET_KEY` | مفتاح Stripe السري |
| `STRIPE_PUBLIC_KEY` | مفتاح Stripe العام |
| `STRIPE_WEBHOOK_SECRET` | سر الـ Webhook الخاص بـ Stripe |
| `TMDB_API_KEY` | مفتاح TMDB لجلب بيانات الأفلام (مجاني) |

> 🔒 لا ترفع ملف `.env` الحقيقي إلى GitHub أبدًا — هو مُستثنى بالفعل داخل `.gitignore`.

## 📜 أوامر npm المتاحة

| الأمر | الوصف |
|---|---|
| `npm start` | تشغيل السيرفر (وضع الإنتاج) |
| `npm run dev` | تشغيل السيرفر مع Nodemon (إعادة تشغيل تلقائي) |
| `npm run seed:movies` | تعبئة الأفلام من TMDB |
| `npm run seed:demo` | تعبئة بيانات دور عرض/شاشات/عروض تجريبية |
| `npm run seed` | تنفيذ الأمرين السابقين معًا |
| `npm run migrate:up` | تطبيق الـ Migrations |
| `npm run migrate:down` | التراجع عن آخر Migration |
| `npm run migrate:status` | عرض حالة الـ Migrations |
| `npm run migrate:create` | إنشاء Migration جديد |

## 🧪 اختبار الـ API

بعد تشغيل السيرفر، يوجد سكربت جاهز يختبر تدفق العمل الكامل (تسجيل → دخول → حجز... إلخ) باستخدام `curl` فقط، بدون الحاجة لـ Postman:

```bash
# من جذر المشروع (وليس من داخل backend)
bash test-api.sh
```

كما يتوفر ملف Postman Collection جاهز للاستيراد مباشرة:
- `MovieBookingAPI.postman_collection.json` (في الجذر)
- `backend/postman/MovieBookingAPI.postman_collection.json`

## 📘 توثيق الـ API

للاطلاع على كل الـ Endpoints بالتفصيل (الطلبات، الاستجابات، الأدوار، وحدود الطلبات)، راجع ملف:

➡️ [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)

يشمل التوثيق أقسام: Auth، Movies، Theaters & Screens، Showtimes، Seats، Bookings، Payments، Reviews، Offers، وTheater Dashboard.

---

<div align="center">

صُنع كمشروع تخرج 🎓

</div>
