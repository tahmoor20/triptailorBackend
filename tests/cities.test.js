const request = require('supertest');
const { createTestApp } = require('./helpers/createTestApp');

describe('GET /', () => {
  it('reports that the server is running', async () => {
    const { app } = createTestApp();

    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.text).toBe('Trip Tailor Backend is running!');
  });
});

describe('GET /api/cities', () => {
  it('returns every stored city', async () => {
    const { app, db } = createTestApp();
    await db.collection('cities').insertOne({ name: 'Paris', imageUrl: 'p.jpg' });
    await db.collection('cities').insertOne({ name: 'Hong Kong', imageUrl: 'h.jpg' });

    const res = await request(app).get('/api/cities');

    expect(res.status).toBe(200);
    expect(res.body.map((city) => city.name)).toEqual(['Paris', 'Hong Kong']);
  });

  it('returns an empty list when there are no cities', async () => {
    const { app } = createTestApp();

    const res = await request(app).get('/api/cities');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /api/cities', () => {
  async function signedInToken(app) {
    const res = await request(app).post('/api/signup').send({
      fullName: 'Qamar Uddin',
      email: 'qamar@example.com',
      phoneNumber: '07123456789',
      password: 'secret123',
    });
    return res.body.token;
  }

  it('requires authentication', async () => {
    const { app } = createTestApp();

    const res = await request(app).post('/api/cities').send({ name: 'Rome', imageUrl: 'r.jpg' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Authentication required');
  });

  it('rejects an invalid token', async () => {
    const { app } = createTestApp();

    const res = await request(app)
      .post('/api/cities')
      .set('Authorization', 'Bearer not-a-real-token')
      .send({ name: 'Rome', imageUrl: 'r.jpg' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('creates a city for a signed-in user', async () => {
    const { app, db } = createTestApp();
    const token = await signedInToken(app);

    const res = await request(app)
      .post('/api/cities')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: ' Rome ', imageUrl: 'r.jpg', description: 'Eternal city' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Rome', imageUrl: 'r.jpg', plan: [] });
    expect(await db.collection('cities').find({}).toArray()).toHaveLength(1);
  });

  it('validates the required fields', async () => {
    const { app } = createTestApp();
    const token = await signedInToken(app);

    const res = await request(app)
      .post('/api/cities')
      .set('Authorization', `Bearer ${token}`)
      .send({ imageUrl: 'r.jpg' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('City name is required');
  });
});

describe('GET /api/formcities/random', () => {
  it('returns a limited set of cities with only the form fields', async () => {
    const { app, db } = createTestApp();
    for (let i = 1; i <= 8; i += 1) {
      await db.collection('cities').insertOne({
        name: `City ${i}`,
        imageUrl: `c${i}.jpg`,
        description: `About city ${i}`,
        plan: [{ day: 1, activities: [] }],
      });
    }

    const res = await request(app).get('/api/formcities/random');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(6);
    res.body.forEach((city) => {
      expect(Object.keys(city).sort()).toEqual(['_id', 'description', 'imageUrl', 'name']);
    });
  });
});
