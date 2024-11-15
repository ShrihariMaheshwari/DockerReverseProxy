const EventEmitter = require('events');
const monitoring = require('./monitoring');

class ServiceRegistry extends EventEmitter {
  constructor() {
    super();
    this.services = new Map();
    this.healthCheckInterval = 10000; // 10 seconds
    this.intervalId = null;
  }

  // Register a service with domain support
  registerService(domain, target) {
    const serviceName = domain.split('.')[0];
    
    const serviceInfo = {
      name: serviceName,
      domain,
      url: target,
      status: 'healthy',
      lastCheck: Date.now(),
      metrics: {
        totalRequests: 0,
        errorCount: 0,
        lastResponseTime: null
      }
    };

    this.services.set(domain, serviceInfo);

    // Update Prometheus metrics
    monitoring.metrics.activeServices.set(this.services.size);
    monitoring.metrics.serviceHealthStatus.set(
      { service_name: serviceName, service_url: target, domain },
      1
    );

    console.log(`Service registered: ${serviceName} at ${target} (${domain})`);
    this.emit('service-added', serviceInfo);
    
    return domain;
  }

  // Remove a service
  removeService(domain) {
    const service = this.services.get(domain);
    if (service) {
      this.services.delete(domain);
      
      // Update Prometheus metrics
      monitoring.metrics.activeServices.set(this.services.size);
      monitoring.metrics.serviceHealthStatus.remove({
        service_name: service.name,
        service_url: service.url,
        domain
      });

      console.log(`Service removed: ${service.name} at ${service.url} (${domain})`);
      this.emit('service-removed', service);
    }
  }

  // Get service by domain
  getService(domain) {
    return this.services.get(domain);
  }

  // Update service metrics
  updateServiceMetrics(domain, responseTime, isError = false) {
    const service = this.services.get(domain);
    if (service) {
      service.metrics.totalRequests++;
      service.metrics.lastResponseTime = responseTime;
      if (isError) {
        service.metrics.errorCount++;
      }

      monitoring.metrics.serviceResponseTime.observe(
        { service_name: service.name, domain },
        responseTime / 1000
      );
    }
  }

  // Health check
  async checkHealth(service) {
    const startTime = Date.now();
    try {
      const response = await fetch(`${service.url}/health`);
      const responseTime = Date.now() - startTime;
      
      const isHealthy = response.status === 200;
      
      monitoring.metrics.serviceResponseTime.observe(
        { service_name: service.name, domain: service.domain },
        responseTime / 1000
      );

      return isHealthy;
    } catch (error) {
      console.error(`Health check failed for ${service.url}:`, error.message);
      monitoring.metrics.proxyErrors.inc({
        service_name: service.name,
        error_type: 'health_check_failed'
      });
      return false;
    }
  }

  // Start health checks
  startHealthChecks() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(async () => {
      for (const [domain, service] of this.services) {
        const isHealthy = await this.checkHealth(service);
        const previousStatus = service.status;
        service.status = isHealthy ? 'healthy' : 'unhealthy';
        service.lastCheck = Date.now();

        // Update Prometheus metrics
        monitoring.metrics.serviceHealthStatus.set(
          {
            service_name: service.name,
            service_url: service.url,
            domain
          },
          isHealthy ? 1 : 0
        );

        if (previousStatus !== service.status) {
          console.log(`Service ${service.name} health status changed to ${service.status}`);
          this.emit('health-status-changed', {
            domain,
            name: service.name,
            status: service.status
          });
        }
      }
    }, this.healthCheckInterval);
  }

  stopHealthChecks() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  clearServices() {
    for (const [domain, service] of this.services) {
      this.removeService(domain);
    }
    this.stopHealthChecks();
  }

  // Get services statistics
  getStatistics() {
    const stats = {
      total: this.services.size,
      healthy: 0,
      unhealthy: 0,
      services: {}
    };

    for (const [domain, service] of this.services) {
      if (service.status === 'healthy') stats.healthy++;
      else stats.unhealthy++;

      stats.services[domain] = {
        name: service.name,
        status: service.status,
        lastCheck: service.lastCheck,
        metrics: service.metrics
      };
    }

    return stats;
  }
}

// Export a singleton instance
const serviceRegistry = new ServiceRegistry();
module.exports = serviceRegistry;