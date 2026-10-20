const { loadConfig, assertRequired } = require('../src/config');

describe('loadConfig', () => {
  it('applies sensible defaults', () => {
    const config = loadConfig({});

    expect(config.port).toBe(5000);
    expect(config.dbName).toBe('triptailor');
    expect(config.jwtExpiresIn).toBe('7d');
    expect(config.openaiModel).toBe('gpt-4o-mini');
    expect(config.baseUrl).toBe('http://localhost:5000');
  });

  it('reads values from the environment', () => {
    const config = loadConfig({
      PORT: '8080',
      MONGO_URI: 'mongodb://example',
      JWT_SECRET: 'shh',
      OPENAI_MODEL: 'gpt-4o',
      BASE_URL: 'https://api.example.com/',
    });

    expect(config.port).toBe(8080);
    expect(config.mongoUri).toBe('mongodb://example');
    expect(config.jwtSecret).toBe('shh');
    expect(config.openaiModel).toBe('gpt-4o');
    expect(config.baseUrl).toBe('https://api.example.com');
  });
});

describe('assertRequired', () => {
  it('lists every missing variable', () => {
    expect(() => assertRequired(loadConfig({}))).toThrow(
      'Missing required environment variables: MONGO_URI, JWT_SECRET'
    );
  });

  it('passes when the required variables are set', () => {
    expect(() =>
      assertRequired(loadConfig({ MONGO_URI: 'mongodb://example', JWT_SECRET: 'shh' }))
    ).not.toThrow();
  });
});
