const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const monitoring = require('./services/monitoring');
const serviceRegistry = require('./services/discovery');
const errorHandler = require('./middleware/errorHandler');
const loggingMiddleware = require('./middleware/logging');
const metricsMiddleware = require('./middleware/metrics');
const healthRoutes = require('./routes/health');
const metricsRoutes = require('./routes/metrics');

// Import configuration
let servicesConfig;
try {
  const configPath = path.resolve(__dirname, './config/services.js');
  servicesConfig = require(configPath);
  
  if (!servicesConfig || typeof servicesConfig !== 'object') {
    console.error('Invalid services configuration format');
    process.exit(1);
  }

  // Initialize metrics for active services
  monitoring.metrics.activeServices.set(Object.keys(servicesConfig).length);
} catch (error) {
  console.error('Error loading services configuration:', error);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services from config
const initializeServices = () => {
  try {
    Object.entries(servicesConfig).forEach(([domain, target]) => {
      serviceRegistry.registerService(domain, target);
      console.log(`Registered service: ${domain} -> ${target}`);
    });
  } catch (error) {
    console.error('Error initializing services:', error);
    process.exit(1);
  }
};

// Apply middleware
app.use(express.json());
app.use(loggingMiddleware);
app.use(metricsMiddleware);

// Serve static files for admin dashboard
app.use('/admin', (req, res, next) => {
  // Remove /admin from the path when serving static files
  req.url = req.url.replace(/^\/admin/, '');
  express.static(path.join(__dirname, '../public'))(req, res, next);
});

// Mount routes
app.use('/', healthRoutes);
app.use('/', metricsRoutes);

// Service registration endpoint
app.post('/services/register', (req, res) => {
  const { domain, target } = req.body;

  if (!domain || !target) {
    return res.status(400).json({
      error: 'Invalid request',
      message: 'Domain and target URL are required'
    });
  }

  try {
    const serviceId = serviceRegistry.registerService(domain, target);
    
    // Update services config
    servicesConfig[domain] = target;
    
    // Update active services metric
    monitoring.metrics.activeServices.set(Object.keys(servicesConfig).length);
    
    res.json({
      message: 'Service registered successfully',
      serviceId,
      service: {
        domain,
        target
      }
    });
  } catch (error) {
    console.error('Error registering service:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// Fallback route for admin SPA
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Get services endpoint
app.get('/services', (req, res) => {
  try {
    const services = Array.from(serviceRegistry.services.values()).map(service => ({
      name: service.name,
      domain: service.domain,
      url: service.url,
      status: service.status,
      lastCheck: service.lastCheck,
      metrics: service.metrics
    }));

    res.json({
      total: services.length,
      services
    });
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({
      error: 'Failed to retrieve services',
      message: error.message
    });
  }
});

// Deregister service endpoint
app.delete('/services/:domain', (req, res) => {
  const { domain } = req.params;

  try {
    const service = serviceRegistry.getService(domain);
    if (!service) {
      return res.status(404).json({
        error: 'Service not found',
        message: `No service found for domain: ${domain}`
      });
    }

    serviceRegistry.removeService(domain);
    delete servicesConfig[domain];

    // Update active services metric
    monitoring.metrics.activeServices.set(Object.keys(servicesConfig).length);

    res.json({
      message: 'Service deregistered successfully',
      domain
    });
  } catch (error) {
    console.error('Error deregistering service:', error);
    res.status(500).json({
      error: 'Deregistration failed',
      message: error.message
    });
  }
});

// CORS middleware for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Host');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Proxy middleware configuration
app.use((req, res, next) => {
  const startTime = Date.now();
  const host = req.headers.host;

  // Skip proxy for admin and metrics routes
  if (req.path.startsWith('/admin') || 
      req.path.startsWith('/metrics') || 
      req.path.startsWith('/services')) {
    return next();
  }

  const service = serviceRegistry.getService(host);
  if (!service) {
    monitoring.metrics.proxyErrors.inc({
      service_name: 'unknown',
      error_type: 'service_not_found'
    });
    return res.status(404).json({
      error: 'Service not found',
      message: `No service configured for host: ${host}`,
      availableServices: Object.keys(servicesConfig)
    });
  }

  // Check service health before proxying
  if (service.status === 'unhealthy') {
    console.warn(`Warning: Proxying request to unhealthy service ${host}`, {
      domain: host,
      target: service.url,
      status: service.status,
      lastCheck: service.lastCheck
    });
    monitoring.metrics.proxyErrors.inc({
      service_name: service.name,
      error_type: 'unhealthy_service'
    });
  }

  const proxy = createProxyMiddleware({
    target: service.url,
    changeOrigin: true,
    ws: true,
    secure: false,
    headers: {
      'Accept': 'application/json'
    },
    pathRewrite: {
      '^/api': '/'
    },
    onProxyReq: (proxyReq, req, res) => {
      // Set additional headers for the proxied request
      proxyReq.setHeader('x-forwarded-proto', 'http');
      proxyReq.setHeader('x-forwarded-host', req.headers.host);
      proxyReq.setHeader('x-forwarded-for', req.ip);
      proxyReq.setHeader('x-proxy-timestamp', new Date().toISOString());
      
      // Log proxy request for debugging
      console.log(`Proxying request to ${service.url}`, {
        host: req.headers.host,
        path: req.path,
        method: req.method,
        serviceStatus: service.status,
        timestamp: new Date().toISOString()
      });
    },
    onProxyRes: (proxyRes, req, res) => {
      const duration = Date.now() - startTime;
      
      // Add custom response headers
      proxyRes.headers['x-proxy-response-time'] = duration;
      proxyRes.headers['x-proxied-by'] = 'reverse-proxy';
      
      // Update service metrics
      serviceRegistry.updateServiceMetrics(host, duration);

      // Update response time histogram
      monitoring.metrics.serviceResponseTime.observe(
        {
          service_name: service.name,
          domain: host
        },
        duration / 1000
      );

      // Update request duration histogram
      monitoring.metrics.httpRequestDuration.observe(
        {
          method: req.method,
          route: req.path,
          service: service.name,
          status_code: proxyRes.statusCode
        },
        duration / 1000
      );
    },
    onError: (err, req, res) => {
      const duration = Date.now() - startTime;
      
      console.error('Proxy Error:', {
        host: req.headers.host,
        target: service.url,
        error: err.message,
        timestamp: new Date().toISOString()
      });
      
      // Update error metrics
      monitoring.metrics.proxyErrors.inc({
        service_name: service.name,
        error_type: 'proxy_error'
      });
      
      // Update service metrics with error
      serviceRegistry.updateServiceMetrics(host, duration, true);
      
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Failed to reach the service',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        timestamp: new Date().toISOString()
      });
    }
  });

  return proxy(req, res, next);
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Cleaning up...');
  
  const shutdownPromise = new Promise((resolve) => {
    if (serviceRegistry) {
      serviceRegistry.stopHealthChecks();
    }

    if (monitoring && monitoring.register) {
      try {
        monitoring.register.clear();
      } catch (error) {
        console.error('Error clearing metrics:', error);
      }
    }

    if (app.server) {
      // Close server and reject new connections
      app.server.close(() => {
        console.log('HTTP server closed');
        resolve();
      });

      // Handle existing connections
      const sockets = new Set();
      
      app.server.on('connection', (socket) => {
        sockets.add(socket);
        socket.on('close', () => sockets.delete(socket));
      });

      app.server.on('request', (req, res) => {
        res.setHeader('Connection', 'close');
      });

      // Destroy all sockets on force shutdown
      app.server.on('close', () => {
        for (const socket of sockets) {
          socket.destroy();
          sockets.delete(socket);
        }
      });
    } else {
      resolve();
    }
  });

  // Handle the shutdown with timeout
  Promise.race([
    shutdownPromise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Shutdown timeout')), 10000))
  ]).then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Shutdown error:', error);
    process.exit(1);
  });
};

// Server startup with enhanced error handling
const startServer = () => {
  return new Promise((resolve, reject) => {
    try {
      app.server = app.listen(PORT, () => {
        console.log(`
=================================================
🚀 Reverse Proxy Server Started
-------------------------------------------------
Port: ${PORT}
Environment: ${process.env.NODE_ENV || 'development'}
Node Version: ${process.version}
Process ID: ${process.pid}
=================================================`);
        
        // Initialize services with error handling
        try {
          initializeServices();
          serviceRegistry.startHealthChecks();
          
          console.log('\nRegistered Services:');
          console.log('-------------------------------------------------');
          Array.from(serviceRegistry.services.values()).forEach(service => {
            console.log(`📡 ${service.domain} -> ${service.url}`);
          });
          console.log('=================================================\n');
        } catch (error) {
          console.error('Service initialization error:', error);
        }
        
        resolve();
      });

      // Handle server-specific errors
      app.server.on('error', (error) => {
        console.error('Server error:', error);
        reject(error);
      });

      // Handle connection errors
      app.server.on('clientError', (error, socket) => {
        console.error('Client connection error:', error);
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
      });

    } catch (error) {
      console.error('Failed to start server:', error);
      reject(error);
    }
  });
};

// Process event handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    timestamp: new Date().toISOString()
  });
  gracefulShutdown();
});

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    console.error('Server startup failed:', error);
    process.exit(1);
  });
}

module.exports = app;