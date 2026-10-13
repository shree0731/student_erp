import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  BookOpen,
  ArrowLeft,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  GraduationCap,
  Sparkles
} from 'lucide-react';

const FALLBACK_MARKS = [
  // Semester 1
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 1, subject_name: 'HS3152 - Professional English I', subject_type: 'Theory', credits: 3, assignment_1_marks: 9, assignment_2_marks: 8, internal_exam_1_marks: 38, internal_exam_2_marks: 40, external_exam_marks: 72, total_marks: 74, grade_point: 8, result: 'Pass' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 1, subject_name: 'MA3151 - Matrices and Calculus', subject_type: 'Theory', credits: 4, assignment_1_marks: 7, assignment_2_marks: 8, internal_exam_1_marks: 24, internal_exam_2_marks: 28, external_exam_marks: 54, total_marks: 56, grade_point: 6, result: 'Pass' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 1, subject_name: 'PH3151 - Engineering Physics', subject_type: 'Theory', credits: 3, assignment_1_marks: 8, assignment_2_marks: 8, internal_exam_1_marks: 35, internal_exam_2_marks: 37, external_exam_marks: 68, total_marks: 70, grade_point: 7, result: 'Pass' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 1, subject_name: 'GE3151 - Problem Solving and Python Programming', subject_type: 'Theory', credits: 3, assignment_1_marks: 9, assignment_2_marks: 9, internal_exam_1_marks: 39, internal_exam_2_marks: 42, external_exam_marks: 76, total_marks: 78, grade_point: 8, result: 'Pass' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 1, subject_name: 'BS3171 - Physics and Chemistry Laboratory', subject_type: 'Practical', credits: 2, assignment_1_marks: 10, assignment_2_marks: 10, internal_exam_1_marks: 45, internal_exam_2_marks: 47, external_exam_marks: 88, total_marks: 89, grade_point: 9, result: 'Pass' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 1, subject_name: 'GE3171 - Python Programming Laboratory', subject_type: 'Practical', credits: 2, assignment_1_marks: 10, assignment_2_marks: 10, internal_exam_1_marks: 46, internal_exam_2_marks: 48, external_exam_marks: 90, total_marks: 91, grade_point: 9, result: 'Pass' },

  // Semester 2
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 2, subject_name: 'MA3251 - Statistics and Numerical Methods', subject_type: 'Theory', credits: 4, assignment_1_marks: 7, assignment_2_marks: 7, internal_exam_1_marks: 28, internal_exam_2_marks: 30, external_exam_marks: 58, total_marks: 60, grade_point: 6, result: 'Pass' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 2, subject_name: 'PH3256 - Physics for Information Science', subject_type: 'Theory', credits: 3, assignment_1_marks: 8, assignment_2_marks: 8, internal_exam_1_marks: 33, internal_exam_2_marks: 35, external_exam_marks: 65, total_marks: 67, grade_point: 7, result: 'Pass' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 2, subject_name: 'BE3251 - Basic Electrical and Electronics Engineering', subject_type: 'Theory', credits: 3, assignment_1_marks: 8, assignment_2_marks: 7, internal_exam_1_marks: 31, internal_exam_2_marks: 33, external_exam_marks: 62, total_marks: 64, grade_point: 7, result: 'Pass' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 2, subject_name: 'CS3251 - Programming in C', subject_type: 'Theory', credits: 3, assignment_1_marks: 9, assignment_2_marks: 9, internal_exam_1_marks: 36, internal_exam_2_marks: 38, external_exam_marks: 71, total_marks: 73, grade_point: 8, result: 'Pass' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 2, subject_name: 'GE3251 - Engineering Graphics', subject_type: 'Theory', credits: 4, assignment_1_marks: 7, assignment_2_marks: 7, internal_exam_1_marks: 27, internal_exam_2_marks: 29, external_exam_marks: 55, total_marks: 57, grade_point: 6, result: 'Pass' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 2, subject_name: 'CS3271 - Programming in C Laboratory', subject_type: 'Practical', credits: 1.5, assignment_1_marks: 10, assignment_2_marks: 9, internal_exam_1_marks: 43, internal_exam_2_marks: 46, external_exam_marks: 87, total_marks: 88, grade_point: 9, result: 'Pass' },

  // Semester 3
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 3, subject_name: 'MA3354 - Discrete Mathematics', subject_type: 'Theory', credits: 4, assignment_1_marks: 5, assignment_2_marks: 6, internal_exam_1_marks: 18, internal_exam_2_marks: 22, external_exam_marks: 40, total_marks: 42, grade_point: 0, result: 'Arrear' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 3, subject_name: 'CS3301 - Data Structures', subject_type: 'Theory', credits: 3, assignment_1_marks: 8, assignment_2_marks: 8, internal_exam_1_marks: 31, internal_exam_2_marks: 34, external_exam_marks: 63, total_marks: 65, grade_point: 7, result: 'Pass' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 3, subject_name: 'CS3351 - Digital Principles & Computer Organization', subject_type: 'Theory', credits: 4, assignment_1_marks: 5, assignment_2_marks: 6, internal_exam_1_marks: 19, internal_exam_2_marks: 23, external_exam_marks: 43, total_marks: 45, grade_point: 0, result: 'Arrear' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 3, subject_name: 'CS3391 - Object Oriented Programming', subject_type: 'Theory', credits: 3, assignment_1_marks: 9, assignment_2_marks: 9, internal_exam_1_marks: 37, internal_exam_2_marks: 39, external_exam_marks: 73, total_marks: 75, grade_point: 8, result: 'Pass' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 3, subject_name: 'CS3311 - Data Structures Laboratory', subject_type: 'Practical', credits: 1.5, assignment_1_marks: 10, assignment_2_marks: 9, internal_exam_1_marks: 44, internal_exam_2_marks: 46, external_exam_marks: 88, total_marks: 89, grade_point: 9, result: 'Pass' },
  { student_id: 'STU_EEC_CSE_Y2_0001', semester: 3, subject_name: 'CS3361 - Object Oriented Programming Laboratory', subject_type: 'Practical', credits: 1.5, assignment_1_marks: 10, assignment_2_marks: 10, internal_exam_1_marks: 45, internal_exam_2_marks: 47, external_exam_marks: 90, total_marks: 91, grade_point: 9, result: 'Pass' }
];

