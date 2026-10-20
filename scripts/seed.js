'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadConfig } = require('../src/config');

/** Read data/cities.json and point every image at this server. */
function loadCities(baseUrl) {
  const raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'cities.json'), 'utf8');
  return JSON.parse(raw.replaceAll('{{BASE_URL}}', baseUrl));
}

async function seed() {
  const config = loadConfig();
  if (!config.mongoUri) throw new Error('MONGO_URI is required to seed the database');

  const client = new MongoClient(config.mongoUri);
  await client.connect();

  try {
    const cities = client.db(config.dbName).collection('cities');
    for (const city of loadCities(config.baseUrl)) {
      // Upsert by name so running the script twice does not create duplicates.
      await cities.updateOne({ name: city.name }, { $set: city }, { upsert: true });
      console.log(`Seeded ${city.name}`);
    }
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  });
}

module.exports = { loadCities };
