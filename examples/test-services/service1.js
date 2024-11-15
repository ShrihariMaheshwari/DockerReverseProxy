const express = require('express');
const client = require('prom-client');
const app = express();
const port = process.env.PORT || 3001;
const serviceName = process.env.SERVICE_NAME || 'service1';

// Create a Registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ 
    register,
    prefix: `${serviceName}_`
});

// Custom metrics
const httpRequestCounter = new client.Counter({
    name: `${serviceName}_http_requests_total`,
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'path', 'status']
});

register.registerMetric(httpRequestCounter);

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Host');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// Add metrics middleware
app.use((req, res, next) => {
    // Add response listener to capture final status code
    res.on('finish', () => {
        httpRequestCounter.inc({ 
            method: req.method, 
            path: req.path,
            status: res.statusCode
        });
    });
    next();
});

// Root endpoint
app.get('/', (req, res) => {
    console.log('Received request at root endpoint', {
        headers: req.headers,
        method: req.method
    });
    
    res.json({
        service: serviceName,
        status: 'ok',
        time: new Date().toISOString(),
        port: port,
        message: 'Service is running properly'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    console.log('Health check request received');
    res.json({ 
        status: 'healthy',
        service: serviceName,
        timestamp: new Date().toISOString()
    });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    console.log('Metrics request received');
    res.set('Content-Type', register.contentType);
    try {
        const metrics = await register.metrics();
        res.send(metrics);
    } catch (err) {
        console.error('Error collecting metrics:', err);
        res.status(500).send('Error collecting metrics');
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`${serviceName} listening at http://0.0.0.0:${port}`);
    console.log(`Service name: ${serviceName}`);
    console.log(`Metrics available at http://0.0.0.0:${port}/metrics`);
    console.log(`Health check at http://0.0.0.0:${port}/health`);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});