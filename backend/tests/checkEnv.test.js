const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { checkEnv } = require('../scripts/check-env');

describe('FSD Backend Environment Integrity (check-env.js)', () => {
  const envExamplePath = path.resolve(__dirname, '..', '.env.example');

  test('asserts all required keys exist in .env.example', () => {
    expect(fs.existsSync(envExamplePath)).toBe(true);
    const content = fs.readFileSync(envExamplePath, 'utf8');
    const parsed = dotenv.parse(content);

    const requiredKeys = [
      'PORT',
      'CLIENT_URL',
      'ALLOWED_ORIGINS',
      'MONGO_URI',
      'JWT_SECRET',
      'ERP_SERVICE_API_KEY',
      'AI_SERVICE_BASE_URL',
      'AI_SERVICE_API_KEY'
    ];

    requiredKeys.forEach(key => {
      expect(parsed).toHaveProperty(key);
      expect(parsed[key]).toBeTruthy();
    });
  });

  test('fails validation when env is completely empty', () => {
    const result = checkEnv({}, { exitOnError: false, silent: true });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(6);
    expect(result.errors.some(e => e.includes('MONGO_URI'))).toBe(true);
    expect(result.errors.some(e => e.includes('JWT_SECRET'))).toBe(true);
    expect(result.errors.some(e => e.includes('ERP_SERVICE_API_KEY'))).toBe(true);
  });

  test('fails when secrets contain forbidden placeholders', () => {
    const placeholderEnv = {
      MONGO_URI: 'mongodb://localhost:27017/test_db',
      JWT_SECRET: 'replace_with_a_long_random_jwt_secret_at_least_32_characters',
      CLIENT_URL: 'http://localhost:5173',
      AI_SERVICE_BASE_URL: 'http://localhost:5001',
      AI_SERVICE_API_KEY: 'valid_secure_random_key_length_32_chars_ok',
      ERP_SERVICE_API_KEY: 'valid_secure_random_key_length_32_chars_ok',
      ALLOWED_ORIGINS: 'http://localhost:5173'
    };

    const result = checkEnv(placeholderEnv, { exitOnError: false, silent: true });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('JWT_SECRET contains an insecure placeholder'))).toBe(true);
  });

  test('fails when secrets are shorter than 32 characters', () => {
    const shortSecretEnv = {
      MONGO_URI: 'mongodb://localhost:27017/test_db',
      JWT_SECRET: 'short_secret_under_32_chars',
      CLIENT_URL: 'http://localhost:5173',
      AI_SERVICE_BASE_URL: 'http://localhost:5001',
      AI_SERVICE_API_KEY: 'valid_secure_random_key_length_32_chars_ok',
      ERP_SERVICE_API_KEY: 'valid_secure_random_key_length_32_chars_ok',
      ALLOWED_ORIGINS: 'http://localhost:5173'
    };

    const result = checkEnv(shortSecretEnv, { exitOnError: false, silent: true });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('JWT_SECRET must be at least 32 characters'))).toBe(true);
  });

  test('succeeds with fully compliant production environment config', () => {
    const validEnv = {
      MONGO_URI: 'mongodb://localhost:27017/production_db',
      JWT_SECRET: 'a_very_secure_and_cryptographically_strong_random_jwt_secret_123456789',
      CLIENT_URL: 'http://localhost:5173',
      AI_SERVICE_BASE_URL: 'http://localhost:5001',
      AI_SERVICE_API_KEY: 'sec_f84b1e92d7c04a3e819a6d4e2c71095b',
      ERP_SERVICE_API_KEY: 'erp_srv_9c18d4e7f603a152b820e981c472d03a',
      ALLOWED_ORIGINS: 'http://localhost:5173,http://localhost:3000'
    };

    const result = checkEnv(validEnv, { exitOnError: false, silent: true });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
