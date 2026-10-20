const { validateSignup, validateSignin } = require('../src/validators');

describe('validateSignup', () => {
  const valid = {
    fullName: '  Qamar Uddin ',
    email: ' Qamar@Example.com ',
    phoneNumber: '07123456789',
    password: 'secret123',
  };

  it('trims and normalises valid input', () => {
    expect(validateSignup(valid).value).toEqual({
      fullName: 'Qamar Uddin',
      email: 'qamar@example.com',
      phoneNumber: '07123456789',
      password: 'secret123',
    });
  });

  it('rejects passwords longer than bcrypt can use', () => {
    expect(validateSignup({ ...valid, password: 'x'.repeat(73) }).error).toBe(
      'Password must be at most 72 characters'
    );
  });

  it('handles a missing body', () => {
    expect(validateSignup(undefined).error).toBe('Full name is required');
  });

  it('ignores non-string values instead of throwing', () => {
    expect(validateSignup({ ...valid, email: { $ne: '' } }).error).toBe(
      'A valid email address is required'
    );
  });
});

describe('validateSignin', () => {
  it('accepts an email and password', () => {
    expect(validateSignin({ email: 'A@B.com', password: 'pw' }).value).toEqual({
      email: 'a@b.com',
      password: 'pw',
    });
  });

  it('rejects objects used for NoSQL injection', () => {
    expect(validateSignin({ email: { $gt: '' }, password: 'pw' }).error).toBe(
      'Email and password are required'
    );
  });
});
