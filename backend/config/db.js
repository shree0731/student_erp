/**
 * Database Connection Module
 * Handles Mongoose connection to MongoDB with retry logic and graceful fallback.
 */

const dns = require('dns');
const mongoose = require('mongoose');

// Configure public DNS servers to resolve MongoDB Atlas SRV records reliably on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where custom DNS servers cannot be set
}

let isConnected = false;

function extractDbName(uri) {
  if (!uri || typeof uri !== 'string') return null;
  try {
    const cleanUri = uri.replace(/^mongodb(\+srv)?:\/\//, 'http://');
    const url = new URL(cleanUri);
    const pathname = url.pathname.replace(/^\//, '');
    if (pathname) return pathname.split('?')[0];
  } catch (e) {
    const match = uri.match(/\/([^/?]+)(\?|$)/);
    if (match) return match[1];
  }
  return null;
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/student_dropout_erp';
  const role = process.env.APP_DB_ROLE || 'erp';
  const dbName = extractDbName(uri) || 'student_dropout_erp';

  // Startup check: log the database name in use (never log credentials or full URI)
  console.log(`[Database] Role: ${role}, Active Database: ${dbName}`);

  // Refusal check: ERP service must not use the AI database or an AI role
  if (role !== 'erp') {
    throw new Error(`[Database Error] Refusing to start: Invalid APP_DB_ROLE '${role}' for ERP backend. Must be 'erp'.`);
  }
  if (dbName === 'ai_dropout_prediction') {
    throw new Error(`[Database Error] Refusing to start: ERP backend cannot use AI database 'ai_dropout_prediction'. Configure MONGO_URI with database 'student_dropout_erp'.`);
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB database '${dbName}'.`);
    console.warn(`[MongoDB Warning] Error: ${error.message}`);
    console.info(`[Info] Backend will operate in fallback mode using local dataset files if MongoDB is offline.`);
    return false;
  }
};

const getDBStatus = () => isConnected || mongoose.connection.readyState === 1;

module.exports = { connectDB, getDBStatus, extractDbName };
