const mongoose = require('mongoose');

const CurriculumSchema = new mongoose.Schema({
  Subject: { type: String, required: true },
  Subject_Type: { type: String, enum: ['Theory', 'Laboratory', 'Project', 'Internship'], required: true },
  Credits: { type: Number, required: true },
  Semester: { type: Number, required: true, index: true },
  Branch: { type: String, required: true, index: true }
}, {
  timestamps: true
});

CurriculumSchema.index({ Branch: 1, Semester: 1 });

module.exports = mongoose.model('Curriculum', CurriculumSchema);
