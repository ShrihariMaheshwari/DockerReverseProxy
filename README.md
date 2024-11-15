# Node.js Reverse Proxy

A lightweight, configurable reverse proxy server built with Node.js, inspired by Traefik. This proxy supports host-based routing, WebSocket connections, and dynamic service discovery.

## Features

- Host-based routing
- WebSocket support
- Health checking
- Request logging
- Error handling
- Docker support (coming soon)
- Dynamic service discovery (coming soon)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Docker (optional)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/node-reverse-proxy.git
cd node-reverse-proxy

# Install dependencies
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure your services in `src/config/services.js`:

```javascript
module.exports = {
  'service1.localhost': 'http://localhost:3001',
  'service2.localhost': 'http://localhost:3002',
  'service3.localhost': 'http://localhost:3003'
};
```

## Usage

### Development

```bash
# Start the proxy server
npm run dev

# Run tests
npm test

# Start example services (for testing)
npm run examples
```

### Production

```bash
# Build the project
npm run build

# Start the server
npm start
```

### Docker

```bash
# Build the Docker image
docker build -t node-reverse-proxy .

# Run the container
docker run -p 3000:3000 node-reverse-proxy
```

## API Reference

### Health Check

```
GET /health
```

Returns the health status of the proxy server.

### Proxy Routes

All other routes are proxied based on the host header to their corresponding services as configured in `services.js`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by [Traefik](https://traefik.io/)
- Built with [Express](https://expressjs.com/)
- Uses [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)