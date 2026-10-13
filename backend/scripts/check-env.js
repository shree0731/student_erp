/**
 * ERP Backend Environment Integrity Checker
 * Verifies that all required environment variables are present, sufficiently secure,
 * and not set to insecure default placeholders.
 */

const path = require('path');
const dotenv = require('dotenv');

// Load .env from backend root if not already loaded
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const FORBIDDEN_PLACEHOLDER_SUBSTRINGS = [
  'change_me',
  'changeme',
  'your_jwt_secret',
  'your_secret',
  'replace_with_',
  'replace_me',
  'example',
  'default_key',
  'secret123'
];

function isPlaceholder(val) {
  if (typeof val !== 'string') return true;
  const lower = val.toLowerCase().trim();
  return FORBIDDEN_PLACEHOLDER_SUBSTRINGS.some(ph => lower.includes(ph));
}

function checkEnv(env = process.env, options = { exitOnError: true, silent: false }) {
  const errors = [];

  // 1. MONGO_URI
  if (!env.MONGO_URI || !env.MONGO_URI.trim()) {
    errors.push('MONGO_URI is missing or empty.');
  } else if (!env.MONGO_URI.startsWith('mongodb://') && !env.MONGO_URI.startsWith('mongodb+srv://')) {
    errors.push('MONGO_URI must be a valid connection string starting with mongodb:// or mongodb+srv://');
  } else {
    const dbMatch = env.MONGO_URI.match(/\/([^/?]+)(\?|$)/);
    const dbName = dbMatch ? dbMatch[1] : '';
    if (dbName === 'ai_dropout_prediction') {
      errors.push("MONGO_URI cannot point to 'ai_dropout_prediction'. ERP backend must use 'student_dropout_erp'.");
    }
  }

  // 1b. APP_DB_ROLE
  if (env.APP_DB_ROLE && env.APP_DB_ROLE !== 'erp') {
    errors.push(`APP_DB_ROLE must be 'erp' for ERP backend (found: '${env.APP_DB_ROLE}').`);
  }

  // 2. JWT_SECRET
  if (!env.JWT_SECRET || !env.JWT_SECRET.trim()) {
    errors.push('JWT_SECRET is required and cannot be empty.');
  } else if (env.JWT_SECRET.length < 32) {
    errors.push(`JWT_SECRET must be at least 32 characters long (current length: ${env.JWT_SECRET.length}).`);
  } else if (isPlaceholder(env.JWT_SECRET)) {
    errors.push('JWT_SECRET contains an insecure placeholder phrase.');
  }

  // 3. CLIENT_URL
  if (!env.CLIENT_URL || !env.CLIENT_URL.trim()) {
    errors.push('CLIENT_URL is missing (e.g. http://localhost:5173).');
  } else if (!/^https?:\/\//i.test(env.CLIENT_URL)) {
    errors.push('CLIENT_URL must be a valid HTTP/HTTPS URL.');
  }

  // 4. AI_SERVICE_BASE_URL (or AI_SERVICE_URL)
  const aiServiceUrl = env.AI_SERVICE_BASE_URL || env.AI_SERVICE_URL;
  if (!aiServiceUrl || !aiServiceUrl.trim()) {
    errors.push('AI_SERVICE_BASE_URL (or AI_SERVICE_URL) is missing (e.g. http://localhost:5001).');
  } else if (!/^https?:\/\//i.test(aiServiceUrl)) {
    errors.push('AI_SERVICE_BASE_URL must be a valid HTTP/HTTPS URL.');
  }

  // 5. AI_SERVICE_API_KEY
  if (!env.AI_SERVICE_API_KEY || !env.AI_SERVICE_API_KEY.trim()) {
    errors.push('AI_SERVICE_API_KEY is required for communicating with the AI service.');
  } else if (env.AI_SERVICE_API_KEY.length < 32) {
    errors.push(`AI_SERVICE_API_KEY must be at least 32 characters long (current length: ${env.AI_SERVICE_API_KEY.length}).`);
  } else if (isPlaceholder(env.AI_SERVICE_API_KEY)) {
    errors.push('AI_SERVICE_API_KEY contains an insecure placeholder phrase.');
  }

  // 6. ERP_SERVICE_API_KEY
  if (!env.ERP_SERVICE_API_KEY || !env.ERP_SERVICE_API_KEY.trim()) {
    errors.push('ERP_SERVICE_API_KEY is required for authenticating incoming service-to-service requests.');
  } else if (env.ERP_SERVICE_API_KEY.length < 32) {
    errors.push(`ERP_SERVICE_API_KEY must be at least 32 characters long (current length: ${env.ERP_SERVICE_API_KEY.length}).`);
  } else if (isPlaceholder(env.ERP_SERVICE_API_KEY)) {
    errors.push('ERP_SERVICE_API_KEY contains an insecure placeholder phrase.');
  }

  // 7. ALLOWED_ORIGINS
  if (!env.ALLOWED_ORIGINS || !env.ALLOWED_ORIGINS.trim()) {
    errors.push('ALLOWED_ORIGINS is missing (e.g. http://localhost:5173,http://localhost:3000).');
  }

  const isValid = errors.length === 0;

  if (!isValid && !options.silent) {
    console.error('\n' + '='.repeat(80));
    console.error('CRITICAL CONFIGURATION ERROR (ERP Backend)');
    console.error('='.repeat(80));
    console.error('The server cannot start due to missing or insecure environment configuration:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nTo generate a cryptographically secure 32-byte secret, run:');
    console.error('  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    console.error('\nCopy .env.example to .env and configure all required variables before starting.');
    console.error('='.repeat(80) + '\n');
  }

  if (!isValid && options.exitOnError) {
    process.exit(1);
  }

  return { valid: isValid, errors };
}

if (require.main === module) {
  checkEnv(process.env, { exitOnError: true, silent: false });
  console.log('✓ ERP environment configuration verified successfully.');
}

module.exports = {
  checkEnv,
  FORBIDDEN_PLACEHOLDER_SUBSTRINGS
};
