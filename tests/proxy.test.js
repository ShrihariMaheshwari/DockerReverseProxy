const express = require('express');
const request = require('supertest');
const app = require('../src/server');
const serviceRegistry = require('../src/services/discovery');

// Create mock services
const mockService1 = express();
let mockServer;

// Setup mock service responses
mockService1.get('/', (req, res) => {
  res.json({ 
    service: 'Mock Service 1',
    time: new Date().toISOString(),
    port: 3001
  });
});

mockService1.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

mockService1.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send('# Mock metrics');
});

describe('Reverse Proxy Tests', () => {
  // Start mock service before tests
  beforeAll((done) => {
    mockServer = mockService1.listen(3001, () => {
      console.log('Mock service running on port 3001');
      done();
    });
  });

  // Clean up after tests
  afterAll((done) => {
    serviceRegistry.stopHealthChecks(); // Stop health checks
    serviceRegistry.clearServices();    // Clear all services
    
    mockServer.close(() => {
      if (app.server) {
        app.server.close(() => {
          done();
        });
      } else {
        done();
      }
    });
  });

  test('Health check endpoint returns 200', async () => {
    const response = await request(app)
      .get('/health');
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

  test('Metrics endpoint returns prometheus metrics', async () => {
    const response = await request(app)
      .get('/metrics');
    expect(response.status).toBe(200);
    expect(response.type).toMatch(/text\/plain/);
  });

  test('Service metrics endpoint returns service metrics', async () => {
    const response = await request(app)
      .get('/metrics/services');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('total_services');
    expect(response.body).toHaveProperty('services');
  });
});