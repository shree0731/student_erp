const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('[VerifyDB] Custom DNS setup failed, using system defaults:', dnsErr.message);
}
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function verify() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'student_dropout_erp' });
  const Student = require('../models/Student');
  const Faculty = require('../models/Faculty');
  const Marks = require('../models/Marks');
  const Curriculum = require('../models/Curriculum');

  console.log('=== COLLECTION COUNTS ===');
  const sCount = await Student.countDocuments();
  const fCount = await Faculty.countDocuments();
  const mCount = await Marks.countDocuments();
  const cCount = await Curriculum.countDocuments();
  console.log('Students:', sCount);
  console.log('Faculty:', fCount);
  console.log('Marks:', mCount);
  console.log('Curriculum:', cCount);

  console.log('\n=== DISTINCT COLLEGES ===');
  const colleges = await Student.distinct('college_id');
  console.log('Colleges count:', colleges.length, colleges);

  console.log('\n=== DISTINCT DEPARTMENTS ===');
  const depts = await Student.distinct('department');
  console.log('Departments count:', depts.length, depts);

  console.log('\n=== RISK DISTRIBUTION ===');
  const riskAgg = await Student.aggregate([
    { $group: { _id: '$dropout_risk_label', count: { $sum: 1 } } }
  ]);
  riskAgg.forEach(r => {
    console.log(`${r._id}: ${r.count} (${((r.count / sCount) * 100).toFixed(2)}%)`);
  });

  console.log('\n=== SPOT CHECK 4 STUDENTS ===');
  const sample = await Student.find().limit(4).select('student_id student_name college_id department home_state board_of_education admission_quota');
  console.log(JSON.stringify(sample, null, 2));

  console.log('\n=== C104 PAN-INDIA SPOT CHECK ===');
  const c104Sample = await Student.find({ college_id: 'C104', home_state: { $ne: 'Tamil Nadu' } })
    .limit(4)
    .select('student_id student_name college_id home_state board_of_education admission_quota');
  console.log(JSON.stringify(c104Sample, null, 2));

  await mongoose.disconnect();
}

verify().catch(console.error);
