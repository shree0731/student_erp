const mongoose = require('mongoose');

const mentorNoteSchema = new mongoose.Schema({
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
  note: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 2000
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MentorNote', mentorNoteSchema);
