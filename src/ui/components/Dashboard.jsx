import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
    const interval = setInterval(fetchServices, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/metrics/services');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.services) {
        setServices(data.services);
      }
      setError(null);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setError('Failed to fetch services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No check performed';
    
    try {
      // First try parsing as a timestamp
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // Format the date
      return date.toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      });
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Invalid Date Format';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px', color: '#333' }}>Reverse Proxy Dashboard</h1>
      
      <div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, marginRight: '20px' }}>Services</h2>
          <button 
            onClick={fetchServices}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {services.map((service) => (
            <div key={service.name} style={{ 
              padding: '20px',
              border: '1px solid #e1e1e1',
              borderRadius: '8px',
              background: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ marginTop: 0, color: '#2c3e50' }}>{service.name}</h3>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold' }}>Status: </span>
                <span style={{ 
                  color: service.status === 'healthy' ? '#27ae60' : '#e74c3c',
                  fontWeight: 'bold'
                }}>
                  {service.status}
                </span>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong>Access via Proxy:</strong>
                <pre style={{ 
                  background: '#f8f9fa',
                  padding: '8px',
                  borderRadius: '4px',
                  marginTop: '4px',
                  overflow: 'auto',
                  fontSize: '14px'
                }}>
                  curl -H "Host: {service.name}.localhost" http://localhost:3000
                </pre>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <strong>Last Check:</strong>
                <div style={{ marginTop: '4px', color: '#666' }}>
                {formatDate(service.lastCheck)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ 
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h2 style={{ marginTop: 0 }}>How to Access Services</h2>
          <div>
            <p><strong>1. Access service endpoint:</strong></p>
            <pre style={{ 
              background: '#f1f3f5',
              padding: '15px',
              borderRadius: '4px',
              overflowX: 'auto'
            }}>
              curl -H "Host: service1.localhost" http://localhost:3000
            </pre>

            <p><strong>2. Check service health:</strong></p>
            <pre style={{ 
              background: '#f1f3f5',
              padding: '15px',
              borderRadius: '4px',
              overflowX: 'auto'
            }}>
              curl -H "Host: service1.localhost" http://localhost:3000/health
            </pre>

            <p><strong>3. View all services:</strong></p>
            <pre style={{ 
              background: '#f1f3f5',
              padding: '15px',
              borderRadius: '4px',
              overflowX: 'auto'
            }}>
              curl http://localhost:3000/metrics/services
            </pre>

            <p><strong>4. View all service metrics:</strong></p>
            <pre style={{ 
              background: '#f1f3f5',
              padding: '15px',
              borderRadius: '4px',
              overflowX: 'auto'
            }}>
              curl -H "Host: service1.localhost" http://localhost:3000/metrics/services
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}