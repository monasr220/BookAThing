/**
 * Seeds a demo theater, screen (with a full seat layout), and showtimes for
 * whatever movies already exist in the database — so Postman / a frontend
 * dev has a fully bookable flow to test against, not just bare movie titles.
 *
 * Run AFTER seed:movies:
 *
 *   npm run seed:demo
 *
 * Safe to re-run: the theater/screen are upserted by name, and showtimes are
 * only created if none already exist for that movie+screen+time.
 */
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Movie = require('../models/Movie');
const Theater = require('../models/theater');
const TheaterScreen = require('../models/theaterScreen');
const Screening = require('../models/screening');

const DEMO_THEATER = {
    name: 'Demo Cinema',
    location: { address: '1 Sample Street', city: 'Cairo', state: 'Cairo', zipCode: '11511' },
    phone: '0221234567',
    amenities: ['parking', '3D', 'IMAX']
};

const SCREENS = [
    { screenName: 'Screen 1', screenType: '2D', totalRows: 5, seatsPerRow: 8 },
    { screenName: 'Screen 2', screenType: 'IMAX', totalRows: 6, seatsPerRow: 10 }
];

const MOVIES_TO_SCHEDULE = 8; // how many movies (most recently added) get showtimes
const SHOWTIMES_PER_MOVIE_PER_SCREEN = 2;
const SHOW_HOURS = [15, 18, 21]; // pick from these start hours

function buildSeatLayout(totalRows, seatsPerRow) {
    const seats = [];
    for (let r = 0; r < totalRows; r++) {
        const rowLetter = String.fromCharCode(65 + r); // A, B, C...
        const isVipRow = r === 0; // front-ish row as VIP for variety
        for (let n = 1; n <= seatsPerRow; n++) {
            seats.push({
                seatNumber: `${rowLetter}${n}`,
                seatType: isVipRow ? 'vip' : 'standard',
                priceMultiplier: isVipRow ? 1.5 : 1.0
            });
        }
    }
    return seats;
}

async function upsertTheater() {
    const theater = await Theater.findOneAndUpdate(
        { name: DEMO_THEATER.name },
        DEMO_THEATER,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    console.log(`Theater ready: ${theater.name} (${theater._id})`);
    return theater;
}

async function upsertScreens(theaterId) {
    const screens = [];
    for (const config of SCREENS) {
        const capacity = config.totalRows * config.seatsPerRow;
        const seats = buildSeatLayout(config.totalRows, config.seatsPerRow);

        const screen = await TheaterScreen.findOneAndUpdate(
            { theaterId, screenName: config.screenName },
            { theaterId, ...config, capacity, seats },
            { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );
        console.log(`  Screen ready: ${screen.screenName} (${screen._id}) — ${seats.length} seats`);
        screens.push(screen);
    }
    return screens;
}

function nextDateAt(daysFromNow, hour) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hour, 0, 0, 0);
    return date;
}

async function scheduleShowtimes(movies, screens) {
    let created = 0;
    let dayOffset = 1;

    for (const movie of movies) {
        for (const screen of screens) {
            for (let i = 0; i < SHOWTIMES_PER_MOVIE_PER_SCREEN; i++) {
                const hour = SHOW_HOURS[i % SHOW_HOURS.length];
                const startTime = nextDateAt(dayOffset, hour);

                const existing = await Screening.findOne({
                    movie_id: movie._id,
                    screen_id: screen._id,
                    start_time: startTime
                });

                if (!existing) {
                    await Screening.create({
                        movie_id: movie._id,
                        theater_id: screen.theaterId,
                        screen_id: screen._id,
                        start_time: startTime,
                        language: movie.language || 'en'
                    });
                    created++;
                }
            }
            dayOffset++;
        }
    }
    return created;
}

async function run() {
    await connectDB();

    const theater = await upsertTheater();
    const screens = await upsertScreens(theater._id);

    const movies = await Movie.find().sort({ createdAt: -1 }).limit(MOVIES_TO_SCHEDULE);
    if (movies.length === 0) {
        console.log('\nNo movies found — run "npm run seed:movies" first.');
        await mongoose.disconnect();
        process.exit(0);
    }

    console.log(`\nScheduling showtimes for ${movies.length} movies...`);
    const created = await scheduleShowtimes(movies, screens);

    console.log(`\nDone. ${created} showtimes created.`);
    console.log(`\nDemo theaterId: ${theater._id}`);
    screens.forEach(s => console.log(`Demo screenId (${s.screenName}): ${s._id}`));

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(async (error) => {
    console.error('Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
});
