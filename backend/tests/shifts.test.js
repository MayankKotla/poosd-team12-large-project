// tests/shifts.test.js
// Covers shift assignment, the rubric's "server-side search (partial match)",
// and the release → claim flow, including the race between two claimers.

const { describe, test, beforeEach } = require('node:test');
const { app, request, expect, createLoggedInUser } = require('./helpers');

let boss, worker, outsider, group;

// One group (boss = admin, worker = member) plus an outsider in no group.
beforeEach(async () => {
  boss = await createLoggedInUser({ firstName: 'Bea', email: 'boss@test.com' });
  worker = await createLoggedInUser({ firstName: 'Will', email: 'worker@test.com' });
  outsider = await createLoggedInUser({ firstName: 'Olly', email: 'out@test.com' });

  group = (await request(app)
    .post('/api/groups').set('Authorization', boss.auth).send({ groupName: 'Cafe Crew' })).body;
  await request(app).post(`/api/groups/${group._id}/members`)
    .set('Authorization', boss.auth).send({ email: 'worker@test.com' }).expect(200);
});

const assign = (userId, extra = {}) =>
  request(app).post('/api/shifts').set('Authorization', boss.auth).send({
    groupId: group._id, userId,
    dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', title: 'Morning Barista',
    ...extra,
  });

describe('assigning shifts', () => {
  test('admin assigns a shift; it shows up in the worker\'s schedule', async () => {
    await assign(worker.user.id).expect(201);

    const res = await request(app).get('/api/shifts/mine').set('Authorization', worker.auth).expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Morning Barista');
    expect(res.body[0].group.groupName).toBe('Cafe Crew');
  });

  test('non-admins cannot assign shifts', async () => {
    const res = await request(app).post('/api/shifts').set('Authorization', worker.auth).send({
      groupId: group._id, userId: worker.user.id,
      dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00',
    });
    expect(res.status).toBe(403);
  });

  test('cannot assign to someone outside the group', async () => {
    await assign(outsider.user.id).expect(403);
  });
});

describe('GET /api/shifts/search (partial match)', () => {
  beforeEach(async () => {
    await assign(worker.user.id, { title: 'Morning Barista', dayOfWeek: 'Monday' }).expect(201);
    await assign(worker.user.id, { title: 'Evening Closer', dayOfWeek: 'Friday' }).expect(201);
    await assign(boss.user.id, { title: 'Barista Training', dayOfWeek: 'Friday' }).expect(201);
  });

  const search = (who, query) =>
    request(app).get('/api/shifts/search').query(query).set('Authorization', who.auth);

  test('partial text matches anywhere in the title', async () => {
    const res = await search(worker, { q: 'rist' }).expect(200);
    expect(res.body.map((s) => s.title).sort()).toEqual(['Barista Training', 'Morning Barista']);
  });

  test('matching is case-insensitive', async () => {
    const res = await search(worker, { q: 'BARISTA' }).expect(200);
    expect(res.body).toHaveLength(2);
  });

  test('can filter by day together with text', async () => {
    const res = await search(worker, { q: 'bar', day: 'Friday' }).expect(200);
    expect(res.body.map((s) => s.title)).toEqual(['Barista Training']);
  });

  test('empty query returns every shift in my groups', async () => {
    const res = await search(worker, {}).expect(200);
    expect(res.body).toHaveLength(3);
  });

  test('results include the worker\'s name, not just an ID', async () => {
    const res = await search(worker, { q: 'closer' }).expect(200);
    expect(res.body[0].user.firstName).toBe('Will');
  });

  test('users outside the group see nothing', async () => {
    const res = await search(outsider, { q: 'barista' }).expect(200);
    expect(res.body).toHaveLength(0);
  });

  test('regex characters are treated as plain text, not code', async () => {
    const res = await search(worker, { q: '.*' }).expect(200);
    expect(res.body).toHaveLength(0);
  });
});

describe('release and claim', () => {
  let shift, coworker;

  beforeEach(async () => {
    coworker = await createLoggedInUser({ firstName: 'Cara', email: 'cara@test.com' });
    await request(app).post(`/api/groups/${group._id}/members`)
      .set('Authorization', boss.auth).send({ email: 'cara@test.com' }).expect(200);
    shift = (await assign(worker.user.id)).body;
  });

  test('worker releases a shift and a coworker claims it', async () => {
    await request(app).post(`/api/shifts/${shift._id}/release`)
      .set('Authorization', worker.auth).expect(200);

    const open = await request(app).get('/api/shifts/open').set('Authorization', coworker.auth);
    expect(open.body).toHaveLength(1);

    const claim = await request(app).post(`/api/shifts/${shift._id}/claim`)
      .set('Authorization', coworker.auth).expect(200);
    expect(String(claim.body.user)).toBe(String(coworker.user.id));
    expect(claim.body.status).toBe('assigned');
  });

  test('cannot release someone else\'s shift', async () => {
    await request(app).post(`/api/shifts/${shift._id}/release`)
      .set('Authorization', coworker.auth).expect(404);
  });

  test('cannot claim a shift that was never released', async () => {
    await request(app).post(`/api/shifts/${shift._id}/claim`)
      .set('Authorization', coworker.auth).expect(409);
  });

  test('outsiders cannot claim', async () => {
    await request(app).post(`/api/shifts/${shift._id}/release`).set('Authorization', worker.auth);
    await request(app).post(`/api/shifts/${shift._id}/claim`)
      .set('Authorization', outsider.auth).expect(403);
  });

  test('two people claiming at once: exactly one wins', async () => {
    const third = await createLoggedInUser({ email: 'dan@test.com' });
    await request(app).post(`/api/groups/${group._id}/members`)
      .set('Authorization', boss.auth).send({ email: 'dan@test.com' });
    await request(app).post(`/api/shifts/${shift._id}/release`).set('Authorization', worker.auth);

    const [a, b] = await Promise.all([
      request(app).post(`/api/shifts/${shift._id}/claim`).set('Authorization', coworker.auth),
      request(app).post(`/api/shifts/${shift._id}/claim`).set('Authorization', third.auth),
    ]);
    expect([a.status, b.status].sort()).toEqual([200, 409]);
  });
});
