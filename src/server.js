const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('./config/services');
const errorHandler = require('./middleware/errorHandler');
const loggingMiddleware = require('./middleware/logging');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Apply logging middleware
app.use(loggingMiddleware);

// Apply health check routes
app.use(healthRoutes);

// Proxy middleware configuration
app.use((req, res, next) => {
  const host = req.headers.host;
  const targetUrl = services[host];

  if (!targetUrl) {
    return res.status(404).json({
      error: 'Service not found',
      message: `No service configured for host: ${host}`
    });
  }

  const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      '^/': '/'
    },
    onError: (err, req, res) => {
      console.error('Proxy Error:', err);
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'The proxy server received an invalid response from the upstream server'
      });
    }
  });

  return proxy(req, res, next);
});

// Error handling middleware
app.use(errorHandler);

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.server = app.listen(PORT, () => {
    console.log(`Reverse proxy running on port ${PORT}`);
    console.log('Configured services:', Object.keys(services).join(', '));
  });
}

module.exports = app;