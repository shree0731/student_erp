const mongoose = require('mongoose');

const MeetingRequestSchema = new mongoose.Schema({
  request_id: {
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
  student_name: {
    type: String,
    default: ''
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
  category: {
    type: String,
    enum: ['meeting', 'academic', 'crisis'],
    default: 'meeting',
    index: true
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent'],
    default: 'normal',
    index: true
  },
  reason_short: {
    type: String,
    required: true,
    maxlength: 200
  },
  status: {
    type: String,
    enum: ['new', 'acknowledged', 'scheduled', 'resolved', 'cancelled'],
    default: 'new',
    index: true
  },
  scheduled_at: {
    type: Date,
    default: null
  },
  mentor_note: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

MeetingRequestSchema.index({ mentor_id: 1, urgency: -1, createdAt: -1 });
MeetingRequestSchema.index({ student_id: 1, createdAt: -1 });

module.exports = mongoose.model('MeetingRequest', MeetingRequestSchema, 'meeting_requests');
