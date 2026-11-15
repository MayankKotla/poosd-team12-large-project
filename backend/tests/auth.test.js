// tests/auth.test.js
// Covers the rubric's "email verification and recovery" requirement plus JWT login.

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { describe, test, beforeEach } = require('node:test');
const { app, request, expect, mailer, lastLinkSentTo, registerAndVerify } = require('./helpers');

const alice = { firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', password: 'password123' };

describe('POST /api/auth/register', () => {
  test('creates an unverified user, hashes the password, and emails a verify link', async () => {
    const res = await request(app).post('/api/auth/register').send(alice);

    expect(res.status).toBe(201);
    const user = await User.findOne({ email: alice.email });
    expect(user.isVerified).toBe(false);
    expect(user.passwordHash).not.toBe(alice.password);           // stored hashed
    expect(mailer.sentMail).toHaveLength(1);
    expect(lastLinkSentTo(alice.email)).toContain('/api/auth/verify/');
  });

  test('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@test.com' });
    expect(res.status).toBe(400);
  });

  test('rejects passwords shorter than 8 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...alice, password: 'short' });
    expect(res.status).toBe(400);
  });

  test('rejects a duplicate email, case-insensitively', async () => {
    await request(app).post('/api/auth/register').send(alice).expect(201);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...alice, email: 'ALICE@test.com' });
    expect(res.status).toBe(409);
  });
});

describe('GET /api/auth/verify/:token', () => {
  test('valid link verifies the user and redirects to the login page', async () => {
    await request(app).post('/api/auth/register').send(alice);
    const path = new URL(lastLinkSentTo(alice.email)).pathname;

    const res = await request(app).get(path);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('http://app.test/login?verified=1');
    expect((await User.findOne({ email: alice.email })).isVerified).toBe(true);
  });

  test('link cannot be reused', async () => {
    await request(app).post('/api/auth/register').send(alice);
    const path = new URL(lastLinkSentTo(alice.email)).pathname;
    await request(app).get(path).expect(302);

    const res = await request(app).get(path);
    expect(res.status).toBe(400);
  });

  test('bogus token is rejected', async () => {
    const res = await request(app).get('/api/auth/verify/not-a-real-token');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  test('unverified users cannot log in', async () => {
    await request(app).post('/api/auth/register').send(alice);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: alice.email, password: alice.password });
    expect(res.status).toBe(403);
  });

  test('verified user gets a valid JWT and no password hash', async () => {
    await registerAndVerify(alice);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: alice.email, password: alice.password });

    expect(res.status).toBe(200);
    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(payload.id).toBe(String(res.body.user.id));
    expect(res.body.user.email).toBe(alice.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('wrong password is rejected', async () => {
    await registerAndVerify(alice);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: alice.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  test('unknown email gets the same 401 as a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' });
    expect(res.status).toBe(401);
  });
});

describe('password reset', () => {
  test('full flow: forgot → email link → reset → log in with new password', async () => {
    await registerAndVerify(alice);

    await request(app).post('/api/auth/forgot-password').send({ email: alice.email }).expect(200);
    const link = lastLinkSentTo(alice.email);
    expect(link).toMatch(/^http:\/\/app\.test\/reset-password\//);
    const token = link.split('/').pop();

    await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: 'brandnewpass' })
      .expect(200);

    await request(app)
      .post('/api/auth/login')
      .send({ email: alice.email, password: alice.password })
      .expect(401);                                                // old password dead
    await request(app)
      .post('/api/auth/login')
      .send({ email: alice.email, password: 'brandnewpass' })
      .expect(200);                                                // new one works
  });

  test('unknown email gets the same reply and no email is sent', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@test.com' });
    expect(res.status).toBe(200);
    expect(mailer.sentMail).toHaveLength(0);
  });

  test('expired reset token is rejected', async () => {
    await registerAndVerify(alice);
    await request(app).post('/api/auth/forgot-password').send({ email: alice.email });
    const token = lastLinkSentTo(alice.email).split('/').pop();
    await User.updateOne({ email: alice.email }, { resetTokenExpires: Date.now() - 1000 });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: 'brandnewpass' });
    expect(res.status).toBe(400);
  });

  test('reset token is single-use', async () => {
    await registerAndVerify(alice);
    await request(app).post('/api/auth/forgot-password').send({ email: alice.email });
    const token = lastLinkSentTo(alice.email).split('/').pop();
    await request(app).post('/api/auth/reset-password').send({ token, password: 'brandnewpass' }).expect(200);

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: 'anotherpass1' });
    expect(res.status).toBe(400);
  });
});
