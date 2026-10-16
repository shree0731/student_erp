const mongoose = require('mongoose');
const { getDBStatus } = require('../config/db');

const AssessmentSchema = new mongoose.Schema({
  assessment_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  student_id: {
    type: String,
    required: true,
    index: true
  },
  mentor_id: {
    type: String,
    required: true,
    index: true
  },
  college_id: {
    type: String,
    required: true,
    index: true
  },
  features: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  prediction: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true,
    index: true
  },
  probabilities: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  top_risk_drivers: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  explanation_method: {
    type: String,
    default: 'shap_tree_explainer'
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

const MongoAssessment = mongoose.model('Assessment', AssessmentSchema);

const inMemoryAssessments = new Map();

const AssessmentStore = {
  async create(data) {
    const docData = {
      ...data,
      created_at: data.created_at || new Date(),
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date()
    };

    if (getDBStatus()) {
      return await MongoAssessment.create(docData);
    }

    inMemoryAssessments.set(docData.assessment_id, docData);
    return docData;
  },

  async findByStudentId(student_id) {
    if (getDBStatus()) {
      return await MongoAssessment.find({ student_id }).sort({ created_at: -1 });
    }

    return Array.from(inMemoryAssessments.values())
      .filter(a => a.student_id === student_id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async findById(assessment_id) {
    if (getDBStatus()) {
      return await MongoAssessment.findOne({ assessment_id });
    }

    return inMemoryAssessments.get(assessment_id) || null;
  },

  clearInMemory() {
    inMemoryAssessments.clear();
  }
};

module.exports = {
  MongoAssessment,
  AssessmentStore,
  inMemoryAssessments
};
