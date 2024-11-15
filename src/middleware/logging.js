const morgan = require('morgan');

const loggingMiddleware = morgan('combined');

module.exports = loggingMiddleware;