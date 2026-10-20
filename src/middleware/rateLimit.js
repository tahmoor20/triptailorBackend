'use strict';

const rateLimit = require('express-rate-limit');

/** Create a per-IP rate limiter that answers with the API's JSON error shape. */
function createLimiter({ windowMs = 15 * 60 * 1000, limit = 100 } = {}) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
  });
}

module.exports = { createLimiter };
