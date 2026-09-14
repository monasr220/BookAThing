/**
 * Seeds fixed demo accounts (admin, owner, and a plain user) with known
 * credentials, so anyone on the team — frontend devs included — can just
 * log in normally through POST /api/auth/login. No database access or
 * scripts needed on their end; this only needs to be run once by whoever
 * owns the backend/database.
 *
 * Run AFTER seed:demo (so the Demo Cinema theater already exists to
 * assign to the owner account):
 *
 *   node seed/seedDemoAccounts.js
 *
 * Safe to re-run: accounts are upserted by email, so re-running just
 * resets their role/password/theater link instead of creating duplicates.
 */
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Theater = require('../models/theater');
const { hashedPassword } = require('../utils/authHelpers');

const DEMO_PASSWORD = 'Demo@12345'; // same password for all demo accounts, for simplicity

const ACCOUNTS = [
    { name: 'Demo Admin', email: 'admin@demo.com', phone: '0100000001', role: 'admin' },
    { name: 'Demo Owner', email: 'owner@demo.com', phone: '0100000002', role: 'owner' },
    { name: 'Demo User', email: 'user@demo.com', phone: '0100000003', role: 'user' }
];

async function upsertAccount({ name, email, phone, role }) {
    const password = await hashedPassword(DEMO_PASSWORD);

    const user = await User.findOneAndUpdate(
        { email },
        { name, email, phone, role, password, status: 'active' },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    console.log(`-> ${role.padEnd(6)} ${user.email} (${user._id})`);
    return user;
}

async function linkOwnerToTheater(ownerUser) {
    // Reuse the "Demo Cinema" theater created by seed/seedDemoData.js so the
    // owner dashboard has real screens/showtimes/bookings to show, instead
    // of an empty theater.
    let theater = await Theater.findOne({ name: 'Demo Cinema' });

    if (!theater) {
        console.log('   (No "Demo Cinema" theater found — run `node seed/seedDemoData.js` first for a fuller demo.');
        console.log('    Creating a bare theater for now so the owner login still works.)');
        theater = await Theater.create({
            name: 'Demo Owner Theater',
            location: { address: '1 Demo Street', city: 'Cairo' },
            phone: '0100000000'
        });
    }

    theater.ownerId = ownerUser._id;
    await theater.save();
    console.log(`   Linked as owner of "${theater.name}" (${theater._id})`);
}

async function run() {
    await connectDB();

    console.log('Seeding demo accounts...\n');

    let ownerUser = null;
    for (const account of ACCOUNTS) {
        const user = await upsertAccount(account);
        if (account.role === 'owner') ownerUser = user;
    }

    if (ownerUser) {
        await linkOwnerToTheater(ownerUser);
    }

    console.log('\nDone. Share these with the team — everyone logs in normally at POST /api/auth/login:\n');
    ACCOUNTS.forEach(a => console.log(`  ${a.role.padEnd(6)} ${a.email}  /  ${DEMO_PASSWORD}`));

    await mongoose.disconnect();
    process.exit(0);
}

run().catch(async (error) => {
    console.error('Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
});
