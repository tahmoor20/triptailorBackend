const request = require('supertest');
const { createTestApp } = require('./helpers/createTestApp');

describe('error handling', () => {
  it('returns a JSON 404 for unknown routes', async () => {
    const { app } = createTestApp();

    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Route not found: GET /api/does-not-exist');
  });

  it('returns 400 for malformed JSON', async () => {
    const { app } = createTestApp();

    const res = await request(app)
      .post('/api/cities')
      .set('Content-Type', 'application/json')
      .send('{ not json');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid JSON body');
  });

  it('hides internal error details with a 500', async () => {
    const { app, db } = createTestApp();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    db.collection = () => ({
      find: () => ({
        toArray: async () => {
          throw new Error('database exploded');
        },
      }),
    });

    const res = await request(app).get('/api/cities');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Internal server error' });
    console.error.mockRestore();
  });
});
