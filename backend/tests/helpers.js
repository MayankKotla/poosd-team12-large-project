// tests/helpers.js
// Shared shortcuts so each test doesn't repeat the register → verify → login dance.
// Requiring this file also runs setup.js (fake env, fake mailer, test database).

require('./setup');                        // MUST come before ../app

const request = require('supertest');
const { expect } = require('expect');
const app = require('../app');
const mailer = require('../utils/mailer');

// Pull the first link out of the most recent fake email sent to `to`.
function lastLinkSentTo(to) {
  const mail = [...mailer.sentMail].reverse().find((m) => m.to === to);
  if (!mail) throw new Error(`No email was sent to ${to}`);
  return mail.html.match(/href="([^"]+)"/)[1];
}

// Register a user and click their verification link, the way a real user would.
async function registerAndVerify({
  firstName = 'Test',
  lastName = 'User',
  email,
  password = 'password123',
}) {
  await request(app)
    .post('/api/auth/register')
    .send({ firstName, lastName, email, password })
    .expect(201);

  // Link looks like http://api.test/api/auth/verify/<token>; keep only the path
  const path = new URL(lastLinkSentTo(email)).pathname;
  await request(app).get(path).expect(302);
}

// Register + verify + log in. Returns { token, user, auth } where auth is the
// header value for protected routes.
async function createLoggedInUser(opts) {
  const password = opts.password || 'password123';
  await registerAndVerify({ ...opts, password });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: opts.email, password })
    .expect(200);
  return { ...res.body, auth: `Bearer ${res.body.token}` };
}

module.exports = {
  app, request, expect, mailer, lastLinkSentTo, registerAndVerify, createLoggedInUser,
};
