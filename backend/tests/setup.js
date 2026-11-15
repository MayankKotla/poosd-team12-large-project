// tests/setup.js
// Loaded at the top of every test file (through helpers.js), BEFORE the app.
// Uses Node's built-in test runner (node:test), not Jest.
//
// What it does:
//  1. Sets fake environment variables, so tests never read the real .env
//     (no real JWT secret, no real SMTP account, no real Mongo URI).
//  2. Swaps the mailer's sendMail for a fake that records emails instead of
//     sending them, so tests can read the verification / reset links.
//     This must happen before routes/auth.js is loaded, because auth.js grabs
//     sendMail once when it loads.
//  3. Starts a throwaway in-memory MongoDB for this test file. The production
//     database on the droplet is never touched.
//  4. Wipes every collection between tests so each test starts clean.

process.env.JWT_SECRET = 'test-secret';
process.env.API_URL = 'http://api.test';
process.env.APP_URL = 'http://app.test';

const { before, after, afterEach } = require('node:test');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// --- fake mailer -----------------------------------------------------------
const mailer = require('../utils/mailer');
mailer.sentMail = [];
mailer.sendMail = async (to, subject, html) => {
  mailer.sentMail.push({ to, subject, html });
};

// --- in-memory database ----------------------------------------------------
let mongo;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: 'test' });
  await mongoose.connection.syncIndexes();   // build the unique-email index up front
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
  mailer.sentMail.length = 0;
});

after(async () => {
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});
