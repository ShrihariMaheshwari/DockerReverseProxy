const client = require('prom-client');

// Create a Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'service']
});

const serviceHealthStatus = new client.Gauge({
  name: 'service_health_status',
  help: 'Health status of services (1 for healthy, 0 for unhealthy)',
  labelNames: ['service_name', 'service_url']
});

const activeServices = new client.Gauge({
  name: 'active_services_total',
  help: 'Total number of active services',
  labelNames: ['service_name']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(serviceHealthStatus);
register.registerMetric(activeServices);

module.exports = {
  register,
  metrics: {
    httpRequestDuration,
    serviceHealthStatus,
    activeServices
  }
};