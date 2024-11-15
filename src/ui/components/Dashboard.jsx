import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, Settings, Activity } from 'lucide-react';

export default function Dashboard() {
  const [services, setServices] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/metrics/services');
      const data = await response.json();
      setServices(data.services);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reverse Proxy Dashboard</h1>
        <button 
          onClick={fetchServices}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin">
            <RefreshCw size={24} />
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Service Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((service) => (
              <div key={service.name} className="p-4 bg-white rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-gray-500">{service.url}</p>
                  </div>
                  {service.status === 'healthy' ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <AlertCircle className="text-red-500" size={20} />
                  )}
                </div>
                <div className="mt-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Last Check:</span>
                    <span className="ml-2">
                      {new Date(service.lastCheck).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 ${
                      service.status === 'healthy' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Metrics Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity size={20} />
              System Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="text-sm text-gray-500">Total Services</h3>
                <p className="text-2xl font-semibold">{services.length}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="text-sm text-gray-500">Healthy Services</h3>
                <p className="text-2xl font-semibold">
                  {services.filter(s => s.status === 'healthy').length}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="text-sm text-gray-500">Unhealthy Services</h3>
                <p className="text-2xl font-semibold">
                  {services.filter(s => s.status !== 'healthy').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}