#!/bin/bash
# Movie Booking API — one-time setup script.
# Run this once from inside the backend folder:
#
#   bash setup.sh
#
# Prerequisites before running this:
#   1. MongoDB must be running and MONGO_URI in .env must point to it.
#   2. TMDB_API_KEY must be set in .env (free key: https://www.themoviedb.org/settings/api)

set -e  # stop immediately if any step fails

echo "================================================"
echo " 1. Installing dependencies"
echo "================================================"
npm install

echo
echo "================================================"
echo " 2. Applying database migrations"
echo "================================================"
npm run migrate:up

echo
echo "================================================"
echo " 3. Seeding real movies from TMDB"
echo "================================================"
npm run seed:movies

echo
echo "================================================"
echo " 4. Seeding demo theater/screens/showtimes"
echo "================================================"
npm run seed:demo

echo
echo "================================================"
echo " Setup complete!"
echo "================================================"
echo
echo "Next steps (two separate terminals):"
echo
echo "  Terminal 1 — start the server (keep this running):"
echo "    npm run dev"
echo
echo "  Terminal 2 — run the API test script:"
echo "    sed -i 's/\r\$//' test-api.sh"
echo "    bash test-api.sh"
