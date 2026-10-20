'use strict';

const express = require('express');
const asyncHandler = require('../utils/asyncHandler');

function createCitiesRouter({ db }) {
  const router = express.Router();
  const cities = () => db.collection('cities');

  // List every city (used by the home screen).
  router.get(
    '/cities',
    asyncHandler(async (req, res) => {
      res.json(await cities().find({}).toArray());
    })
  );

  router.post(
    '/cities',
    asyncHandler(async (req, res) => {
      const result = await cities().insertOne(req.body);
      res.status(201).json(result);
    })
  );

  return router;
}

module.exports = { createCitiesRouter };
