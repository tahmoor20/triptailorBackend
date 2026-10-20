'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const asyncHandler = require('../utils/asyncHandler');
const { HttpError } = require('../utils/httpError');
const { requireAuth } = require('../middleware/auth');

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = /^image\/(png|jpe?g|webp|gif)$/;

/** Shape a stored user for the client: never expose the password hash. */
function toPublicUser(user, config) {
  return {
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    profileImage: user.profileImage ? `${config.baseUrl}${user.profileImage}` : null,
  };
}

function createUserRouter({ db, config }) {
  const router = express.Router();
  const users = () => db.collection('users');

  const uploadDir = path.resolve(config.uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) =>
        cb(null, `${req.userId}-${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: MAX_IMAGE_BYTES },
    fileFilter: (req, file, cb) => {
      if (IMAGE_TYPES.test(file.mimetype)) return cb(null, true);
      return cb(new HttpError(400, 'Only image files are allowed'));
    },
  });

  const auth = requireAuth(config);

  async function findCurrentUser(req) {
    if (!ObjectId.isValid(req.userId)) throw new HttpError(401, 'Invalid or expired token');

    const user = await users().findOne({ _id: new ObjectId(req.userId) });
    if (!user) throw new HttpError(404, 'User not found');
    return user;
  }

  router.get(
    '/user',
    auth,
    asyncHandler(async (req, res) => {
      res.json(toPublicUser(await findCurrentUser(req), config));
    })
  );

  router.put(
    '/user',
    auth,
    upload.single('profileImage'),
    asyncHandler(async (req, res) => {
      const user = await findCurrentUser(req);
      const updates = {};

      if (req.body.fullName !== undefined) {
        const fullName = String(req.body.fullName).trim();
        if (!fullName) throw new HttpError(400, 'Full name cannot be empty');
        if (fullName.length > 100) throw new HttpError(400, 'Full name is too long');
        updates.fullName = fullName;
      }

      if (req.body.phoneNumber !== undefined) {
        const phoneNumber = String(req.body.phoneNumber).trim();
        if (!/^\d+$/.test(phoneNumber)) {
          throw new HttpError(400, 'Phone number should contain only numbers');
        }
        updates.phoneNumber = phoneNumber;
      }

      if (req.file) {
        updates.profileImage = `/uploads/${req.file.filename}`;
      }

      if (Object.keys(updates).length > 0) {
        await users().updateOne({ _id: user._id }, { $set: updates });
      }

      const updated = await users().findOne({ _id: user._id });
      res.json(toPublicUser(updated, config));
    })
  );

  return router;
}

module.exports = { createUserRouter, toPublicUser };
