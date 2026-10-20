'use strict';

require('dotenv').config();

const { MongoClient } = require('mongodb');
const { loadConfig, assertRequired } = require('./src/config');
const { createApp } = require('./src/app');

async function main() {
  const config = loadConfig();
  assertRequired(config);

  const client = new MongoClient(config.mongoUri);
  await client.connect();
  console.log('Connected to MongoDB Atlas');

  const db = client.db(config.dbName);
  // One account per email address.
  await db.collection('users').createIndex({ email: 1 }, { unique: true });

  const app = createApp({ db, config, openai: null });

  const server = app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });

  const shutdown = async () => {
    server.close();
    await client.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
