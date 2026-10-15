const mongoose = require('mongoose');
const { getDBStatus } = require('../config/db');

const NotificationLogSchema = new mongoose.Schema({
  event_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  idempotency_key: {
    type: String,
    index: true
  },
  event_type: {
    type: String,
    required: true,
    enum: ['parent_alert', 'mentor_alert', 'meeting_request_created', 'meeting_status_changed', 'risk_high_detected']
  },
  student_id: {
    type: String,
    default: ''
  },
  mentor_id: {
    type: String,
    default: ''
  },
  college_id: {
    type: String,
    default: 'C101'
  },
  channel: {
    type: String,
    enum: ['n8n', 'smtp_fallback', 'dry-run'],
    default: 'n8n'
  },
  recipient: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['queued', 'sent', 'failed'],
    default: 'queued'
  },
  error: {
    type: String,
    default: null
  },
  sentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const MongoNotificationLog = mongoose.model('NotificationLog', NotificationLogSchema);

// In-memory fallback map when Mongo is offline
const inMemoryNotificationLogs = new Map();

const NotificationLogStore = {
  async createLog(data) {
    if (getDBStatus()) {
      return await MongoNotificationLog.create(data);
    }
    const doc = {
      ...data,
      _id: data.event_id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryNotificationLogs.set(data.event_id, doc);
    return doc;
  },

  async findByIdempotencyKey(key) {
    if (!key) return null;
    if (getDBStatus()) {
      return await MongoNotificationLog.findOne({ idempotency_key: key });
    }
    for (const log of inMemoryNotificationLogs.values()) {
      if (log.idempotency_key === key) return log;
    }
    return null;
  },

  async updateLog(event_id, updates) {
    if (getDBStatus()) {
      return await MongoNotificationLog.findOneAndUpdate(
        { event_id },
        { $set: updates, updatedAt: new Date() },
        { new: true }
      );
    }
    const doc = inMemoryNotificationLogs.get(event_id);
    if (!doc) return null;
    Object.assign(doc, updates, { updatedAt: new Date() });
    inMemoryNotificationLogs.set(event_id, doc);
    return doc;
  },

  async findByStudent(student_id) {
    if (getDBStatus()) {
      return await MongoNotificationLog.find({ student_id }).sort({ createdAt: -1 });
    }
    return Array.from(inMemoryNotificationLogs.values())
      .filter(l => l.student_id === student_id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  clearInMemory() {
    inMemoryNotificationLogs.clear();
  }
};

module.exports = {
  MongoNotificationLog,
  NotificationLogStore,
  inMemoryNotificationLogs
};
