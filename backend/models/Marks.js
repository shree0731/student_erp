const mongoose = require('mongoose');

const MarksSchema = new mongoose.Schema({
  student_id: { type: String, required: true, index: true },
  semester: { type: Number, required: true, index: true },
  subject_name: { type: String, required: true, index: true },
  subject_type: { type: String, enum: ['Theory', 'Laboratory', 'Project', 'Internship'], required: true },
  credits: { type: Number, required: true },
  assignment_1_marks: { type: Number, required: true },
  assignment_2_marks: { type: Number, required: true },
  internal_exam_1_marks: { type: Number, required: true },
  internal_exam_2_marks: { type: Number, required: true },
  external_exam_marks: { type: Number, required: true },
  total_marks: { type: Number, required: true },
  grade_point: { type: Number, required: true },
  result: { type: String, enum: ['Pass', 'Arrear'], required: true, index: true }
}, {
  timestamps: true
});

// Compound index for fast student semester lookups
MarksSchema.index({ student_id: 1, semester: 1 });
MarksSchema.index({ student_id: 1, result: 1 });

module.exports = mongoose.model('Marks', MarksSchema);
