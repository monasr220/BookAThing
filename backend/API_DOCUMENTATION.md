# Movie Booking API — Documentation

Base URL (local): `http://localhost:5000/api`

## Contents
- [Authentication](#authentication)
- [Response format](#response-format)
- [Error format](#error-format)
- [Rate limiting](#rate-limiting)
- [Roles](#roles)
- [Auth](#1-auth)
- [Movies](#2-movies)
- [Theaters & Screens](#3-theaters--screens)
- [Showtimes](#4-showtimes)
- [Seats](#5-seats)
- [Bookings](#6-bookings)
- [Payments](#7-payments)
- [Reviews](#8-reviews)
- [Offers](#9-offers)
- [Theater Dashboard](#10-theater-dashboard)

---

## Authentication

Most endpoints require a JWT access token, obtained from `/auth/login` or `/auth/complete-signup`.

Send it as a header on every protected request:

```
Authorization: Bearer <accessToken>
```

Access tokens expire quickly (`JWT_ACCESS_EXPIRE`, default 15m). When one expires, call `POST /auth/refresh-token` with your `refreshToken` to get a new pair — refresh tokens are rotated on every use.

## Response format

Most endpoints (auth, theaters, showtimes, offers, seats, dashboard) respond with:

```json
{
  "statusCode": 200,
  "message": "Human-readable message",
  "success": true,
  "data": { }
}
```

A few older endpoints (movies, bookings, payments, reviews) respond with the resource directly instead of a `data` wrapper — see each section below for the exact shape.

## Error format

All errors go through a single handler and look like:

```json
{
  "success": false,
  "message": "What went wrong",
  "errorCode": null,
  "details": null
}
```

Common status codes: `400` validation error, `401` not authenticated / invalid credentials, `403` not authorized for this action, `404` not found, `429` too many requests.

## Rate limiting

- OTP-sending endpoints (`/auth/send-signup-otp`, `/auth/forgot-password`) share one limiter: **3 requests / 15 min per IP** in production.
- Login/reset endpoints (`/auth/login`, `/auth/reset-password`) share another: **5 attempts / 15 min per IP** in production.
- In development (`NODE_ENV` ≠ `production`), both limits are relaxed to `RATE_LIMIT_MAX` (default 100) so local testing isn't blocked.

## Roles

Users have one role: `user` (default), `admin`, or `owner`.
- `owner` — can manage theaters/screens/showtimes they own.
- `admin` — full access to movies, offers, and any theater.
- Ownership of a specific theater is checked via the `:theaterId` route param — the authenticated `owner` must be that theater's `ownerId`.

---

## 1. Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/send-signup-otp` | Public | Send a 4-digit signup OTP to an email |
| POST | `/auth/complete-signup` | Public | Verify OTP and create the account |
| POST | `/auth/login` | Public | Log in with email/password |
| POST | `/auth/refresh-token` | Public | Exchange a refresh token for a new pair |
| POST | `/auth/logout` | Bearer | Invalidate all of the user's refresh tokens |
| POST | `/auth/forgot-password` | Public | Send a password-reset OTP |
| POST | `/auth/reset-password` | Public | Verify OTP and set a new password |

**POST /auth/send-signup-otp**
```json
{ "email": "test@example.com" }
```
> In development, the OTP is also printed to the server console (`[DEV ONLY] OTP for ...`), since email credentials often aren't configured yet locally.

**POST /auth/complete-signup**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "phone": "01000000000",
  "otp": "1234"
}
```
Response `201`:
```json
{
  "statusCode": 201,
  "message": "Account created successfully.",
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "role": "user", "...": "..." },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**POST /auth/login**
```json
{ "email": "test@example.com", "password": "password123" }
```
Returns the same `{ user, accessToken, refreshToken }` shape as signup.

**POST /auth/refresh-token**
```json
{ "refreshToken": "..." }
```
Returns a new `{ accessToken, refreshToken }` pair.

**POST /auth/logout** — no body; requires `Authorization` header.

**POST /auth/forgot-password**
```json
{ "email": "test@example.com" }
```
Always responds `200` regardless of whether the email is registered (avoids leaking account existence).

**POST /auth/reset-password**
```json
{ "email": "test@example.com", "otp": "1234", "newPassword": "newPassword123" }
```

---

## 2. Movies

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/movies` | Public | List all movies |
| GET | `/movies/search?query=` | Public | Search movies by title |
| GET | `/movies/now-in-cinemas` | Public | Movies currently showing |
| GET | `/movies/coming-soon` | Public | Movies not yet released |
| GET | `/movies/popular` | Public | Most-booked movies |
| GET | `/movies/upcoming` | Public | Movies with upcoming showtimes |
| GET | `/movies/:id` | Public | Movie details + its showtimes |
| GET | `/movies/:id/booking-stats` | Bearer, admin/owner | Booking stats for a movie |
| POST | `/movies` | Bearer, admin | Create a movie |
| PUT | `/movies/:id` | Bearer, admin | Update a movie |
| DELETE | `/movies/:id` | Bearer, admin | Delete a movie (cascades its showtimes/bookings) |

**POST /movies / PUT /movies/:id** body:
```json
{
  "title": "Sample Movie",
  "StreamingType": "theater",
  "genre": "Action",
  "duration": "120",
  "releaseDate": "2026-01-01",
  "language": "English",
  "description": "A sample movie.",
  "director": "Jane Doe",
  "production": "Sample Studios",
  "cast": "Actor One, Actor Two",
  "poster_url": "https://example.com/poster.jpg",
  "trailer_url": "https://example.com/trailer.mp4"
}
```
All fields above are required by the schema. Responses are the movie document directly (no `data` wrapper), e.g. `{ "message": "Movie created successfully", "movie": { ... } }`.

---

## 3. Theaters & Screens

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/theaters` | Bearer, owner/admin | Create a theater |
| GET | `/theaters?city=` | Public | List theaters, optionally by city |
| GET | `/theaters/mine` | Bearer, owner | Theaters owned by the current user |
| GET | `/theaters/:theaterId` | Public | Theater details |
| PUT | `/theaters/:theaterId` | Bearer, owner of that theater | Update a theater |
| DELETE | `/theaters/:theaterId` | Bearer, owner of that theater | Delete (blocked if it has upcoming showtimes) |
| POST | `/theaters/:theaterId/screens` | Bearer, owner of that theater | Create a screen |
| GET | `/theaters/:theaterId/screens` | Public | List a theater's screens |
| GET | `/theaters/:theaterId/screens/:screenId` | Public | Screen details |
| PUT | `/theaters/:theaterId/screens/:screenId` | Bearer, owner of that theater | Update a screen |
| DELETE | `/theaters/:theaterId/screens/:screenId` | Bearer, owner of that theater | Delete (blocked if it has upcoming showtimes) |

**POST /theaters** body:
```json
{
  "name": "Sample Cinema",
  "location": { "address": "123 Main St", "city": "Cairo", "state": "Cairo", "zipCode": "12345" },
  "phone": "0221234567",
  "amenities": ["parking", "3D"]
}
```

**POST /theaters/:theaterId/screens** body:
```json
{
  "screenName": "Screen 1",
  "screenType": "2D",
  "totalRows": 5,
  "seatsPerRow": 8
}
```
> `capacity` is derived automatically as `totalRows × seatsPerRow` — don't send it.

---

## 4. Showtimes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/showtimes` | Bearer, owner/admin | Create a showtime |
| GET | `/showtimes/movie/:movieId?theaterId=&fromDate=` | Public | Upcoming showtimes for a movie |
| GET | `/showtimes/theater/:theaterId?date=` | Public | Showtimes for a theater (optionally one day) |
| GET | `/showtimes/:id` | Public | Showtime details (populated movie/theater/screen) |
| PUT | `/showtimes/:id` | Bearer, owner/admin | Update start time or language |
| PATCH | `/showtimes/:id/cancel` | Bearer, owner/admin | Cancel (soft delete) |
| DELETE | `/showtimes/:id` | Bearer, admin | Hard delete (blocked if it has active bookings) |

**POST /showtimes** body:
```json
{
  "movieId": "...",
  "theaterId": "...",
  "screenId": "...",
  "startTime": "2026-12-31T18:00:00.000Z",
  "language": "English"
}
```
> ⚠️ Ownership of `theaterId` isn't currently cross-checked against the authenticated `owner` here (only role is checked) — see the note in `routes/showTimeRoutes.js`.

---

## 5. Seats

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/seats/screen/:screenId/layout/:showtimeId` | Public | Seat layout + live availability for a showtime |
| GET | `/seats/screen/:screenId` | Public | Raw seat configuration (no availability) |
| PUT | `/seats/screen/:screenId` | Bearer, owner/admin | Replace the screen's entire seat layout |

**PUT /seats/screen/:screenId** body:
```json
{
  "seats": [
    { "row": "A", "number_in_row": 1, "seat_type": "standard", "priceMultiplier": 1.0 },
    { "row": "A", "number_in_row": 2, "seat_type": "vip", "priceMultiplier": 1.5 }
  ]
}
```
Seat identifiers are generated as `row + number_in_row` (e.g. `"A1"`) — this is the value used in bookings' `seats` array.

---

## 6. Bookings

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/bookings` | Bearer | Create a booking for a showtime |

**POST /bookings** body:
```json
{
  "movieId": "...",
  "theaterId": "...",
  "showtimeId": "...",
  "seats": ["A1", "A2"],
  "promoCode": "SAVE10",
  "basePrice": 100
}
```
`seats` must match existing `seatNumber` values on the screen and must not already be booked for that showtime. `promoCode` is optional. Response `201`:
```json
{
  "message": "Booking created successfully!",
  "booking": { "...": "..." },
  "subTotal": 200,
  "discount": 20,
  "appliedOffer": "..."
}
```

---

## 7. Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/payments` | Bearer | Process payment for a booking |
| GET | `/payments/booking/:bookingId` | Bearer | Get the payment record for a booking |
| POST | `/payments/:id/refund` | Bearer, admin/owner | Refund a payment |

**POST /payments** body:
```json
{
  "bookingId": "...",
  "amount": 200,
  "paymentMethod": "credit_card",
  "currency": "EGP"
}
```
`paymentMethod` must be one of: `credit_card`, `fawry`, `vodafone_cash`, `stripe`.

---

## 8. Reviews

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/reviews/movie/:movieId` | Public | All reviews for a movie |
| POST | `/reviews` | Bearer | Create a review |
| PUT | `/reviews/:id` | Bearer | Update your own review |
| DELETE | `/reviews/:id` | Bearer | Delete your own review |

**POST /reviews** body:
```json
{ "movieId": "...", "rating": 5, "comment": "Great movie!" }
```
`rating` must be an integer 1–5. One review per user per movie (enforced by a unique index).

---

## 9. Offers

Promo codes and conditional discounts. All management routes are admin-only; only `/offers/active` is public.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/offers/active` | Public | Currently active offers |
| POST | `/offers` | Bearer, admin | Create an offer |
| GET | `/offers` | Bearer, admin | List all offers |
| GET | `/offers/:id` | Bearer, admin | Offer details |
| PUT | `/offers/:id` | Bearer, admin | Update an offer |
| PATCH | `/offers/:id/deactivate` | Bearer, admin | Deactivate without deleting |
| DELETE | `/offers/:id` | Bearer, admin | Delete an offer |

**POST /offers** body:
```json
{
  "title": "10% Off",
  "type": "promocode",
  "code": "SAVE10",
  "scope": "all",
  "discountType": "percentage",
  "discountValue": 10,
  "startsAt": "2026-01-01T00:00:00.000Z",
  "endAt": "2026-12-31T23:59:59.000Z"
}
```
- `type`: `"conditional"` (requires a `condition` object) or `"promocode"` (requires `code`).
- `scope`: `"all"`, `"movie"` (requires `movieId`), or `"first_time"`.
- `discountType`: `"percentage"` or `"flat"`.

---

## 10. Theater Dashboard

Analytics for a theater's owner. All routes require the authenticated `owner` to own the given `theaterId` (or `admin`).

| Method | Path | Description |
|---|---|---|
| GET | `/theaters/:theaterId/dashboard/overview?fromDate=&toDate=` | Bookings, tickets sold, revenue, discounts given, upcoming showtime count |
| GET | `/theaters/:theaterId/dashboard/revenue-by-movie?fromDate=&toDate=` | Revenue and tickets sold per movie |
| GET | `/theaters/:theaterId/dashboard/upcoming-showtimes` | All upcoming scheduled showtimes |

---

## Typical flow to test end-to-end

1. `POST /auth/send-signup-otp` → check server console (dev) or email for the OTP.
2. `POST /auth/complete-signup` → save `accessToken`/`refreshToken`.
3. `POST /theaters` (as an `owner`) → save `theaterId`.
4. `POST /theaters/:theaterId/screens` → save `screenId`.
5. `PUT /seats/screen/:screenId` → define the seat layout.
6. `POST /movies` (as an `admin`) → save `movieId`.
7. `POST /showtimes` → save `showtimeId`.
8. `GET /seats/screen/:screenId/layout/:showtimeId` → confirm seats show as available.
9. `POST /bookings` → book seats.
10. `POST /payments` → pay for the booking.

## Seeding real data (movies, theater, showtimes)

Instead of creating everything by hand above, you can seed the database with real movie data and a ready-to-book demo theater:

1. Get a free TMDB API key: go to https://www.themoviedb.org/settings/api, create a free account, request an API key (choose "Developer" / personal use — no credit card needed), and copy the "API Key (v3 auth)".
2. Put it in `.env`: `TMDB_API_KEY=your_key_here`
3. Run:
   ```bash
   npm run seed:movies   # pulls ~60 real popular/now-playing/upcoming movies from TMDB
   npm run seed:demo     # creates "Demo Cinema" with 2 screens (full seat layouts)
                         # and schedules showtimes for the most recently added movies
   ```
   or run both at once: `npm run seed`

Both scripts are safe to re-run — movies are upserted by title, and the theater/screens are upserted by name, so you won't get duplicates. After seeding, `GET /api/movies`, `GET /api/theaters`, and `GET /api/showtimes/theater/:theaterId` will all return real, bookable data — useful both for Postman testing and for a frontend developer to build against immediately.

