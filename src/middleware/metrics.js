const monitoring = require('../services/monitoring');

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  const service = req.headers.host ? req.headers.host.split('.')[0] : 'unknown';

  // Add response tracker
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode.toString();
    const route = req.route ? req.route.path : req.path;

    // Observe request duration
    monitoring.metrics.httpRequestDuration.observe(
      {
        method: req.method,
        route: route,
        service: service,
        status_code: statusCode
      },
      duration / 1000
    );

    // Track response time for the service
    monitoring.metrics.serviceResponseTime.observe(
      {
        service_name: service,
        domain: req.headers.host
      },
      duration / 1000
    );

    // Update service status if it's a health check
    if (req.path === '/health') {
      monitoring.metrics.serviceHealthStatus.set(
        {
          service_name: service,
          service_url: `${req.protocol}://${req.headers.host}`,
          domain: req.headers.host
        },
        res.statusCode === 200 ? 1 : 0
      );
    }
  });

  next();
};

module.exports = metricsMiddleware;