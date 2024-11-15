const request = require('supertest');
const express = require('express');
const app = require('../src/server');

// Mock service setup
const mockService = express();
const mockServicePort = 3001;
let mockServer;

// Setup mock service
mockService.get('/', (req, res) => {
  res.json({ service: 'Mock Service 1' });
});

describe('Reverse Proxy Tests', () => {
  // Start mock service before tests
  beforeAll((done) => {
    mockServer = mockService.listen(mockServicePort, done);
  });

  // Close mock service after tests
  afterAll((done) => {
    mockServer.close(done);
    if (app.server) {
      app.server.close();
    }
  });

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
    expect(response.body).toHaveProperty('service', 'Mock Service 1');
  });
});