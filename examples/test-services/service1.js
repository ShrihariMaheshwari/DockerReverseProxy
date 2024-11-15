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

// Add metrics middleware
app.use((req, res, next) => {
    httpRequestCounter.inc({ 
        method: req.method, 
        path: req.path,
        status: res.statusCode
    });
    next();
});

app.get('/', (req, res) => {
    res.json({
        service: serviceName,
        time: new Date().toISOString(),
        port: port
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        service: serviceName
    });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    try {
        const metrics = await register.metrics();
        res.send(metrics);
    } catch (err) {
        console.error('Error collecting metrics:', err);
        res.status(500).send('Error collecting metrics');
    }
});

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`${serviceName} listening at http://0.0.0.0:${port}`);
});