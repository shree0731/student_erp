const mongoose = require('mongoose');
const { getDBStatus } = require('../config/db');

const OtpChallengeSchema = new mongoose.Schema({
  challenge_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  role: {
    type: String,
    required: true
  },
  linkedId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  college_id: {
    type: String,
    default: 'C101'
  },
  email: {
    type: String,
    default: ''
  },
  code_hash: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  resends: {
    type: Number,
    default: 0
  },
  last_sent_at: {
    type: Date,
    default: Date.now
  },
  expires_at: {
    type: Date,
    required: true
  },
  is_locked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// TTL index to automatically purge expired challenges from MongoDB
OtpChallengeSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const MongoOtpChallenge = mongoose.model('OtpChallenge', OtpChallengeSchema);

// In-memory fallback map when Mongo is offline
const inMemoryChallenges = new Map();

// Helper to cleanup expired in-memory challenges
function cleanupExpiredInMemory() {
  const now = new Date();
  for (const [key, doc] of inMemoryChallenges.entries()) {
    if (new Date(doc.expires_at) <= now) {
      inMemoryChallenges.delete(key);
    }
  }
}

/**
 * Universal Data Access Object for OtpChallenge
 */
const OtpChallengeStore = {
  async createChallenge(data) {
    if (getDBStatus()) {
      return await MongoOtpChallenge.create(data);
    }
    cleanupExpiredInMemory();
    const doc = {
      ...data,
      attempts: data.attempts || 0,
      resends: data.resends || 0,
      last_sent_at: data.last_sent_at || new Date(),
      is_locked: !!data.is_locked,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryChallenges.set(data.challenge_id, doc);
    return doc;
  },

  async findByChallengeId(challenge_id) {
    if (getDBStatus()) {
      return await MongoOtpChallenge.findOne({ challenge_id });
    }
    cleanupExpiredInMemory();
    const doc = inMemoryChallenges.get(challenge_id);
    if (!doc) return null;
    if (new Date(doc.expires_at) <= new Date()) {
      inMemoryChallenges.delete(challenge_id);
      return null;
    }
    return doc;
  },

  async updateChallenge(challenge_id, updates) {
    if (getDBStatus()) {
      return await MongoOtpChallenge.findOneAndUpdate(
        { challenge_id },
        { $set: updates, updatedAt: new Date() },
        { new: true }
      );
    }
    const doc = inMemoryChallenges.get(challenge_id);
    if (!doc) return null;
    Object.assign(doc, updates, { updatedAt: new Date() });
    inMemoryChallenges.set(challenge_id, doc);
    return doc;
  },

  async deleteChallenge(challenge_id) {
    if (getDBStatus()) {
      return await MongoOtpChallenge.deleteOne({ challenge_id });
    }
    inMemoryChallenges.delete(challenge_id);
    return { acknowledged: true, deletedCount: 1 };
  },

  clearInMemory() {
    inMemoryChallenges.clear();
  }
};

module.exports = {
  MongoOtpChallenge,
  OtpChallengeStore,
  inMemoryChallenges
};
