'use strict';

/**
 * Read configuration from environment variables.
 * Nothing secret is hard-coded: every secret comes from the environment.
 */
function loadConfig(env = process.env) {
  const port = Number(env.PORT) || 5000;

  return {
    env: env.NODE_ENV || 'development',
    port,
    mongoUri: env.MONGO_URI,
    dbName: env.DB_NAME || 'triptailor',
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN || '7d',
    openaiApiKey: env.OPENAI_API_KEY,
    openaiModel: env.OPENAI_MODEL || 'gpt-4o-mini',
    baseUrl: (env.BASE_URL || `http://localhost:${port}`).replace(/\/$/, ''),
    uploadDir: env.UPLOAD_DIR || 'uploads',
  };
}

/** Throw a clear error at start-up if a required variable is missing. */
function assertRequired(config) {
  const missing = [];
  if (!config.mongoUri) missing.push('MONGO_URI');
  if (!config.jwtSecret) missing.push('JWT_SECRET');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = { loadConfig, assertRequired };
