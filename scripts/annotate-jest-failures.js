'use strict';

// Turns failures from `jest --json` output into GitHub Actions annotations,
// so they show up on the workflow run and on pull requests.
const fs = require('fs');

const ANSI = /\u001b\[[0-9;]*m/g;
const clean = (text) => String(text).replace(ANSI, '').replace(/\s+/g, ' ').trim().slice(0, 900);
const escapeProperty = (text) => String(text).replace(/[%\r\n:,]/g, ' ');

const file = process.argv[2] || 'jest-results.json';
if (!fs.existsSync(file)) {
  console.log(`::error::${file} was not created, so no test results are available`);
  process.exit(0);
}

const results = JSON.parse(fs.readFileSync(file, 'utf8'));

for (const suite of results.testResults) {
  const failed = suite.assertionResults.filter((test) => test.status === 'failed');

  failed.forEach((test) => {
    console.log(`::error title=${escapeProperty(test.fullName)}::${clean(test.failureMessages.join(' | '))}`);
  });

  // A suite that crashes before running any test (for example a missing module).
  if (suite.status === 'failed' && failed.length === 0 && suite.message) {
    console.log(`::error title=${escapeProperty(suite.name.split('/').pop())}::${clean(suite.message)}`);
  }
}
