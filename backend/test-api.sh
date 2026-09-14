#!/bin/bash
# Movie Booking API — full flow test script using curl only (no Postman needed).
#
# Usage:
#   bash test-api.sh
#
# Run this from anywhere (it doesn't need to be inside the backend folder),
# as long as the server is already running on BASE_URL below.
#
# NOTE: every curl call below is written on a single line on purpose (no
# trailing "\" line continuations) so this file can't break if it ever picks
# up Windows-style CRLF line endings (e.g. from an editor or git autocrlf).

BASE_URL="http://localhost:5000/api"
EMAIL="curltest_$(date +%s)@example.com"   # unique email each run, so re-running never collides
PASSWORD="password123"

extract_field() {
  echo "$1" | grep -o "\"$2\":\"[^\"]*\"" | head -1 | sed -E 's/.*:"([^"]*)"/\1/'
}

echo "================================================"
echo " 1. Send Signup OTP"
echo "================================================"
RESP=$(curl -s -X POST "$BASE_URL/auth/send-signup-otp" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\"}")
echo "$RESP"
OTP=$(extract_field "$RESP" devOtp)
echo "-> Captured OTP: $OTP"
echo

echo "================================================"
echo " 2. Complete Signup"
echo "================================================"
RESP=$(curl -s -X POST "$BASE_URL/auth/complete-signup" -H "Content-Type: application/json" -d "{\"name\":\"Curl Tester\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"phone\":\"01000000000\",\"otp\":\"$OTP\"}")
echo "$RESP"
ACCESS_TOKEN=$(extract_field "$RESP" accessToken)
REFRESH_TOKEN=$(extract_field "$RESP" refreshToken)
echo "-> accessToken: ${ACCESS_TOKEN:0:20}..."
echo

echo "================================================"
echo " 3. Get All Movies (public) — grab the first movie's ID"
echo "================================================"
RESP=$(curl -s "$BASE_URL/movies")
MOVIE_ID=$(extract_field "$RESP" _id)
echo "-> First movieId: $MOVIE_ID"
echo

echo "================================================"
echo " 4. Get All Theaters (public) — grab the first theater's ID"
echo "================================================"
RESP=$(curl -s "$BASE_URL/theaters")
THEATER_ID=$(extract_field "$RESP" _id)
echo "-> First theaterId: $THEATER_ID"
echo

echo "================================================"
echo " 5. Get Screens for that theater — grab the first screen's ID"
echo "================================================"
RESP=$(curl -s "$BASE_URL/theaters/$THEATER_ID/screens")
echo "$RESP"
SCREEN_ID=$(extract_field "$RESP" _id)
echo "-> First screenId: $SCREEN_ID"
echo

echo "================================================"
echo " 6. Get Showtimes for that theater — grab the first showtime's ID"
echo "================================================"
RESP=$(curl -s "$BASE_URL/showtimes/theater/$THEATER_ID")
echo "$RESP"
SHOWTIME_ID=$(extract_field "$RESP" _id)
echo "-> First showtimeId: $SHOWTIME_ID"
echo

echo "================================================"
echo " 7. Get Seat Layout for that screen + showtime"
echo "================================================"
curl -s "$BASE_URL/seats/screen/$SCREEN_ID/layout/$SHOWTIME_ID"
echo
echo

echo "================================================"
echo " 8. Create a Booking (seats A1, A2 — adjust if already taken)"
echo "================================================"
RESP=$(curl -s -X POST "$BASE_URL/bookings" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d "{\"movieId\":\"$MOVIE_ID\",\"theaterId\":\"$THEATER_ID\",\"showtimeId\":\"$SHOWTIME_ID\",\"seats\":[\"A1\",\"A2\"],\"basePrice\":100}")
echo "$RESP"
BOOKING_ID=$(extract_field "$RESP" _id)
echo "-> bookingId: $BOOKING_ID"
echo

echo "================================================"
echo " 9. Process Payment for that booking"
echo "================================================"
curl -s -X POST "$BASE_URL/payments" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d "{\"bookingId\":\"$BOOKING_ID\",\"amount\":200,\"paymentMethod\":\"credit_card\"}"
echo
echo

echo "================================================"
echo " 10. Create a Review for that movie"
echo "================================================"
curl -s -X POST "$BASE_URL/reviews" -H "Content-Type: application/json" -H "Authorization: Bearer $ACCESS_TOKEN" -d "{\"movieId\":\"$MOVIE_ID\",\"rating\":5,\"comment\":\"Great movie, tested via curl!\"}"
echo
echo

echo "================================================"
echo " Done. Summary of captured values:"
echo "================================================"
echo "email:        $EMAIL"
echo "accessToken:  $ACCESS_TOKEN"
echo "refreshToken: $REFRESH_TOKEN"
echo "movieId:      $MOVIE_ID"
echo "theaterId:    $THEATER_ID"
echo "screenId:     $SCREEN_ID"
echo "showtimeId:   $SHOWTIME_ID"
echo "bookingId:    $BOOKING_ID"
echo
echo "NOTE: this account has the default role 'user', so admin/owner-only"
echo "endpoints (create movie/theater/showtime/offer, dashboard, etc.) will"
echo "return 403 with it. To test those, promote this user's role in the"
echo "database — ask for a script to do that if you want one."
