const EventEmitter = require('events');

class ServiceRegistry extends EventEmitter {
  constructor() {
    super();
    this.services = new Map();
    this.healthCheckInterval = 10000; // 10 seconds
    this.startHealthChecks();
  }

  registerService(name, host, port) {
    const serviceId = `${name}-${host}-${port}`;
    const serviceUrl = `http://${host}:${port}`;
    
    this.services.set(serviceId, {
      name,
      host,
      port,
      url: serviceUrl,
      status: 'healthy',
      lastCheck: Date.now()
    });

    console.log(`Service registered: ${name} at ${serviceUrl}`);
    this.emit('service-added', { name, url: serviceUrl });
    return serviceId;
  }

  removeService(serviceId) {
    const service = this.services.get(serviceId);
    if (service) {
      this.services.delete(serviceId);
      console.log(`Service removed: ${service.name} at ${service.url}`);
      this.emit('service-removed', service);
    }
  }

  getService(name) {
    return Array.from(this.services.values())
      .filter(service => service.name === name && service.status === 'healthy');
  }

  async checkHealth(service) {
    try {
      const response = await fetch(`${service.url}/health`);
      return response.status === 200;
    } catch (error) {
      console.error(`Health check failed for ${service.url}:`, error.message);
      return false;
    }
  }

  startHealthChecks() {
    setInterval(async () => {
      for (const [serviceId, service] of this.services) {
        const isHealthy = await this.checkHealth(service);
        const previousStatus = service.status;
        service.status = isHealthy ? 'healthy' : 'unhealthy';
        service.lastCheck = Date.now();

        if (previousStatus !== service.status) {
          console.log(`Service ${service.name} health status changed to ${service.status}`);
          this.emit('health-status-changed', {
            serviceId,
            name: service.name,
            status: service.status
          });
        }
      }
    }, this.healthCheckInterval);
  }
}

module.exports = new ServiceRegistry();