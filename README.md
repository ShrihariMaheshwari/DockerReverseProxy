# Node.js Reverse Proxy Server

A robust, production-ready reverse proxy server built with Node.js, featuring service discovery, health monitoring, metrics collection, and a real-time admin dashboard.

## 🚀 Features

- **Dynamic Service Registration**: Auto-register and manage backend services
- **Health Monitoring**: Automatic health checks for all registered services
- **Metrics Collection**: Prometheus-compatible metrics and monitoring
- **Admin Dashboard**: Real-time service monitoring and management
- **Load Balancing**: Simple round-robin load balancing for multiple service instances
- **CORS Support**: Configurable CORS for cross-origin requests
- **Error Handling**: Comprehensive error handling and logging
- **Graceful Shutdown**: Clean shutdown with connection draining
- **Docker Support**: Containerization ready with Docker and Docker Compose

## 📋 Requirements

- Node.js >= 16.x
- npm >= 8.x
- Docker (optional, for containerization)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/reverse-proxy
cd reverse-proxy
```

2. Install dependencies:
```bash
npm install
```

3. Create configuration file:
```bash
cp .env.example .env
```

4. Start the server:
```bash
npm start
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
HEALTH_CHECK_INTERVAL=10000
```

### Service Configuration

Update `config/services.js`:

```javascript
module.exports = {
  'service1.localhost': process.env.NODE_ENV === 'production' 
    ? 'http://service1:3001'
    : 'http://localhost:3001',
  'service2.localhost': process.env.NODE_ENV === 'production' 
    ? 'http://service2:3002'
    : 'http://localhost:3002'
};
```

## 📁 Project Structure

```
├── config/
│   ├── services.js        # Service configuration
├── middleware/
│   ├── errorHandler.js    # Error handling middleware
│   ├── logging.js         # Morgan logging configuration
│   ├── metrics.js         # Metrics middleware
├── public/
│   ├── index.html         # Admin dashboard
│   ├── components/        # React components
├── routes/
│   ├── health.js         # Health check routes
│   ├── metrics.js        # Metrics routes
├── services/
│   ├── discovery.js      # Service registry
│   ├── monitoring.js     # Prometheus metrics
├── server.js             # Main application file
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
```

## 🚦 API Endpoints

### Service Management

- `POST /services/register` - Register a new service
  ```json
  {
    "domain": "service.localhost",
    "target": "http://localhost:3001"
  }
  ```

- `GET /services` - List all registered services
- `DELETE /services/:domain` - Deregister a service

### Metrics & Health

- `GET /health` - Server health check
- `GET /metrics` - Prometheus metrics
- `GET /metrics/services` - Service-specific metrics
- `GET /metrics/health` - Detailed health metrics

### Admin Dashboard

- `GET /admin` - Admin dashboard interface

## 🔍 Monitoring & Metrics

### Available Metrics

- `http_request_duration_seconds`: Request duration histogram
- `service_health_status`: Service health status (0/1)
- `active_services_total`: Total number of registered services
- `service_response_time_seconds`: Service response time
- `proxy_errors_total`: Total proxy errors

### Prometheus Configuration

```yaml
scrape_configs:
  - job_name: 'reverse-proxy'
    static_configs:
      - targets: ['localhost:3000']
```

## 🛡️ Security

### Headers

The proxy automatically sets security headers:
- `X-Forwarded-Proto`
- `X-Forwarded-Host`
- `X-Forwarded-For`
- `X-Proxy-Timestamp`

### CORS

CORS is configurable through middleware:
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  // ... other CORS headers
});
```

## 🐳 Docker Support

### Building the Image

```bash
docker build -t reverse-proxy .
```

### Docker Compose

```bash
docker-compose up -d
```

## 🚀 Usage Examples

### Registering a Service

```bash
curl -X POST http://localhost:3000/services/register \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "service1.localhost",
    "target": "http://localhost:3001"
  }'
```

### Accessing a Service

```bash
curl -H "Host: service1.localhost" http://localhost:3000/api/endpoint
```

### Checking Service Health

```bash
curl http://localhost:3000/metrics/health
```

## 🔧 Development

### Running Tests

```bash
npm test
```

### Development Server

```bash
npm run dev
```

## 🔄 Error Handling

The proxy includes comprehensive error handling:
- Service unavailability
- Connection timeouts
- Invalid configurations
- Runtime errors

## 📊 Admin Dashboard

Access the dashboard at `http://localhost:3000/admin` to:
- Monitor service health
- View real-time metrics
- Manage service registration
- View proxy logs

## 🔨 Maintenance

### Graceful Shutdown

The server handles graceful shutdowns:
- Stops accepting new connections
- Completes existing requests
- Cleans up resources
- Logs shutdown process

### Logs

Logs are formatted for easy parsing:
```javascript
console.log({
  level: 'info',
  message: 'Proxy request',
  timestamp: new Date().toISOString(),
  ...data
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. Service Not Found
```bash
curl -H "Host: unknown.localhost" http://localhost:3000
# Returns 404 with available services
```

2. Health Check Failures
```bash
curl http://localhost:3000/metrics/health
# Check service status and last check timestamp
```

### Debugging

Enable debug logs:
```bash
DEBUG=proxy:* npm start
```

## ✨ Future Improvements

- [ ] Add service authentication
- [ ] Implement rate limiting
- [ ] Add request caching
- [ ] Improve load balancing algorithms
- [ ] Add service discovery with etcd/consul
- [ ] Implement circuit breaker pattern
- [ ] Add WebSocket support
- [ ] Improve metrics visualization

## 📞 Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with:
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

## 🔄 Updates

Check the [CHANGELOG.md](CHANGELOG.md) for version history and updates.