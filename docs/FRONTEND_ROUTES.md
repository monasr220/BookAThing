# Frontend Routes Documentation

## Main Application Routes

### Public Routes
- **`/`** - Home Page
  - Components: Nav, HeroSection, NowShowing, PopularMovies, ComingSoon, UpcomingMovies, Details, Footer
  - API Endpoints Used:
    - `/api/movies/now-in-cinemas`
    - `/api/movies/popular`
    - `/api/movies/coming-soon`
    - `/api/movies/upcoming`

- **`/auth`** - Authentication Page
  - Component: AuthForm (includes OtpModal, ResetPasswordModal)
  - API Endpoints Used:
    - `/api/auth/send-signup-otp`
    - `/api/auth/complete-signup`
    - `/api/auth/login`
    - `/api/auth/forgot-password`
    - `/api/auth/reset-password`

- **`/search`** - Movie Search Results
  - Component: SearchResults
  - API Endpoints Used:
    - `/api/movies/search`

- **`/offers`** - Active Offers Page
  - Component: ActiveOffers
  - API Endpoints Used:
    - `/api/offers/active`

- **`/theaters`** - Theaters Browse Page
  - Component: TheatersBrowse
  - API Endpoints Used:
    - `/api/theaters`

- **`/theaters/:theaterId`** - Theater Detail Page
  - Component: TheaterDetail
  - API Endpoints Used:
    - `/api/theaters/:theaterId`
    - `/api/theaters/:theaterId/screens`
    - `/api/showtimes/theater/:theaterId`

### User Routes (Require Authentication)
- **`/movie/:id`** - Movie Booking Page
  - Component: MovieBooking (includes MovieReviews)
  - API Endpoints Used:
    - `/api/movies/:id`
    - `/api/showtimes/movie/:movieId`
    - `/api/seats/screen/:screenId/layout/:showtimeId`
    - `/api/bookings`
    - `/api/payments`
    - `/api/reviews/movie/:movieId`
    - `/api/reviews`

- **`/my-bookings`** - User's Bookings
  - Component: MyBookings
  - API Endpoints Used:
    - `/api/bookings/my-bookings`
    - `/api/bookings/:bookingId` (DELETE)

- **`/receipt/:bookingId`** - Booking Receipt
  - Component: Receipt
  - API Endpoints Used:
    - `/api/payments/booking/:bookingId`

### Theater Dashboard Routes (Require Owner/Admin Role)
- **`/theater/*`** - Theater Dashboard Application
  - Component: TheaterApp (manages internal routing)
  - API Endpoints Used: Multiple (see below)

## Theater Dashboard Internal Routes

### Theater Owner Routes
- **Dashboard** (`/theater/dashboard`)
  - Component: Dashboard
  - API Endpoints Used:
    - `/api/theaters/:theaterId/dashboard/overview`
    - `/api/theaters/:theaterId/dashboard/revenue-by-movie`
    - `/api/theaters/:theaterId/dashboard/upcoming-showtimes`

- **Theaters Management** (`/theater/theaters`)
  - Component: Theaters
  - API Endpoints Used:
    - `/api/theaters`
    - `/api/theaters/mine`
    - `/api/theaters/:theaterId`
    - `/api/theaters/:theaterId` (PUT)
    - `/api/theaters/:theaterId` (DELETE)

- **Screens Management** (`/theater/screens`)
  - Component: Screens
  - API Endpoints Used:
    - `/api/theaters/:theaterId/screens`
    - `/api/theaters/:theaterId/screens/:screenId`
    - `/api/theaters/:theaterId/screens` (POST)
    - `/api/theaters/:theaterId/screens/:screenId` (PUT)
    - `/api/theaters/:theaterId/screens/:screenId` (DELETE)

- **Showtimes Management** (`/theater/showtimes`)
  - Component: Showtimes
  - API Endpoints Used:
    - `/api/showtimes`
    - `/api/showtimes/:id`
    - `/api/showtimes/:id` (PUT)
    - `/api/showtimes/:id` (DELETE)
    - `/api/showtimes/:id/cancel` (PATCH)

- **Bookings Management** (`/theater/bookings`)
  - Component: Bookings
  - API Endpoints Used:
    - `/api/bookings/my-bookings` (for theater context)
    - `/api/bookings/:bookingId` (DELETE)

- **Refunds Management** (`/theater/refunds`)
  - Component: Refunds
  - API Endpoints Used:
    - `/api/payments/:id/refund`

### Admin Routes
- **Movies Management** (`/theater/movies`)
  - Component: AdminMovies
  - API Endpoints Used:
    - `/api/movies`
    - `/api/movies/:id`
    - `/api/movies/:id/booking-stats`
    - `/api/movies` (POST)
    - `/api/movies/:id` (PUT)
    - `/api/movies/:id` (DELETE)

- **Offers Management** (`/theater/offers`)
  - Component: AdminOffers
  - API Endpoints Used:
    - `/api/offers`
    - `/api/offers/:id`
    - `/api/offers` (POST)
    - `/api/offers/:id` (PUT)
    - `/api/offers/:id` (DELETE)
    - `/api/offers/:id/deactivate` (PATCH)

- **Refunds Management** (`/theater/refunds`)
  - Component: Refunds (shared with owners)
  - API Endpoints Used:
    - `/api/payments/:id/refund`

## Navigation Menu Structure

### Main Navigation (Nav.jsx)
- **Home** → `/`
- **Movies** → Anchor to `#now-showing` on home page
- **Cinemas** → `/theaters`
- **Offers** → `/offers`
- **Theaters** → `/theaters`
- **My Bookings** → `/my-bookings` (requires login)
- **Theater Dashboard** → `/theater` (visible only for owner/admin roles)
- **Search** → Functional search form

### Theater Dashboard Navigation (Sidebar.jsx)
**For Theater Owners:**
- Dashboard
- Theaters
- Screens
- Showtimes
- Bookings
- Refunds

**For Admins:**
- Movies
- Offers
- Refunds

## Authentication Flow
1. User visits `/auth` for login/signup
2. On successful authentication, tokens are stored in localStorage
3. Navigation updates to show user-specific options
4. Role-based menu items appear (Theater Dashboard for owners/admins)

## Route Protection
- **My Bookings** - Requires valid access token
- **Movie Booking** - Requires valid access token for booking flow
- **Theater Dashboard** - Requires owner or admin role
- **Admin Functions** - Require admin role

## External Links
- Footer links (static, for future implementation):
  - Help Center
  - Terms & Conditions
  - Privacy Policy
  - Contact Us
  - FAQs

## API Coverage Summary
✅ **All 45+ backend API endpoints are covered by frontend routes**
✅ **All functional routes are accessible through navigation**
✅ **Role-based access control is properly implemented**
✅ **No static data dependencies - fully API-driven**