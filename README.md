# Node.js Reverse Proxy Documentation

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/node-reverse-proxy.git

# Install dependencies
npm install

# Start the services
docker-compose up --build
```

### Basic Usage

1. Access the UI Dashboard:
```
http://localhost:3000/admin
```

2. Register a new service:
```bash
curl -X POST http://localhost:3000/services/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "myservice",
    "host": "myservice",
    "port": "3001"
  }'
```

3. Access a service:
```bash
curl -H "Host: myservice.localhost" http://localhost:3000
```

## Features

### 1. Service Discovery
- Automatic service registration
- Health monitoring
- Dynamic service updates

### 2. Load Balancing
- Round-robin load balancing
- Multiple service instances
- Automatic failover

### 3. Monitoring
- Prometheus metrics integration
- Service health monitoring
- Performance metrics

### 4. Management UI
- Service status dashboard
- Service configuration
- Real-time monitoring

## Configuration

### Environment Variables
```env
PORT=3000                 # Proxy port
NODE_ENV=production      # Environment
```

### Service Configuration
```javascript
// src/config/services.js
module.exports = {
  'service1.localhost': 'http://service1:3001',
  'service2.localhost': 'http://service2:3002'
};
```

## API Reference

### Service Management

#### Register Service
```http
POST /services/register
Content-Type: application/json

{
  "name": "service1",
  "host": "service1",
  "port": "3001"
}
```

#### Get Services
```http
GET /services
```

### Monitoring

#### Health Check
```http
GET /health
```

#### Metrics
```http
GET /metrics
```

## Docker Deployment

### Basic Deployment
```bash
docker-compose up --build
```

### Scaling Services
```bash
docker-compose up --scale service1=3
```

## Examples

### 1. Basic Service Setup

```javascript
// example-service.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3001);
```

### 2. Load Balanced Setup

```yaml
# docker-compose.yml
services:
  service1:
    build: .
    deploy:
      replicas: 3
```

### 3. Monitoring Setup

```javascript
// Add custom metrics
const customMetric = new client.Counter({
  name: 'custom_metric',
  help: 'Custom metric description'
});
```

## Best Practices

1. Service Health Checks
- Implement /health endpoint
- Regular health checks
- Proper error handling

2. Load Balancing
- Use multiple instances
- Monitor load distribution
- Handle failover

3. Monitoring
- Set up alerts
- Monitor key metrics
- Regular health checks

## Troubleshooting

### Common Issues

1. Service Not Found
```bash
# Check service registration
curl http://localhost:3000/services

# Verify service health
curl http://localhost:3000/health
```

2. Connection Refused
```bash
# Check Docker network
docker network ls
docker network inspect proxy-network
```

3. Metrics Not Available
```bash
# Verify Prometheus configuration
curl http://localhost:9090/targets
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Submit pull request

## Support

- GitHub Issues: [Link]
- Documentation: [Link]
- Community: [Link]