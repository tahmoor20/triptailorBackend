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
