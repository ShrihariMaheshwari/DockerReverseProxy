# Node.js Reverse Proxy

A comprehensive reverse proxy server built with Node.js, featuring authentication, load balancing, monitoring, and SSL/TLS support.

## Features

### Core Features
- Host-based routing
- WebSocket support
- Health checking
- Request logging
- Error handling
- Docker support
- Load balancing
- SSL/TLS support

### Security
- API Key authentication
- JWT support
- Rate limiting
- SSL/TLS termination

### Monitoring & Metrics
- Prometheus integration
- Grafana dashboards
- Health checks
- Performance metrics
- Error tracking

### Load Balancing
- Round-robin load balancing
- Multiple service instances
- Health-based routing
- Service discovery

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Docker and Docker Compose
- OpenSSL (for certificate generation)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/node-reverse-proxy.git
cd node-reverse-proxy

# Install dependencies
npm install

# Generate SSL certificates
./scripts/generate-certs.sh

# Setup monitoring
./scripts/setup-monitoring.sh
```

## Configuration

1. Create environment file:
```bash
cp .env.example .env
```

2. Configure your services in `src/config/services.js`:
```javascript
module.exports = {
  'service1.localhost': 'http://localhost:3001',
  'service2.localhost': 'http://localhost:3002',
  'service3.localhost': 'http://localhost:3003'
};
```

3. Configure authentication in `src/config/auth.js`:
```javascript
// API keys, JWT settings, and rate limiting configuration
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

### Production with Docker

```bash
# Build and start all services
docker-compose up --build

# Scale services
docker-compose up --scale service1=3 service2=3 service3=3
```

## API Reference

### Authentication

```bash
# API Key authentication
curl -H "Host: service1.localhost" \
     -H "X-API-Key: your-api-key" \
     http://localhost:3000

# JWT authentication
curl -H "Host: service1.localhost" \
     -H "Authorization: Bearer your-jwt-token" \
     http://localhost:3000
```

### Health Check

```bash
# HTTP health check
curl http://localhost:3000/health

# HTTPS health check
curl -k https://localhost:3443/health
```

### Metrics

```bash
# Prometheus metrics
curl http://localhost:3000/metrics
```

## Monitoring

### Prometheus
- Access Prometheus: http://localhost:9090
- Metrics available at: http://localhost:3000/metrics

### Grafana
- Access Grafana: http://localhost:3000
- Default credentials: admin/admin
- Pre-configured dashboards available

## Security

### SSL/TLS
- HTTPS enabled on port 3443
- Auto-generated self-signed certificates
- Custom certificate support

### Authentication
- API Key authentication
- JWT support
- Rate limiting
- IP-based restrictions (optional)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

```bash
# Run all tests
npm test

# Run specific tests
npm test -- --grep "authentication"
npm test -- --grep "load balancer"
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by [Traefik](https://traefik.io/)
- Built with [Express](https://expressjs.com/)
- Uses [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)
- Monitoring with [Prometheus](https://prometheus.io/) and [Grafana](https://grafana.com/)