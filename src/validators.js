'use strict';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const DIGITS_ONLY = /^\d+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 72; // bcrypt ignores everything after 72 bytes
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const BUDGETS = ['low', 'medium', 'high'];
const MAX_TRIP_DAYS = 14;
const MAX_INTERESTS = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * Each validator returns either { value } with cleaned data
 * or { error } with a message that is safe to show to the user.
 */
function validateSignup(body = {}) {
  const fullName = asTrimmedString(body.fullName);
  const email = asTrimmedString(body.email).toLowerCase();
  const phoneNumber = asTrimmedString(body.phoneNumber);
  const password = typeof body.password === 'string' ? body.password : '';

  if (!fullName) return { error: 'Full name is required' };
  if (fullName.length > 100) return { error: 'Full name is too long' };
  if (!EMAIL_PATTERN.test(email)) return { error: 'A valid email address is required' };
  if (!DIGITS_ONLY.test(phoneNumber)) return { error: 'Phone number should contain only numbers' };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { error: `Password must be at most ${MAX_PASSWORD_LENGTH} characters` };
  }

  return { value: { fullName, email, phoneNumber, password } };
}

function validateSignin(body = {}) {
  const email = asTrimmedString(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) return { error: 'Email and password are required' };

  return { value: { email, password } };
}

/** Parse a strict YYYY-MM-DD string (rejects things like 2026-02-31). */
function parseIsoDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return null;

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date;
}

function validateItineraryRequest(body = {}) {
  const destination = asTrimmedString(body.destination);
  const companion = asTrimmedString(body.companion);
  const budget = body.budget === undefined ? 'medium' : asTrimmedString(body.budget).toLowerCase();

  if (!destination) return { error: 'Destination is required' };
  if (destination.length > 100) return { error: 'Destination is too long' };

  const from = parseIsoDate(body.fromDate);
  const to = parseIsoDate(body.toDate);
  if (!from || !to) return { error: 'fromDate and toDate must be dates in YYYY-MM-DD format' };
  if (to < from) return { error: 'toDate must not be before fromDate' };

  const days = Math.round((to - from) / MS_PER_DAY) + 1;
  if (days > MAX_TRIP_DAYS) return { error: `Trips can be at most ${MAX_TRIP_DAYS} days long` };

  if (!companion) return { error: 'Companion is required' };
  if (companion.length > 50) return { error: 'Companion is too long' };

  const interests = Array.isArray(body.interests)
    ? body.interests.map(asTrimmedString).filter(Boolean)
    : [];
  if (interests.length === 0 || interests.length > MAX_INTERESTS) {
    return { error: `Select between 1 and ${MAX_INTERESTS} interests` };
  }
  if (interests.some((interest) => interest.length > 50)) {
    return { error: 'Interests must be 50 characters or fewer' };
  }

  if (!BUDGETS.includes(budget)) return { error: 'Budget must be low, medium or high' };

  return {
    value: { destination, fromDate: body.fromDate, toDate: body.toDate, days, companion, interests, budget },
  };
}

module.exports = { validateSignup, validateSignin, validateItineraryRequest, parseIsoDate };
