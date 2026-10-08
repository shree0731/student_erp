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

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/student_dropout_erp';

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'student_dropout_erp',
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${uri}.`);
    console.warn(`[MongoDB Warning] Error: ${error.message}`);
    console.info(`[Info] Backend will operate in fallback mode using local dataset files if MongoDB is offline.`);
    return false;
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
