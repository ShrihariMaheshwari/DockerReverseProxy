const request = require('supertest');
const app = require('../src/server');

describe('Reverse Proxy Tests', () => {
  test('Health check endpoint returns 200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
  });

  test('Unknown host returns 404', async () => {
    const response = await request(app)
      .get('/')
      .set('Host', 'unknown.localhost');
    expect(response.status).toBe(404);
  });

  test('Valid host is proxied correctly', async () => {
    const response = await request(app)
      .get('/')
      .set('Host', 'service1.localhost');
    expect(response.status).toBe(200);
  });
});