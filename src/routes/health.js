const express = require('express');
const router = express.Router();
const serviceRegistry = require('../services/discovery');

router.get('/health', (req, res) => {
  const service = req.headers.host ? req.headers.host.split('.')[0] : 'unknown';
  const registeredService = serviceRegistry.getService(req.headers.host);

  res.status(200).json({
    status: 'healthy',
    service: service,
    registered: !!registeredService,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;