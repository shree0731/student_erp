const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  faculty_id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  department: { type: String, required: true, index: true },
  designation: { type: String, required: true },
  email: { type: String, required: true },
  years_of_experience: { type: Number, required: true },
  college_id: { type: String, required: true, index: true },
  assigned_students_count: { type: Number, default: 0 }
}, {
  timestamps: true
});

FacultySchema.index({ department: 1, college_id: 1 });

module.exports = mongoose.model('Faculty', FacultySchema);
