'use strict';

const jwt = require('jsonwebtoken');
const { HttpError } = require('../utils/httpError');

function signToken(user, config) {
  return jwt.sign({ sub: String(user._id) }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

/** Require a valid "Authorization: Bearer <token>" header. Sets req.userId. */
function requireAuth(config) {
  return (req, res, next) => {
    const [scheme, token] = (req.headers.authorization || '').split(' ');

    if (scheme !== 'Bearer' || !token) {
      return next(new HttpError(401, 'Authentication required'));
    }

    try {
      req.userId = jwt.verify(token, config.jwtSecret).sub;
      return next();
    } catch (err) {
      return next(new HttpError(401, 'Invalid or expired token'));
    }
  };
}

module.exports = { signToken, requireAuth };
