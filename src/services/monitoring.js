const client = require('prom-client');
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'service', 'status_code']
});

const serviceHealthStatus = new client.Gauge({
  name: 'service_health_status',
  help: 'Health status of services (1 for healthy, 0 for unhealthy)',
  labelNames: ['service_name', 'service_url', 'domain']
});

const activeServices = new client.Gauge({
  name: 'active_services_total',
  help: 'Total number of active services',
});

const serviceResponseTime = new client.Histogram({
  name: 'service_response_time_seconds',
  help: 'Response time of services in seconds',
  labelNames: ['service_name', 'domain']
});

const proxyErrors = new client.Counter({
  name: 'proxy_errors_total',
  help: 'Total number of proxy errors',
  labelNames: ['service_name', 'error_type']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(serviceHealthStatus);
register.registerMetric(activeServices);
register.registerMetric(serviceResponseTime);
register.registerMetric(proxyErrors);

module.exports = {
  register,
  metrics: {
    httpRequestDuration,
    serviceHealthStatus,
    activeServices,
    serviceResponseTime,
    proxyErrors
  }
};