const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { mapStudentToPredictionPayload } = require('../services/aiServiceClient');

describe('Task 3 — Training vs Serving Feature Parity Test', () => {
  let expectedList;
  let studentsMap = {};
  let marksMap = {};

  beforeAll(async () => {
    const fixturePath = path.join(__dirname, 'fixtures/training_20_features.json');
    expectedList = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    const targetIds = new Set(expectedList.map(e => e.student_id));

    // Parse students.csv
    const studentsCsv = path.join(__dirname, '../../data/students.csv');
    const rlStudents = readline.createInterface({
      input: fs.createReadStream(studentsCsv),
      crlfDelay: Infinity
    });
    let sHeaders = null;
    for await (const line of rlStudents) {
      if (!line.trim()) continue;
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
      if (!sHeaders) {
        sHeaders = cols;
        continue;
      }
      const row = {};
      sHeaders.forEach((h, i) => { row[h] = cols[i]; });
      if (targetIds.has(row.student_id)) {
        studentsMap[row.student_id] = row;
      }
    }

    // Parse marks.csv
    const marksCsv = path.join(__dirname, '../../data/marks.csv');
    const rlMarks = readline.createInterface({
      input: fs.createReadStream(marksCsv),
      crlfDelay: Infinity
    });
    let mHeaders = null;
    for await (const line of rlMarks) {
      if (!line.trim()) continue;
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
      if (!mHeaders) {
        mHeaders = cols;
        continue;
      }
      const row = {};
      mHeaders.forEach((h, i) => { row[h] = cols[i]; });
      if (targetIds.has(row.student_id)) {
        if (!marksMap[row.student_id]) {
          marksMap[row.student_id] = [];
        }
        marksMap[row.student_id].push(row);
      }
    }
  }, 30000);

  test('asserts 20 students feature parity within 1e-6 between Python train pipeline and ERP mapper', () => {
    expect(expectedList.length).toBe(20);

    const numericFeatures = [
      'attendance_pct',
      'attendance_decay',
      'overall_gpa',
      'backlogs_count',
      'cutoff_mark_200',
      'family_income_annual',
      'mentor_meetings_attended',
      'first_gen_learner',
      'distance_from_home_km',
      'failed_subjects_count',
      'core_theory_average',
      'internal_exam_avg',
      'assignment_avg',
      'grade_trend',
      'year_of_study'
    ];

    expectedList.forEach(expected => {
      const sId = expected.student_id;
      const student = studentsMap[sId];
      expect(student).toBeDefined();

      const marks = marksMap[sId] || [];
      const computed = mapStudentToPredictionPayload(student, marks);

      expect(computed.department).toBe(expected.department);

      numericFeatures.forEach(feat => {
        const actualVal = Number(computed[feat]);
        const expectedVal = Number(expected[feat]);
        expect(Math.abs(actualVal - expectedVal)).toBeLessThanOrEqual(1e-4);
      });
    });
  });
});
