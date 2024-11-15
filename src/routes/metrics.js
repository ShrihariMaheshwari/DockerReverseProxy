const express = require('express');
const router = express.Router();
const monitoring = require('../services/monitoring');
const serviceRegistry = require('../services/discovery');

// Metrics endpoint
router.get('/metrics', async (req, res) => {
  // Set Prometheus metrics content type
  res.set('Content-Type', monitoring.register.contentType);
  
  try {
    // Collect and return metrics
    const metrics = await monitoring.register.metrics();
    res.send(metrics);
  } catch (err) {
    console.error('Error collecting metrics:', err);
    res.status(500).send('Error collecting metrics');
  }
});

// Service metrics endpoint
router.get('/metrics/services', (req, res) => {
  const services = Array.from(serviceRegistry.services.values());
  const metrics = {
    total_services: services.length,
    healthy_services: services.filter(s => s.status === 'healthy').length,
    services: services.map(s => ({
      name: s.name,
      url: s.url,
      status: s.status,
      last_check: s.lastCheck
    }))
  };
  res.json(metrics);
});

// Health metrics endpoint
router.get('/metrics/health', (req, res) => {
  const services = Array.from(serviceRegistry.services.values());
  const healthMetrics = services.reduce((acc, service) => {
    acc[service.name] = {
      status: service.status,
      last_check: service.lastCheck,
      url: service.url
    };
    return acc;
  }, {});
  
  res.json({
    proxy_health: 'healthy',
    services: healthMetrics
  });
});

module.exports = router;