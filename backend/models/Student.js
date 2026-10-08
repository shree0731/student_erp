const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  student_id: { type: String, required: true, unique: true, index: true },
  student_name: { type: String, required: true },
  college_id: { type: String, required: true, index: true },
  college_name: { type: String, required: true },
  department: { type: String, required: true, index: true },
  year_of_study: { type: Number, required: true, index: true },
  current_semester: { type: Number, required: true },
  section: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  home_state: { type: String, required: true },
  board_of_education: { type: String, required: true },
  community: { type: String, enum: ['OC', 'BC', 'MBC', 'SC', 'ST'], required: true },
  first_gen_learner: { type: Number, enum: [0, 1], required: true },
  family_income_annual: { type: Number, required: true },
  hosteller: { type: Number, enum: [0, 1], required: true },
  distance_from_home_km: { type: Number, required: true },
  admission_quota: { type: String, enum: ['Government', 'Management', 'All India Merit', 'NRI'], required: true },
  cutoff_mark_200: { type: Number, required: true },
  attendance_pct: { type: Number, required: true },
  // Nested array of historical monthly attendance percentages as specified in Task 3a
  monthly_attendance_trend: [{ type: Number }],
  mentor_meetings_attended: { type: Number, default: 0 },
  scholarship: { type: Number, enum: [0, 1], default: 0 },
  extracurricular_score: { type: Number, default: 0 },
  library_usage_score: { type: Number, default: 0 },
  placement_training_score: { type: Number, default: 0 },
  internship_done: { type: Number, enum: [0, 1], default: 0 },
  overall_gpa: { type: Number, required: true },
  backlogs_count: { type: Number, required: true },
  arrears_cleared: { type: Number, default: 0 },
  low_attendance_flag: { type: Number, enum: [0, 1], required: true, index: true },
  dropout_risk_score: { type: Number, required: true },
  dropout_risk_label: { type: String, enum: ['Low', 'Medium', 'High'], required: true, index: true },
  mentor_id: { type: String, required: true, index: true }
}, {
  timestamps: true
});

StudentSchema.index({ department: 1, year_of_study: 1, college_id: 1 });
StudentSchema.index({ home_state: 1 });

module.exports = mongoose.model('Student', StudentSchema);
