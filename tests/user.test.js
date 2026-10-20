const request = require('supertest');
const { createTestApp } = require('./helpers/createTestApp');

async function signUp(app) {
  const res = await request(app).post('/api/signup').send({
    fullName: 'Qamar Uddin',
    email: 'qamar@example.com',
    phoneNumber: '07123456789',
    password: 'secret123',
  });
  return res.body.token;
}

describe('GET /api/user', () => {
  it('requires authentication', async () => {
    const { app } = createTestApp();

    const res = await request(app).get('/api/user');

    expect(res.status).toBe(401);
  });

  it('returns the profile without the password hash', async () => {
    const { app } = createTestApp();
    const token = await signUp(app);

    const res = await request(app).get('/api/user').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      fullName: 'Qamar Uddin',
      email: 'qamar@example.com',
      phoneNumber: '07123456789',
      profileImage: null,
    });
  });
});

describe('PUT /api/user', () => {
  it('updates the name and phone number', async () => {
    const { app } = createTestApp();
    const token = await signUp(app);

    const res = await request(app)
      .put('/api/user')
      .set('Authorization', `Bearer ${token}`)
      .field('fullName', 'Q. Uddin')
      .field('phoneNumber', '07999999999');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ fullName: 'Q. Uddin', phoneNumber: '07999999999' });
  });

  it('stores an uploaded profile image and returns its URL', async () => {
    const { app } = createTestApp();
    const token = await signUp(app);

    const res = await request(app)
      .put('/api/user')
      .set('Authorization', `Bearer ${token}`)
      .attach('profileImage', Buffer.from('fake-image-bytes'), {
        filename: 'me.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(200);
    expect(res.body.profileImage).toMatch(/^http:\/\/localhost:5000\/uploads\/.+\.png$/);

    const file = await request(app).get(new URL(res.body.profileImage).pathname);
    expect(file.status).toBe(200);
  });

  it('rejects files that are not images', async () => {
    const { app } = createTestApp();
    const token = await signUp(app);

    const res = await request(app)
      .put('/api/user')
      .set('Authorization', `Bearer ${token}`)
      .attach('profileImage', Buffer.from('#!/bin/sh'), {
        filename: 'script.sh',
        contentType: 'text/x-shellscript',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Only image files are allowed');
  });

  it('rejects an empty name and a non-numeric phone number', async () => {
    const { app } = createTestApp();
    const token = await signUp(app);

    const emptyName = await request(app)
      .put('/api/user')
      .set('Authorization', `Bearer ${token}`)
      .field('fullName', '  ');
    const badPhone = await request(app)
      .put('/api/user')
      .set('Authorization', `Bearer ${token}`)
      .field('phoneNumber', 'abc');

    expect(emptyName.status).toBe(400);
    expect(badPhone.status).toBe(400);
  });
});
