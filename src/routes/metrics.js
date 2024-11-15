const express = require('express');
const router = express.Router();
const monitoring = require('../services/monitoring');
const serviceRegistry = require('../services/discovery');

// Prometheus metrics endpoint
router.get('/metrics', async (req, res) => {
  res.set('Content-Type', monitoring.register.contentType);
  try {
    const metrics = await monitoring.register.metrics();
    res.send(metrics);
  } catch (err) {
    console.error('Error collecting metrics:', err);
    monitoring.metrics.proxyErrors.inc({
      service_name: 'metrics',
      error_type: 'metrics_collection_error'
    });
    res.status(500).send('Error collecting metrics');
  }
});

// Enhanced service metrics endpoint
router.get('/metrics/services', (req, res) => {
  const stats = serviceRegistry.getStatistics();
  const services = Array.from(serviceRegistry.services.values());
  
  const metrics = {
    timestamp: new Date().toISOString(),
    total_services: stats.total,
    healthy_services: stats.healthy,
    unhealthy_services: stats.unhealthy,
    services: services.map(s => ({
      name: s.name,
      domain: s.domain,
      url: s.url,
      status: s.status,
      last_check: s.lastCheck,
      metrics: {
        total_requests: s.metrics.totalRequests,
        error_count: s.metrics.errorCount,
        last_response_time: s.metrics.lastResponseTime,
      }
    }))
  };
  
  res.json(metrics);
});

// Detailed health metrics endpoint
router.get('/metrics/health', (req, res) => {
  const services = Array.from(serviceRegistry.services.values());
  const healthMetrics = services.reduce((acc, service) => {
    acc[service.domain] = {
      name: service.name,
      status: service.status,
      last_check: service.lastCheck,
      url: service.url,
      metrics: {
        response_time: service.metrics.lastResponseTime,
        error_rate: service.metrics.totalRequests > 0 
          ? (service.metrics.errorCount / service.metrics.totalRequests) * 100 
          : 0
      }
    };
    return acc;
  }, {});
  
  res.json({
    timestamp: new Date().toISOString(),
    proxy_health: 'healthy',
    total_services: services.length,
    services: healthMetrics
  });
});

module.exports = router;