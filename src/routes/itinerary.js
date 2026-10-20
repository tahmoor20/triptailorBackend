'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { HttpError } = require('../utils/httpError');
const { createLimiter } = require('../middleware/rateLimit');
const { validateItineraryRequest } = require('../validators');
const { createItineraryService } = require('../services/itinerary');

function createItineraryRouter({ config, openai }) {
  const router = express.Router();
  const itineraries = createItineraryService({ openai, model: config.openaiModel });

  // Each request costs money, so keep the limit low.
  const limiter = createLimiter({ limit: 20 });

  router.post(
    '/generate-itinerary',
    limiter,
    asyncHandler(async (req, res) => {
      const { value, error } = validateItineraryRequest(req.body);
      if (error) throw new HttpError(400, error);

      const itinerary = await itineraries.generate(value);
      res.json({ itinerary });
    })
  );

  return router;
}

module.exports = { createItineraryRouter };
