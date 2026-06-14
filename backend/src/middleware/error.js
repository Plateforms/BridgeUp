import logger from '../config/logger.js';

export function errorHandler(err, req, res, _next) {
  logger.error(err.message, { stack: err.stack, method: req.method, url: req.url });
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
