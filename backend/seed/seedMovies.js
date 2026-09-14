/**
 * Seeds the Movie collection with real movie data from TMDB (The Movie Database).
 *
 * Requires a free TMDB API key — see API_DOCUMENTATION.md / README for how to get one.
 * Set it as TMDB_API_KEY in your .env file, then run:
 *
 *   npm run seed:movies
 *
 * Safe to re-run: movies are upserted by title, so running this multiple times
 * won't create duplicates.
 */
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Movie = require('../models/Movie');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// How many movies to pull from each TMDB list. Feel free to raise this.
const PAGES_PER_LIST = 1; // 20 movies per page
const LISTS = ['popular', 'now_playing', 'upcoming'];

if (!TMDB_API_KEY) {
    console.error('\nMissing TMDB_API_KEY in .env — get a free one at https://www.themoviedb.org/settings/api\n');
    process.exit(1);
}

async function tmdbFetch(path) {
    const url = `${TMDB_BASE_URL}${path}${path.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`TMDB request failed (${res.status}): ${path}`);
    }
    return res.json();
}

async function fetchMovieList(listName, page) {
    const data = await tmdbFetch(`/movie/${listName}?language=en-US&page=${page}`);
    return data.results || [];
}

async function fetchMovieDetails(id) {
    return tmdbFetch(`/movie/${id}?language=en-US&append_to_response=credits,videos`);
}

function mapToMovieDocument(details) {
    const director = details.credits?.crew?.find(c => c.job === 'Director');
    const topCast = (details.credits?.cast || []).slice(0, 5).map(c => c.name);
    const trailer = (details.videos?.results || []).find(
        v => v.site === 'YouTube' && v.type === 'Trailer'
    );

    return {
        title: details.title,
        StreamingType: 'theater',
        genre: (details.genres || []).map(g => g.name).join(', ') || 'Unknown',
        duration: details.runtime ? String(details.runtime) : '120',
        releaseDate: details.release_date ? new Date(details.release_date) : new Date(),
        language: details.original_language || 'en',
        description: details.overview || 'No description available.',
        director: director ? director.name : 'Unknown',
        production: details.production_companies?.[0]?.name || 'Independent',
        cast: topCast.length > 0 ? topCast.join(', ') : 'Unknown',
        poster_url: details.poster_path ? `${IMAGE_BASE_URL}${details.poster_path}` : '',
        trailer_url: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : ''
    };
}

async function run() {
    await connectDB();

    console.log('Fetching movie lists from TMDB...');
    const seenIds = new Set();
    const summaries = [];

    for (const listName of LISTS) {
        for (let page = 1; page <= PAGES_PER_LIST; page++) {
            const results = await fetchMovieList(listName, page);
            for (const movie of results) {
                if (!seenIds.has(movie.id)) {
                    seenIds.add(movie.id);
                    summaries.push(movie);
                }
            }
        }
    }

    console.log(`Found ${summaries.length} unique movies. Fetching full details...`);

    let created = 0;
    let updated = 0;

    for (const summary of summaries) {
        try {
            const details = await fetchMovieDetails(summary.id);
            const doc = mapToMovieDocument(details);

            const result = await Movie.findOneAndUpdate(
                { title: doc.title },
                doc,
                { upsert: true, returnDocument: 'after', rawResult: true, setDefaultsOnInsert: true }
            );

            if (result.lastErrorObject?.updatedExisting) {
                updated++;
            } else {
                created++;
            }
            console.log(`  ✓ ${doc.title}`);
        } catch (error) {
            console.error(`  ✗ Failed for "${summary.title}": ${error.message}`);
        }
    }

    console.log(`\nDone. ${created} movies created, ${updated} movies updated.`);
    await mongoose.disconnect();
    process.exit(0);
}

run().catch(async (error) => {
    console.error('Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
});
