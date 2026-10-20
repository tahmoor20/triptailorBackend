const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createTestApp } = require('./helpers/createTestApp');

const newUser = {
  fullName: 'Qamar Uddin',
  email: 'Qamar@Example.com',
  phoneNumber: '07123456789',
  password: 'secret123',
};

describe('POST /api/signup', () => {
  it('creates an account and returns a token', async () => {
    const { app, db, config } = createTestApp();

    const res = await request(app).post('/api/signup').send(newUser);

    expect(res.status).toBe(201);
    expect(res.body.fullName).toBe('Qamar Uddin');

    const saved = await db.collection('users').findOne({ email: 'qamar@example.com' });
    expect(jwt.verify(res.body.token, config.jwtSecret).sub).toBe(String(saved._id));
  });

  it('never stores the plain-text password', async () => {
    const { app, db } = createTestApp();

    await request(app).post('/api/signup').send(newUser);

    const saved = await db.collection('users').findOne({ email: 'qamar@example.com' });
    expect(saved.password).toBeUndefined();
    expect(saved.passwordHash).toBeDefined();
    expect(saved.passwordHash).not.toBe(newUser.password);
  });

  it('rejects a duplicate email with 409', async () => {
    const { app } = createTestApp();
    await request(app).post('/api/signup').send(newUser);

    const res = await request(app)
      .post('/api/signup')
      .send({ ...newUser, email: 'qamar@example.com' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('An account with this email already exists');
  });

  it.each([
    [{ fullName: '' }, 'Full name is required'],
    [{ email: 'nope' }, 'A valid email address is required'],
    [{ phoneNumber: '07abc' }, 'Phone number should contain only numbers'],
    [{ password: '123' }, 'Password must be at least 6 characters'],
  ])('rejects invalid input %j', async (patch, message) => {
    const { app } = createTestApp();

    const res = await request(app)
      .post('/api/signup')
      .send({ ...newUser, ...patch });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(message);
  });
});

describe('POST /api/signin', () => {
  async function appWithUser() {
    const ctx = createTestApp();
    await request(ctx.app).post('/api/signup').send(newUser);
    return ctx;
  }

  it('returns a token and the full name for valid credentials', async () => {
    const { app } = await appWithUser();

    const res = await request(app)
      .post('/api/signin')
      .send({ email: 'qamar@example.com', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe('Qamar Uddin');
    expect(typeof res.body.token).toBe('string');
  });

  it('treats the email as case-insensitive', async () => {
    const { app } = await appWithUser();

    const res = await request(app)
      .post('/api/signin')
      .send({ email: 'QAMAR@EXAMPLE.COM', password: 'secret123' });

    expect(res.status).toBe(200);
  });

  it('gives the same 401 for a wrong password and an unknown email', async () => {
    const { app } = await appWithUser();

    const wrongPassword = await request(app)
      .post('/api/signin')
      .send({ email: 'qamar@example.com', password: 'wrong-password' });
    const unknownEmail = await request(app)
      .post('/api/signin')
      .send({ email: 'nobody@example.com', password: 'secret123' });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.message).toBe('Invalid email or password');
    expect(unknownEmail.body.message).toBe('Invalid email or password');
  });

  it('requires both email and password', async () => {
    const { app } = createTestApp();

    const res = await request(app).post('/api/signin').send({ email: 'a@b.com' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });
});
