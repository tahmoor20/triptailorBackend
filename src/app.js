'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const { createCitiesRouter } = require('./routes/cities');
const { notFound, errorHandler } = require('./middleware/errorHandler');

/**
 * Build the Express app. The database, config and OpenAI client are injected,
 * which keeps the app easy to test with fakes.
 */
function createApp({ db, config, openai }) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Static city images
  app.use('/images', express.static(path.join(__dirname, '..', 'images')));

  app.get('/', (req, res) => {
    res.send('Trip Tailor Backend is running!');
  });

  app.use('/api', createCitiesRouter({ db, config, openai }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
