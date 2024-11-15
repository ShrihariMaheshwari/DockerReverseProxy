// middleware/logging.js
const morgan = require('morgan');

// Define a simpler, more robust custom format
morgan.token('host', function (req, res) {
  return req.headers['host'] || '-';
});

morgan.token('response-time-ms', function (req, res) {
  if (!req._startAt || !res._startAt) {
    return '-';
  }
  
  const ms = (res._startAt[0] - req._startAt[0]) * 1000 +
    (res._startAt[1] - req._startAt[1]) * 1e-6;
  return ms.toFixed(3);
});

const loggerFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :host :response-time-ms ms';

const loggingMiddleware = morgan(loggerFormat, {
  skip: (req, res) => {
    // Optionally skip logging for certain paths
    return req.path === '/health' || req.path === '/metrics';
  },
  stream: {
    write: (message) => {
      // Safely handle logging
      try {
        console.log(message.trim());
      } catch (error) {
        console.error('Logging error:', error);
      }
    }
  }
});

// Error handling wrapper
const safeLoggingMiddleware = (req, res, next) => {
  try {
    loggingMiddleware(req, res, next);
  } catch (error) {
    console.error('Logging middleware error:', error);
    next(); // Continue to next middleware even if logging fails
  }
};

module.exports = safeLoggingMiddleware;