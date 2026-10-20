'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { HttpError } = require('../utils/httpError');
const { requireAuth } = require('../middleware/auth');

function createCitiesRouter({ db, config }) {
  const router = express.Router();
  const cities = () => db.collection('cities');

  // List every city (used by the home screen).
  router.get(
    '/cities',
    asyncHandler(async (req, res) => {
      res.json(await cities().find({}).toArray());
    })
  );

  // Only signed-in users can add cities.
  router.post(
    '/cities',
    requireAuth(config),
    asyncHandler(async (req, res) => {
      const { name, imageUrl, description, plan } = req.body || {};

      if (typeof name !== 'string' || !name.trim()) {
        throw new HttpError(400, 'City name is required');
      }
      if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
        throw new HttpError(400, 'City imageUrl is required');
      }

      const city = {
        name: name.trim(),
        imageUrl: imageUrl.trim(),
        description: typeof description === 'string' ? description : '',
        plan: Array.isArray(plan) ? plan : [],
      };

      const result = await cities().insertOne(city);
      res.status(201).json({ ...city, _id: result.insertedId });
    })
  );

  return router;
}

module.exports = { createCitiesRouter };
