/**
 * Database Seeder Script
 * Loads data/curriculum.json, data/faculty.csv, data/students.csv, and data/marks.csv into MongoDB.
 *
 * Usage:
 *   node scripts/seedDb.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dns = require('dns');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('[SeedDB] Custom DNS setup failed, using system defaults:', dnsErr.message);
}

const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Marks = require('../models/Marks');
const Curriculum = require('../models/Curriculum');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '../../data');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_dropout_erp';

async function parseCsvFast(filePath, rowTransformer) {
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let headers = null;
  const rows = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    // Simple CSV split handling commas outside quotes
    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const cleanedCols = cols.map(c => c.trim().replace(/^"|"$/g, ''));

    if (!headers) {
      headers = cleanedCols;
      continue;
    }

    const rowObj = {};
    headers.forEach((h, i) => {
      rowObj[h] = cleanedCols[i];
    });

    rows.push(rowTransformer ? rowTransformer(rowObj) : rowObj);
  }

  return rows;
}

async function seedDatabase() {
  console.log(`Connecting to MongoDB at: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI, { dbName: 'student_dropout_erp' });
  console.log('Connected to MongoDB.');

  try {
    // 0. Seed Demo Users for Authentication
    console.log('\n[0/4] Seeding Demo User accounts for Authentication...');
    await User.deleteMany({});
    const demoPassword = process.env.DEMO_PASSWORD || crypto.randomBytes(6).toString('hex');
    const demoHash = await bcrypt.hash(demoPassword, 10);
    const demoUsers = [
      {
        username: 'admin',
        role: 'admin',
        linkedId: 'ADMIN_CHIEF_01',
        name: 'Academic Dean Office',
        department: 'Central Administration',
        college_id: 'C101',
        passwordHash: demoHash
      },
      {
        username: 'mentor',
        role: 'mentor',
        linkedId: 'FAC_MIST_IT_333',
        name: 'Dr. Sudha Rajagopalan',
        department: 'IT',
        college_id: 'C103',
        passwordHash: demoHash
      },
      {
        username: 'student',
        role: 'student',
        linkedId: 'STU_MIST_IT_Y3_5559',
        name: 'Bhoomika Gowda',
        department: 'IT',
        college_id: 'C103',
        passwordHash: demoHash
      },
      {
        username: 'student2',
        role: 'student',
        linkedId: 'STU_MIST_IT_Y4_5573',
        name: 'Vasanth Balasubramanian',
        department: 'IT',
        college_id: 'C103',
        passwordHash: demoHash
      },
      {
        username: 'student3',
        role: 'student',
        linkedId: 'STU_MIST_IT_Y3_5514',
        name: 'Sahana Hegde',
        department: 'IT',
        college_id: 'C103',
        passwordHash: demoHash
      }
    ];
    await User.insertMany(demoUsers);
    console.log(`✓ Seeded ${demoUsers.length} User accounts.`);
    if (process.env.DEMO_PASSWORD) {
      console.log(`  Password configured from DEMO_PASSWORD env variable.`);
    } else {
      console.log(`  Generated one-time demo password for all seeded accounts: ${demoPassword}`);
    }

    // 1. Seed Curriculum
    console.log('\n[1/4] Seeding Curriculum collection...');
    await Curriculum.deleteMany({});
    const curriculumRaw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'curriculum.json'), 'utf-8'));
    await Curriculum.insertMany(curriculumRaw);
    console.log(`✓ Seeded ${curriculumRaw.length} curriculum courses.`);

    // 2. Seed Faculty
    console.log('\n[2/4] Seeding Faculty collection...');
    await Faculty.deleteMany({});
    const facultyRows = await parseCsvFast(path.join(DATA_DIR, 'faculty.csv'), row => ({
      faculty_id: row.faculty_id,
      name: row.name,
      department: row.department,
      designation: row.designation,
      email: row.email,
      years_of_experience: Number(row.years_of_experience),
      college_id: row.college_id,
      assigned_students_count: Number(row.assigned_students_count || 0)
    }));
    await Faculty.insertMany(facultyRows);
    console.log(`✓ Seeded ${facultyRows.length} faculty mentors.`);

    // 3. Seed Students
    console.log('\n[3/4] Seeding Students collection...');
    await Student.deleteMany({});
    const studentRows = await parseCsvFast(path.join(DATA_DIR, 'students.csv'), row => {
      let trendArray = [];
      try {
        trendArray = JSON.parse(row.monthly_attendance_trend || '[]');
      } catch (e) {
        trendArray = [];
      }

      return {
        student_id: row.student_id,
        student_name: row.student_name,
        college_id: row.college_id,
        college_name: row.college_name,
        department: row.department,
        year_of_study: Number(row.year_of_study),
        current_semester: Number(row.current_semester),
        section: row.section,
        gender: row.gender,
        home_state: row.home_state,
        board_of_education: row.board_of_education,
        community: row.community,
        first_gen_learner: Number(row.first_gen_learner),
        family_income_annual: Number(row.family_income_annual),
        hosteller: Number(row.hosteller),
        distance_from_home_km: Number(row.distance_from_home_km),
        admission_quota: row.admission_quota,
        cutoff_mark_200: Number(row.cutoff_mark_200),
        attendance_pct: Number(row.attendance_pct),
        monthly_attendance_trend: trendArray,
        mentor_meetings_attended: Number(row.mentor_meetings_attended),
        scholarship: Number(row.scholarship),
        extracurricular_score: Number(row.extracurricular_score),
        library_usage_score: Number(row.library_usage_score),
        placement_training_score: Number(row.placement_training_score),
        internship_done: Number(row.internship_done),
        overall_gpa: Number(row.overall_gpa),
        backlogs_count: Number(row.backlogs_count),
        arrears_cleared: Number(row.arrears_cleared),
        low_attendance_flag: Number(row.low_attendance_flag),
        dropout_risk_score: Number(row.dropout_risk_score),
        dropout_risk_label: row.dropout_risk_label,
        mentor_id: row.mentor_id
      };
    });

    // Batch insert students in chunks of 2,000
    for (let i = 0; i < studentRows.length; i += 2000) {
      const chunk = studentRows.slice(i, i + 2000);
      await Student.insertMany(chunk, { ordered: false });
      console.log(`  Inserted students ${i + 1} to ${Math.min(i + 2000, studentRows.length)}...`);
    }
    console.log(`✓ Seeded ${studentRows.length} student records.`);

    // 4. Seed Marks (Stream & batch insert for ~352k records)
    console.log('\n[4/4] Seeding Marks collection (~352k rows, streaming batch inserts)...');
    await Marks.deleteMany({});

    const fileStream = fs.createReadStream(path.join(DATA_DIR, 'marks.csv'), { encoding: 'utf-8' });
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let headers = null;
    let batch = [];
    let totalMarksInserted = 0;
    const BATCH_SIZE = 5000;

    for await (const line of rl) {
      if (!line.trim()) continue;
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      const cleaned = cols.map(c => c.trim().replace(/^"|"$/g, ''));

      if (!headers) {
        headers = cleaned;
        continue;
      }

      batch.push({
        student_id: cleaned[0],
        semester: Number(cleaned[1]),
        subject_name: cleaned[2],
        subject_type: cleaned[3],
        credits: Number(cleaned[4]),
        assignment_1_marks: Number(cleaned[5]),
        assignment_2_marks: Number(cleaned[6]),
        internal_exam_1_marks: Number(cleaned[7]),
        internal_exam_2_marks: Number(cleaned[8]),
        external_exam_marks: Number(cleaned[9]),
        total_marks: Number(cleaned[10]),
        grade_point: Number(cleaned[11]),
        result: cleaned[12]
      });

      if (batch.length >= BATCH_SIZE) {
        await Marks.insertMany(batch, { ordered: false });
        totalMarksInserted += batch.length;
        process.stdout.write(`  Inserted ${totalMarksInserted} marks records...\r`);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await Marks.insertMany(batch, { ordered: false });
      totalMarksInserted += batch.length;
    }
    console.log(`\n✓ Seeded ${totalMarksInserted} marks records.`);

    console.log('\n=== SEEDING COMPLETED SUCCESSFULLY ===');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
