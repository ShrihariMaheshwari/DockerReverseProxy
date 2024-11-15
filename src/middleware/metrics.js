const monitoring = require('../services/monitoring');

const metricsMiddleware = (req, res, next) => {
  // Track request start time
  const start = Date.now();

  // Add response tracker
  res.on('finish', () => {
    const duration = Date.now() - start;
    const service = req.headers.host ? req.headers.host.split('.')[0] : 'unknown';

    // Observe request duration
    monitoring.metrics.httpRequestDuration.observe(
      {
        method: req.method,
        route: req.path,
        service: service
      },
      duration / 1000
    );

    // Update service status if it's a health check
    if (req.path === '/health') {
      monitoring.metrics.serviceHealthStatus.set(
        {
          service_name: service,
          service_url: `${req.protocol}://${req.headers.host}`
        },
        res.statusCode === 200 ? 1 : 0
      );
    }
  });

  // Pass request to next middleware
  next();
};

module.exports = metricsMiddleware;