/**
 * Fallback CSV Data Provider
 * In-memory parser and cache of generated CSV datasets.
 * Ensures the Express API operates smoothly during evaluations even if local MongoDB is offline.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATA_DIR = path.join(__dirname, '../../data');

let cachedStudents = null;
let cachedFaculty = null;
let cachedMarks = null;
let cachedCurriculum = null;

async function loadCsv(filePath, transform) {
  if (!fs.existsSync(filePath)) return [];
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let headers = null;
  const rows = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const cleaned = cols.map(c => c.trim().replace(/^"|"$/g, ''));

    if (!headers) {
      headers = cleaned;
      continue;
    }

    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cleaned[i];
    });

    rows.push(transform ? transform(obj) : obj);
  }

  return rows;
}

async function getStudentsData() {
  if (cachedStudents) return cachedStudents;

  cachedStudents = await loadCsv(path.join(DATA_DIR, 'students.csv'), r => {
    let trend = [];
    try {
      trend = JSON.parse(r.monthly_attendance_trend || '[]');
    } catch (parseErr) {
      console.warn(`[CSVDataProvider] Could not parse trend for ${r.student_id}:`, parseErr.message);
      trend = [];
    }
    return {
      ...r,
      year_of_study: Number(r.year_of_study),
      current_semester: Number(r.current_semester),
      first_gen_learner: Number(r.first_gen_learner),
      family_income_annual: Number(r.family_income_annual),
      hosteller: Number(r.hosteller),
      distance_from_home_km: Number(r.distance_from_home_km),
      cutoff_mark_200: Number(r.cutoff_mark_200),
      attendance_pct: Number(r.attendance_pct),
      monthly_attendance_trend: trend,
      mentor_meetings_attended: Number(r.mentor_meetings_attended),
      scholarship: Number(r.scholarship),
      extracurricular_score: Number(r.extracurricular_score),
      library_usage_score: Number(r.library_usage_score),
      placement_training_score: Number(r.placement_training_score),
      internship_done: Number(r.internship_done),
      overall_gpa: Number(r.overall_gpa),
      backlogs_count: Number(r.backlogs_count),
      arrears_cleared: Number(r.arrears_cleared),
      low_attendance_flag: Number(r.low_attendance_flag),
      dropout_risk_score: Number(r.dropout_risk_score),
      home_state: r.home_state || 'Tamil Nadu',
      board_of_education: r.board_of_education || 'State Board (Tamil Nadu)'
    };
  });

  return cachedStudents;
}

async function getFacultyData() {
  if (cachedFaculty) return cachedFaculty;

  cachedFaculty = await loadCsv(path.join(DATA_DIR, 'faculty.csv'), r => ({
    ...r,
    years_of_experience: Number(r.years_of_experience),
    assigned_students_count: Number(r.assigned_students_count)
  }));

  return cachedFaculty;
}

async function getMarksForStudent(studentId, semester) {
  // If not cached, we can scan marks.csv for this student
  const studentMarks = [];
  const marksFile = path.join(DATA_DIR, 'marks.csv');
  if (!fs.existsSync(marksFile)) return [];

  const fileStream = fs.createReadStream(marksFile, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let headers = null;
  for await (const line of rl) {
    if (!line.trim()) continue;
    if (!headers) {
      headers = line.split(',').map(h => h.trim());
      continue;
    }

    if (line.startsWith(studentId + ',')) {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((h, i) => { row[h] = cols[i]; });

      const semNum = Number(row.semester);
      if (!semester || semNum === Number(semester)) {
        studentMarks.push({
          student_id: row.student_id,
          semester: semNum,
          subject_name: row.subject_name,
          subject_type: row.subject_type,
          credits: Number(row.credits),
          assignment_1_marks: Number(row.assignment_1_marks),
          assignment_2_marks: Number(row.assignment_2_marks),
          internal_exam_1_marks: Number(row.internal_exam_1_marks),
          internal_exam_2_marks: Number(row.internal_exam_2_marks),
          external_exam_marks: Number(row.external_exam_marks),
          total_marks: Number(row.total_marks),
          grade_point: Number(row.grade_point),
          result: row.result
        });
      }
    }
  }

  return studentMarks;
}

async function getCurriculumData() {
  if (cachedCurriculum) return cachedCurriculum;
  const currFile = path.join(DATA_DIR, 'curriculum.json');
  if (fs.existsSync(currFile)) {
    cachedCurriculum = JSON.parse(fs.readFileSync(currFile, 'utf-8'));
  }
  return cachedCurriculum || [];
}

async function addStudent(student) {
  if (!cachedStudents) {
    await getStudentsData();
  }
  if (!cachedStudents.some(s => s.student_id === student.student_id)) {
    cachedStudents.unshift(student);
  }
  return student;
}

module.exports = {
  getStudentsData,
  getFacultyData,
  getMarksForStudent,
  getCurriculumData,
  addStudent
};

