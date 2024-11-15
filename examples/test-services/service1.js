const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const serviceName = process.env.SERVICE_NAME || 'service1';

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

app.listen(port, '0.0.0.0', () => {
  console.log(`${serviceName} listening at http://0.0.0.0:${port}`);
});