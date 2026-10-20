'use strict';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const DIGITS_ONLY = /^\d+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 72; // bcrypt ignores everything after 72 bytes

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

module.exports = { validateSignup, validateSignin };
