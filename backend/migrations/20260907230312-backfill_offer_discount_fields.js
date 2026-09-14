/**
 * Fixes offers created before two bugs were patched in models/Offer.js:
 *   1. discountType had a typo ('precentage' instead of 'percentage'), so any
 *      offer saved with the old value won't match the discount engine's check.
 *   2. discountValue didn't exist on the schema at all, so old offers may be
 *      missing it entirely (and would compute a $0 discount).
 *
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
module.exports = {
    async up(db, client) {
        // Fix the old typo'd enum value.
        await db.collection('offers').updateMany(
            { discountType: 'precentage' },
            { $set: { discountType: 'percentage' } }
        );

        // Any offer still missing discountValue gets a safe default of 0
        // (effectively "no discount") rather than crashing the discount engine.
        await db.collection('offers').updateMany(
            { discountValue: { $exists: false } },
            { $set: { discountValue: 0 } }
        );
    },

    async down(db, client) {
        // Not reversible in a meaningful way — we don't know which offers
        // originally had the typo, and reintroducing a bug isn't a real rollback.
        // Left intentionally as a no-op.
    }
};
