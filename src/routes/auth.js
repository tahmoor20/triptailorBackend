'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const { HttpError } = require('../utils/httpError');
const { signToken } = require('../middleware/auth');
const { validateSignup, validateSignin } = require('../validators');

const BCRYPT_ROUNDS = 10;
const DUPLICATE_KEY_ERROR = 11000;

function createAuthRouter({ db, config }) {
  const router = express.Router();
  const users = () => db.collection('users');

  router.post(
    '/signup',
    asyncHandler(async (req, res) => {
      const { value, error } = validateSignup(req.body);
      if (error) throw new HttpError(400, error);

      if (await users().findOne({ email: value.email })) {
        throw new HttpError(409, 'An account with this email already exists');
      }

      const user = {
        fullName: value.fullName,
        email: value.email,
        phoneNumber: value.phoneNumber,
        passwordHash: await bcrypt.hash(value.password, BCRYPT_ROUNDS),
        profileImage: null,
        createdAt: new Date(),
      };

      let result;
      try {
        result = await users().insertOne(user);
      } catch (err) {
        // The unique index on email catches two sign-ups racing each other.
        if (err.code === DUPLICATE_KEY_ERROR) {
          throw new HttpError(409, 'An account with this email already exists');
        }
        throw err;
      }

      const token = signToken({ _id: result.insertedId }, config);
      res.status(201).json({ token, fullName: user.fullName });
    })
  );

  router.post(
    '/signin',
    asyncHandler(async (req, res) => {
      const { value, error } = validateSignin(req.body);
      if (error) throw new HttpError(400, error);

      const user = await users().findOne({ email: value.email });
      const passwordMatches = user && (await bcrypt.compare(value.password, user.passwordHash));

      // Same message for "no such user" and "wrong password" so emails can't be probed.
      if (!passwordMatches) throw new HttpError(401, 'Invalid email or password');

      res.json({ token: signToken(user, config), fullName: user.fullName });
    })
  );

  return router;
}

module.exports = { createAuthRouter };
