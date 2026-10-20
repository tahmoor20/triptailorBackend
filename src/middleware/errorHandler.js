'use strict';

const { HttpError } = require('../utils/httpError');

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Express recognises error middleware by its four arguments.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message });
  }

  const status = err.status || 500;
  if (status >= 500) {
    console.error(err);
  }

  // Messages from HttpError are written for clients, so they are always safe to show.
  // Anything else that fails with a 5xx is unexpected: never leak its details.
  const isSafeToShow = err instanceof HttpError || status < 500;
  const message = isSafeToShow ? err.message : 'Internal server error';
  return res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
