'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const { createAuthRouter } = require('./routes/auth');
const { createCitiesRouter } = require('./routes/cities');
const { createLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./middleware/errorHandler');

/**
 * Build the Express app. The database, config and OpenAI client are injected,
 * which keeps the app easy to test with fakes.
 */
function createApp({ db, config, openai }) {
  const app = express();

  // Behind a reverse proxy (Render, Heroku...) the client IP comes from X-Forwarded-For.
  if (config.env === 'production') app.set('trust proxy', 1);

  app.use(cors());
  app.use(express.json());

  // Static city images
  app.use('/images', express.static(path.join(__dirname, '..', 'images')));

  app.get('/', (req, res) => {
    res.send('Trip Tailor Backend is running!');
  });

  // Slow down password guessing on the auth endpoints.
  const authLimiter = createLimiter({ limit: 50 });
  app.use('/api/signin', authLimiter);
  app.use('/api/signup', authLimiter);

  app.use('/api', createAuthRouter({ db, config }));
  app.use('/api', createCitiesRouter({ db, config, openai }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
