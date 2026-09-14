// Config for the `migrate-mongo` CLI (see package.json scripts: migrate:*).
// Reuses the same MONGO_URI from .env that the app itself connects with,
// so migrations always target whichever database the server is using.
require('dotenv').config({ quiet: true });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booking';

// Extract the database name from the URI so it stays in sync automatically
// (migrate-mongo needs it as a separate field).
const databaseName = new URL(MONGO_URI).pathname.replace(/^\//, '') || 'booking';

const config = {
  mongodb: {
    url: MONGO_URI,
    databaseName,
    options: {}
  },

  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  lockCollectionName: 'changelog_lock',
  lockTtl: 0,
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs'
};

module.exports = config;