export default function StudentMarks() {
  const { currentUser } = useAuth();
  const [marks, setMarks] = useState([]);
  const [selectedSem, setSelectedSem] = useState(3);
  const [availableSems, setAvailableSems] = useState([1, 2, 3]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMarks() {
      setLoading(true);
      try {
        const studentId = currentUser?.id || 'STU_EEC_CSE_Y2_0001';
        const res = await api.getStudentMarks(studentId);
        const data = (res && res.data && res.data.length > 0) ? res.data : FALLBACK_MARKS;
        setMarks(data);

        // Find available semesters
        const sems = [...new Set(data.map(m => m.semester))].sort((a, b) => a - b);
        if (sems.length > 0) {
          setAvailableSems(sems);
          setSelectedSem(sems[sems.length - 1]); // Default to latest semester
        }
      } catch (err) {
        console.error('Failed to load marks from API, using fallback:', err);
        setMarks(FALLBACK_MARKS);
        setAvailableSems([1, 2, 3]);
        setSelectedSem(3);
      } finally {
        setLoading(false);
      }
    }

    loadMarks();
  }, [currentUser?.id]);

  const semMarks = marks.filter(m => m.semester === selectedSem);

  // Compute semester aggregates
  const semCredits = semMarks.reduce((acc, m) => acc + (m.credits || 0), 0);
  const semPoints = semMarks.reduce((acc, m) => acc + ((m.grade_point || 0) * (m.credits || 0)), 0);
  const semGpa = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : '0.00';
  const arrearsCount = semMarks.filter(m => m.result === 'Arrear').length;
  const passedCount = semMarks.filter(m => m.result === 'Pass').length;

  return (
    <div className="page-body">
      
      {/* Header & Back Link */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link
            to="/student/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '0.4rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Academic Portal</span>
          </Link>
          <h1 style={{ fontSize: '1.55rem', fontWeight: '800', color: 'var(--dark)', margin: '0 0 0.25rem' }}>
            Subject-Wise Academic Transcript &amp; CIA Marks
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.84rem', margin: 0 }}>
            Continuous Internal Assessment (CIA) performance, university external marks, and Anna University credit ratings.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-light-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem', fontWeight: '700' }}>
            Reg: {currentUser?.id || 'STU_EEC_CSE_Y2_0001'}
          </span>
        </div>
      </div>

      {/* Semester Selector Tabs */}
      <div className="tabs-container">
        {availableSems.map(sem => (
          <button
            key={sem}
            className={`tab-btn ${selectedSem === sem ? 'active' : ''}`}
            onClick={() => setSelectedSem(sem)}
          >
            Semester {sem} Transcript
          </button>
        ))}
      </div>

      {/* 4 Proper Semester KPI Stat Cards with Shapes & Icons */}
      {/* 4 Semester KPI Stat Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* GPA Card */}
        <div className={`stat-tile ${Number(semGpa) < 6.0 ? 'stat-tile-warn' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-tile-icon" style={Number(semGpa) < 6.0 ? { background: '#FEE2E2', color: 'var(--red)' } : {}}>
              <Award size={18} strokeWidth={1.8} />
            </div>
            <span className={`pill ${Number(semGpa) < 6.0 ? 'pill-red' : 'pill-purple'}`} style={{ fontSize: '0.72rem' }}>
              Sem {selectedSem}
            </span>
          </div>
          <div>
            <div className="stat-tile-num" style={Number(semGpa) < 6.0 ? { color: 'var(--red)' } : {}}>
              {semGpa} <span style={{ fontSize: '0.9rem', color: 'var(--mute)' }}>/ 10</span>
            </div>
            <div className="stat-tile-label">Semester GPA &bull; Credit Weighted</div>
          </div>
        </div>

        {/* Total Credits Card */}
        <div className="stat-tile">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-tile-icon">
              <BookOpen size={18} strokeWidth={1.8} />
            </div>
            <span className="pill pill-purple" style={{ fontSize: '0.72rem' }}>Earned</span>
          </div>
          <div>
            <div className="stat-tile-num">{semCredits}</div>
            <div className="stat-tile-label">Registered Courses Credits</div>
          </div>
        </div>

        {/* Courses Passed Card */}
        <div className="stat-tile">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-tile-icon">
              <CheckCircle2 size={18} strokeWidth={1.8} />
            </div>
            <span className="pill pill-green" style={{ fontSize: '0.72rem' }}>Cleared</span>
          </div>
          <div>
            <div className="stat-tile-num" style={{ color: 'var(--green)' }}>
              {passedCount} <span style={{ fontSize: '0.9rem', color: 'var(--mute)' }}>/ {semMarks.length}</span>
            </div>
            <div className="stat-tile-label">Full Semester Credits Earned</div>
          </div>
        </div>

        {/* Arrears / Backlogs Card */}
        <div className={`stat-tile ${arrearsCount > 0 ? 'stat-tile-warn' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-tile-icon" style={arrearsCount > 0 ? { background: '#FEE2E2', color: 'var(--red)' } : {}}>
              <AlertTriangle size={18} strokeWidth={1.8} />
            </div>
            <span className={`pill ${arrearsCount > 0 ? 'pill-red' : 'pill-green'}`} style={{ fontSize: '0.72rem' }}>
              {arrearsCount > 0 ? 'Action Due' : 'Clean'}
            </span>
          </div>
          <div>
            <div className="stat-tile-num" style={arrearsCount > 0 ? { color: 'var(--red)' } : {}}>
              {arrearsCount} <span style={{ fontSize: '0.9rem', color: 'var(--mute)' }}>courses</span>
            </div>
            <div className="stat-tile-label">{arrearsCount > 0 ? 'Remedial coaching recommended' : 'Clean sheet this semester'}</div>
          </div>
        </div>

      </div>

      {/* Course Marks Breakdown Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        
        {/* Table Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>
              Semester {selectedSem} Course Marks Breakdown
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--mute)', margin: '2px 0 0' }}>
              Detailed marks distribution across internal exams, assignments, and Anna University end-sem tests
            </p>
          </div>

          <span style={{ fontSize: '0.76rem', color: 'var(--mute)', background: 'var(--soft)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--line)' }}>
            Weightage: 20% CIA Internal + 80% University External
          </span>
        </div>

        {/* Marks Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Type</th>
                <th>Credits</th>
                <th style={{ textAlign: 'center' }}>Ass 1 (10)</th>
                <th style={{ textAlign: 'center' }}>Ass 2 (10)</th>
                <th style={{ textAlign: 'center' }}>CIA 1 (50)</th>
                <th style={{ textAlign: 'center' }}>CIA 2 (50)</th>
                <th style={{ textAlign: 'center' }}>External (100)</th>
                <th style={{ textAlign: 'center' }}>Total (100)</th>
                <th style={{ textAlign: 'center' }}>Grade Point</th>
                <th style={{ textAlign: 'center' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                    Loading semester marks...
                  </td>
                </tr>
              ) : semMarks.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                    No marks records found for Semester {selectedSem}.
                  </td>
                </tr>
              ) : (
                semMarks.map((m, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--dark)', fontSize: '0.86rem' }}>
                        {m.subject_name}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-light-secondary" style={{ fontSize: '0.72rem' }}>
                        {m.subject_type || 'Theory'}
                      </span>
                    </td>

                    <td style={{ fontWeight: '600' }}>
                      {m.credits}
                    </td>

                    <td style={{ textAlign: 'center', color: 'var(--muted)' }}>
                      {m.assignment_1_marks}
                    </td>

                    <td style={{ textAlign: 'center', color: 'var(--muted)' }}>
                      {m.assignment_2_marks}
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: '600', color: m.internal_exam_1_marks < 25 ? 'var(--danger)' : 'var(--dark)' }}>
                      {m.internal_exam_1_marks}
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: '600', color: m.internal_exam_2_marks < 25 ? 'var(--danger)' : 'var(--dark)' }}>
                      {m.internal_exam_2_marks}
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: '600', color: m.external_exam_marks < 50 ? 'var(--danger)' : 'var(--dark)' }}>
                      {m.external_exam_marks}
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: '800', color: m.total_marks < 50 ? 'var(--danger)' : 'var(--dark)' }}>
                      {m.total_marks}
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: '700', color: m.grade_point === 0 ? 'var(--danger)' : 'var(--primary)' }}>
                      {m.grade_point}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      {m.result === 'Pass' ? (
                        <span className="badge badge-light-success" style={{ fontWeight: '700' }}>
                          <CheckCircle2 size={12} /> Pass
                        </span>
                      ) : (
                        <span className="badge badge-light-danger" style={{ fontWeight: '700' }}>
                          <AlertTriangle size={12} /> Arrear
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{ padding: '0.85rem 1.5rem', background: 'var(--bg-card-subtle)', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Showing {semMarks.length} registered subjects for Semester {selectedSem}</span>
          <span>Anna University Credit System (Scale: 10.0)</span>
        </div>

      </div>

    </div>
  );
}
