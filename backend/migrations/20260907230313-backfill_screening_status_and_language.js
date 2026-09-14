/**
 * Backfills fields added to models/screening.js after the model was extended
 * to actually represent a full showtime (start_time, language, status).
 * Any screening documents created before that change won't have `status`,
 * so queries filtering by status: 'scheduled' would silently exclude them.
 *
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
module.exports = {
    async up(db, client) {
        await db.collection('movie_screenings').updateMany(
            { status: { $exists: false } },
            { $set: { status: 'scheduled' } }
        );

        await db.collection('movie_screenings').updateMany(
            { language: { $exists: false } },
            { $set: { language: 'en' } }
        );
    },

    async down(db, client) {
        await db.collection('movie_screenings').updateMany(
            {},
            { $unset: { status: '', language: '' } }
        );
    }
};
