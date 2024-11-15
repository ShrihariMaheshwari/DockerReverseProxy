# Node.js Reverse Proxy with Service Discovery and Monitoring

A lightweight, configurable reverse proxy server built with Node.js that includes service discovery and Prometheus monitoring.

## Features

### Core Features
- Host-based routing
- WebSocket support
- Health checking
- Request logging
- Error handling
- Docker support
- Dynamic service discovery
- Prometheus metrics integration

### Monitoring & Metrics
- Prometheus integration
- Request duration tracking
- Service health monitoring
- Active services tracking
- Custom metrics endpoints

### Service Discovery
- Automatic service registration
- Health-based routing
- Service health monitoring
- Dynamic service updates

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Docker and Docker Compose

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/node-reverse-proxy.git
cd node-reverse-proxy

# Install dependencies
npm install
```

## Project Structure
```
node-reverse-proxy/
├── src/
│   ├── config/
│   │   ├── services.js          # Service configuration
│   │   └── prometheus/
│   │       └── prometheus.yml   # Prometheus configuration
│   ├── middleware/
│   │   ├── errorHandler.js      # Error handling middleware
│   │   ├── logging.js          # Logging middleware
│   │   └── metrics.js          # Metrics middleware
│   ├── services/
│   │   ├── discovery.js        # Service discovery logic
│   │   └── monitoring.js       # Monitoring service
│   ├── routes/
│   │   ├── health.js          # Health check endpoint
│   │   └── metrics.js         # Metrics endpoint
│   └── server.js              # Main application
├── examples/
│   └── test-services/         # Example service implementations
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## Configuration

### Service Configuration
Configure your services in `src/config/services.js`:
```javascript
module.exports = {
  'service1.localhost': 'http://localhost:3001',
  'service2.localhost': 'http://localhost:3002',
  'service3.localhost': 'http://localhost:3003'
};
```

### Prometheus Configuration
The Prometheus configuration is located in `src/config/prometheus/prometheus.yml`:
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'reverse-proxy'
    static_configs:
      - targets: ['reverse-proxy:3000']
    metrics_path: '/metrics'
```

## Usage

### Development
```bash
# Start the proxy server
npm run dev

# Run tests
npm test

# Start example services
npm run examples
```

### Docker Deployment
```bash
# Build and start all services
docker-compose up --build

# Scale services
docker-compose up --scale service1=3 service2=3 service3=3
```

## API Reference

### Service Discovery

```bash
# Register a service
curl -X POST http://localhost:3000/services/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "service1",
    "host": "service1",
    "port": "3001"
  }'

# Get registered services
curl http://localhost:3000/services
```

### Metrics Endpoints

```bash
# Get Prometheus metrics
curl http://localhost:3000/metrics

# Get service metrics
curl http://localhost:3000/metrics/services

# Get health metrics
curl http://localhost:3000/metrics/health
```

### Service Access
```bash
# Access a service
curl -H "Host: service1.localhost" http://localhost:3000

# Health check
curl http://localhost:3000/health
```

## Monitoring

### Prometheus
- Access Prometheus UI: http://localhost:9090
- View targets: http://localhost:9090/targets


## Testing

### Run Tests
```bash
npm test
```

### Generate Test Traffic
```bash
# Send test requests
for i in {1..10}; do
    curl -H "Host: service1.localhost" http://localhost:3000
    sleep 1
done
```

## Troubleshooting

### Check Service Status
```bash
# View all containers
docker-compose ps

# Check logs
docker-compose logs

# Check specific service logs
docker-compose logs reverse-proxy
```

### Common Issues
1. Service Not Found
   - Ensure service is registered
   - Check if service is healthy
   - Verify correct host header

2. Metrics Not Available
   - Check Prometheus configuration
   - Verify metrics endpoint is accessible
   - Check Prometheus targets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Express](https://expressjs.com/)
- Uses [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)
- Monitoring with [Prometheus](https://prometheus.io/)