const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const serviceRegistry = require('./services/discovery');
const monitoring = require('./services/monitoring');
const errorHandler = require('./middleware/errorHandler');
const loggingMiddleware = require('./middleware/logging');
const metricsMiddleware = require('./middleware/metrics');

const app = express();
const PORT = process.env.PORT || 3000;

// Apply middleware
app.use(express.json());
app.use(loggingMiddleware);
app.use(metricsMiddleware);

// Auto-register services on startup
const initializeServices = () => {
  const defaultServices = [
    { name: 'service1', host: 'service1', port: '3001' },
    { name: 'service2', host: 'service2', port: '3002' },
    { name: 'service3', host: 'service3', port: '3003' }
  ];

  defaultServices.forEach(service => {
    serviceRegistry.registerService(service.name, service.host, service.port);
    console.log(`Registered service: ${service.name} at ${service.host}:${service.port}`);
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Metrics endpoints - Place these BEFORE the proxy middleware
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', monitoring.register.contentType);
  try {
    const metrics = await monitoring.register.metrics();
    res.send(metrics);
  } catch (err) {
    console.error('Error collecting metrics:', err);
    res.status(500).send('Error collecting metrics');
  }
});

app.get('/metrics/services', (req, res) => {
  const services = Array.from(serviceRegistry.services.values());
  res.json({
    total_services: services.length,
    healthy_services: services.filter(s => s.status === 'healthy').length,
    services: services
  });
});

app.get('/metrics/health', (req, res) => {
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

// Service registration endpoint
app.post('/services/register', (req, res) => {
  const { name, host, port } = req.body;
  const serviceId = serviceRegistry.registerService(name, host, port);
  res.json({ serviceId, message: 'Service registered successfully' });
});

// Get services endpoint
app.get('/services', (req, res) => {
  const services = Array.from(serviceRegistry.services.values());
  res.json({ services });
});

// Proxy middleware configuration - Move this AFTER the metrics endpoints
app.use((req, res, next) => {
  const host = req.headers.host;
  const serviceName = host.split('.')[0];

  // Skip proxy for direct localhost requests to known endpoints
  if (host === 'localhost:3000' || host === 'localhost') {
    return next();
  }

  const services = serviceRegistry.getService(serviceName);

  if (!services || services.length === 0) {
    return res.status(404).json({
      error: 'Service not found',
      message: `No healthy service found for: ${serviceName}`
    });
  }

  // Simple round-robin selection
  const service = services[Math.floor(Math.random() * services.length)];

  const proxy = createProxyMiddleware({
    target: service.url,
    changeOrigin: true,
    pathRewrite: {
      '^/': '/'
    },
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader('x-forwarded-by', 'node-reverse-proxy');
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

// Initialize services and start server
app.listen(PORT, () => {
  console.log(`Reverse proxy running on port ${PORT}`);
  initializeServices(); // Auto-register services
});

module.exports = app;