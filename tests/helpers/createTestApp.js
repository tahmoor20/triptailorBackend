'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { createApp } = require('../../src/app');
const { loadConfig } = require('../../src/config');
const { createFakeDb } = require('./fakeDb');

/** Build an app wired to an in-memory database and a fake OpenAI client. */
function createTestApp(overrides = {}) {
  const db = createFakeDb();
  const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'triptailor-uploads-'));
  const config = loadConfig({
    NODE_ENV: 'test',
    MONGO_URI: 'mongodb://unused',
    JWT_SECRET: 'test-secret',
    UPLOAD_DIR: uploadDir,
    BASE_URL: 'http://localhost:5000',
    ...overrides.env,
  });

  const openai = Object.prototype.hasOwnProperty.call(overrides, 'openai')
    ? overrides.openai
    : {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'Day 1: Sample plan' } }],
            }),
          },
        },
      };

  const app = createApp({ db, config, openai });
  return { app, db, config, openai };
}

module.exports = { createTestApp };
