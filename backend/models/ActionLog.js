const mongoose = require('mongoose');
const { getDBStatus } = require('../config/db');

const ActionLogSchema = new mongoose.Schema({
  assessment_id: {
    type: String,
    required: true,
    index: true
  },
  student_id: {
    type: String,
    default: '',
    index: true
  },
  step: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['ok', 'failed', 'skipped'],
    required: true
  },
  detail: {
    type: String,
    default: ''
  },
  at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

const MongoActionLog = mongoose.model('ActionLog', ActionLogSchema);

const inMemoryActionLogs = [];

const ActionLogStore = {
  async create(data) {
    const docData = {
      ...data,
      at: data.at || new Date(),
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date()
    };

    if (getDBStatus()) {
      return await MongoActionLog.create(docData);
    }

    inMemoryActionLogs.push(docData);
    return docData;
  },

  async findByAssessmentId(assessment_id) {
    if (getDBStatus()) {
      return await MongoActionLog.find({ assessment_id }).sort({ at: 1 });
    }

    return inMemoryActionLogs
      .filter(l => l.assessment_id === assessment_id)
      .sort((a, b) => new Date(a.at) - new Date(b.at));
  },

  async findByStudentId(student_id) {
    if (getDBStatus()) {
      return await MongoActionLog.find({ student_id }).sort({ at: -1 });
    }

    return inMemoryActionLogs
      .filter(l => l.student_id === student_id)
      .sort((a, b) => new Date(b.at) - new Date(a.at));
  },

  clearInMemory() {
    inMemoryActionLogs.length = 0;
  }
};

module.exports = {
  MongoActionLog,
  ActionLogStore,
  inMemoryActionLogs
};
