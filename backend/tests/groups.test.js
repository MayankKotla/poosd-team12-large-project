// tests/groups.test.js
// Covers JWT protection on routes, group creation, and the "no duplicate members" rule.

const { describe, test, beforeEach } = require('node:test');
const { app, request, expect, createLoggedInUser } = require('./helpers');

describe('JWT protection', () => {
  test('protected routes reject requests with no token', async () => {
    await request(app).get('/api/groups').expect(401);
    await request(app).get('/api/shifts/mine').expect(401);
    await request(app).get('/api/users').expect(401);
  });

  test('protected routes reject a forged token', async () => {
    const res = await request(app)
      .get('/api/groups')
      .set('Authorization', 'Bearer not.a.realtoken');
    expect(res.status).toBe(401);
  });

  test('GET /api/users never leaks password hashes or tokens', async () => {
    const { auth } = await createLoggedInUser({ email: 'boss@test.com' });
    const res = await request(app).get('/api/users').set('Authorization', auth).expect(200);
    for (const u of res.body) {
      expect(u.passwordHash).toBeUndefined();
      expect(u.verifyToken).toBeUndefined();
      expect(u.resetToken).toBeUndefined();
    }
  });
});

describe('groups', () => {
  let boss, worker;

  beforeEach(async () => {
    boss = await createLoggedInUser({ firstName: 'Bea', email: 'boss@test.com' });
    worker = await createLoggedInUser({ firstName: 'Will', email: 'worker@test.com' });
  });

  test('creator becomes owner and admin', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', boss.auth)
      .send({ groupName: 'Cafe Crew' });

    expect(res.status).toBe(201);
    expect(String(res.body.owner)).toBe(String(boss.user.id));
    expect(res.body.members).toHaveLength(1);
    expect(res.body.members[0].role).toBe('admin');
  });

  test('groupName is required', async () => {
    await request(app).post('/api/groups').set('Authorization', boss.auth).send({}).expect(400);
  });

  test('users only see groups they belong to', async () => {
    await request(app).post('/api/groups').set('Authorization', boss.auth).send({ groupName: 'Cafe Crew' });
    const res = await request(app).get('/api/groups').set('Authorization', worker.auth).expect(200);
    expect(res.body).toHaveLength(0);
  });

  test('admin can add a member by email; duplicates are blocked', async () => {
    const group = (await request(app)
      .post('/api/groups').set('Authorization', boss.auth).send({ groupName: 'Cafe Crew' })).body;

    await request(app)
      .post(`/api/groups/${group._id}/members`)
      .set('Authorization', boss.auth)
      .send({ email: 'worker@test.com' })
      .expect(200);

    const dup = await request(app)
      .post(`/api/groups/${group._id}/members`)
      .set('Authorization', boss.auth)
      .send({ email: 'worker@test.com' });
    expect(dup.status).toBe(409);

    const mine = await request(app).get('/api/groups').set('Authorization', worker.auth);
    expect(mine.body).toHaveLength(1);
    expect(mine.body[0].members).toHaveLength(2);                // boss + worker, once each
  });

  test('a regular member cannot add people', async () => {
    const group = (await request(app)
      .post('/api/groups').set('Authorization', boss.auth).send({ groupName: 'Cafe Crew' })).body;
    await request(app).post(`/api/groups/${group._id}/members`)
      .set('Authorization', boss.auth).send({ email: 'worker@test.com' });
    await createLoggedInUser({ email: 'third@test.com' });

    const res = await request(app)
      .post(`/api/groups/${group._id}/members`)
      .set('Authorization', worker.auth)
      .send({ email: 'third@test.com' });
    expect(res.status).toBe(409);
  });

  test('adding an email with no account returns 404', async () => {
    const group = (await request(app)
      .post('/api/groups').set('Authorization', boss.auth).send({ groupName: 'Cafe Crew' })).body;
    await request(app)
      .post(`/api/groups/${group._id}/members`)
      .set('Authorization', boss.auth)
      .send({ email: 'ghost@test.com' })
      .expect(404);
  });
});
