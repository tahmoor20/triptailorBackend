'use strict';

const { ObjectId } = require('mongodb');

// Minimal in-memory stand-in for the parts of the MongoDB driver the API uses.
// It keeps the tests fast and means they never touch a real database.

function matches(doc, filter) {
  return Object.entries(filter).every(([key, value]) => String(doc[key]) === String(value));
}

function project(doc, projection) {
  const keys = Object.keys(projection).filter((key) => projection[key]);
  const result = { _id: doc._id };
  keys.forEach((key) => {
    if (key in doc) result[key] = doc[key];
  });
  return result;
}

function createFakeDb() {
  const store = {};

  function collection(name) {
    if (!store[name]) store[name] = [];
    const docs = store[name];

    return {
      async findOne(filter) {
        const doc = docs.find((d) => matches(d, filter));
        return doc ? { ...doc } : null;
      },
      async insertOne(doc) {
        const _id = new ObjectId();
        docs.push({ ...doc, _id });
        return { acknowledged: true, insertedId: _id };
      },
      find(filter = {}) {
        return {
          toArray: async () => docs.filter((d) => matches(d, filter)).map((d) => ({ ...d })),
        };
      },
      async updateOne(filter, update) {
        const doc = docs.find((d) => matches(d, filter));
        if (doc) Object.assign(doc, update.$set);
        return { matchedCount: doc ? 1 : 0, modifiedCount: doc ? 1 : 0 };
      },
      aggregate(pipeline) {
        return {
          toArray: async () => {
            let result = docs.map((d) => ({ ...d }));
            pipeline.forEach((stage) => {
              if (stage.$sample) result = result.slice(0, stage.$sample.size);
              if (stage.$project) result = result.map((d) => project(d, stage.$project));
            });
            return result;
          },
        };
      },
      async createIndex() {
        return 'index';
      },
    };
  }

  return { collection, _store: store };
}

module.exports = { createFakeDb };
