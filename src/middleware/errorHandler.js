const monitoring = require('../services/monitoring');

const errorHandler = (err, req, res, next) => {
  const service = req.headers.host ? req.headers.host.split('.')[0] : 'unknown';
  
  // Increment error counter in metrics
  monitoring.metrics.proxyErrors.inc({
    service_name: service,
    error_type: 'internal_error'
  });

  console.error('Server Error:', {
    error: err.message,
    stack: err.stack,
    service,
    path: req.path
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

module.exports = errorHandler;