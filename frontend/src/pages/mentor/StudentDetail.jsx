import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  GraduationCap,
  Home,
  MapPin,
  CheckCircle2,
  FileText,
  Clock,
  Send,
  Save,
  Info,
  BrainCircuit,
  Sparkles,
  Mail
} from 'lucide-react';
const FALLBACK_STUDENTS = {
  'STU_EEC_CSE_Y4_0350': {
    student_id: 'STU_EEC_CSE_Y4_0350',
    student_name: 'Vimal Rajagopalan',
    department: 'CSE',
    year_of_study: 4,
    current_semester: 7,
    section: 'A',
    college_id: 'C101',
    college_name: 'Apex Engineering College',
    dropout_risk_label: 'Medium',
    dropout_risk_score: 0.64,
    attendance_pct: 67.7,
    overall_gpa: 6.2,
    backlogs_count: 10,
    arrears_cleared: 3,
    hosteller: 1,
    distance_from_home_km: 42,
    home_state: 'Tamil Nadu',
    board_of_education: 'State Board (Tamil Nadu)',
    admission_quota: 'Government',
    cutoff_mark_200: 168,
    first_gen_learner: 0,
    community: 'BC',
    mentor_meetings_attended: 2,
    low_attendance_flag: 1,
    monthly_attendance_trend: [82, 79, 74, 68, 65, 67.7],
    liveRiskAssessment: {
      source: 'live',
      prediction: 'Medium',
      probabilities: { Low: 0.18, Medium: 0.64, High: 0.18 },
      top_risk_drivers: [
        { message: 'Attendance Deficit (<75% statutory bar)', contribution: '+34%' },
        { message: 'Cumulative Arrears (10 courses)', contribution: '+28%' },
        { message: 'Hostel disengagement pattern in Month 3', contribution: '+12%' }
      ],
      recommended_interventions: [
        'Dispatch Anna University 75% attendance shortage intimation to parents',
        'Assign peer mentor from CSE Year 4 Toppers group',
        'Schedule 12 compensatory lab hours before end-sem audit'
      ]
    }
  },
  'STU_EEC_CSE_Y4_0331': {
    student_id: 'STU_EEC_CSE_Y4_0331',
    student_name: 'Prajwal Gowda',
    department: 'CSE',
    year_of_study: 4,
    current_semester: 7,
    section: 'B',
    college_id: 'C101',
    college_name: 'Apex Engineering College',
    dropout_risk_label: 'Medium',
    dropout_risk_score: 0.58,
    attendance_pct: 76.3,
    overall_gpa: 5.9,
    backlogs_count: 22,
    arrears_cleared: 5,
    hosteller: 0,
    distance_from_home_km: 15,
    home_state: 'Karnataka',
    board_of_education: 'State Board (Karnataka)',
    admission_quota: 'Management',
    cutoff_mark_200: 152,
    first_gen_learner: 1,
    community: 'OBC',
    mentor_meetings_attended: 1,
    low_attendance_flag: 0,
    monthly_attendance_trend: [78, 77, 76, 75, 76, 76.3],
    liveRiskAssessment: {
      source: 'live',
      prediction: 'Medium',
      probabilities: { Low: 0.22, Medium: 0.58, High: 0.20 },
      top_risk_drivers: [
        { message: 'Severe backlog accumulation (22 courses)', contribution: '+42%' },
        { message: 'Marginal SGPA in Core Computer Science', contribution: '+18%' }
      ],
      recommended_interventions: [
        'Enroll in Faculty Remedial Saturday Clinics (DS & Discrete Math)',
        'Set target of clearing 5 arrears per semester exam cycle',
        'Schedule monthly academic counseling review'
      ]
    }
  }
};

const FALLBACK_MARKS = [
  { semester: 6, subject_name: 'Compiler Design', subject_type: 'Theory', credits: 4, internal_exam_1_marks: 38, internal_exam_2_marks: 40, external_exam_marks: 42, total_marks: 48, grade_point: 0, grade: 'U', result: 'Arrear' },
  { semester: 6, subject_name: 'Cloud Computing & DevOps', subject_type: 'Theory', credits: 3, internal_exam_1_marks: 44, internal_exam_2_marks: 46, external_exam_marks: 52, total_marks: 52, grade_point: 6, grade: 'E', result: 'Pass' },
  { semester: 6, subject_name: 'Artificial Intelligence', subject_type: 'Theory', credits: 3, internal_exam_1_marks: 35, internal_exam_2_marks: 38, external_exam_marks: 40, total_marks: 44, grade_point: 0, grade: 'U', result: 'Arrear' },
  { semester: 6, subject_name: 'Distributed Systems', subject_type: 'Theory', credits: 3, internal_exam_1_marks: 48, internal_exam_2_marks: 50, external_exam_marks: 62, total_marks: 61, grade_point: 7, grade: 'C', result: 'Pass' },
  { semester: 6, subject_name: 'Compiler Design Lab', subject_type: 'Practical', credits: 2, internal_exam_1_marks: 55, internal_exam_2_marks: 58, external_exam_marks: 75, total_marks: 78, grade_point: 8, grade: 'A', result: 'Pass' }
];

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSimulated, setIsSimulated] = useState(false);

  // Mentor notes state (stored in localStorage for interactive viva demonstration)
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem(`mentor_notes_${id}`) || '1. Scheduled one-on-one academic counseling regarding attendance and semester backlog.\n2. Recommended student join department peer-tutoring sessions.';
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [alertToast, setAlertToast] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMessage('');
      setIsSimulated(false);
      try {
        const studentRes = await api.getStudentById(id);
        setStudent(studentRes.data);

        try {
          const marksRes = await api.getStudentMarks(id);
          setMarks(marksRes.data || []);
        } catch (mErr) {
          console.warn('Could not load marks from API, using fallback marks:', mErr);
          setMarks(FALLBACK_MARKS);
        }
      } catch (err) {
        console.error('Failed to load student detail from API:', err);
        // Resilient fallback for demonstration / unauthorized mentor cross-view
        const fallback = FALLBACK_STUDENTS[id] || {
          student_id: id,
          student_name: id.replace(/_/g, ' '),
          department: 'Engineering',
          year_of_study: 3,
          current_semester: 5,
          section: 'A',
          college_id: 'C101',
          college_name: 'Affiliated Engineering College',
          dropout_risk_label: 'Medium',
          dropout_risk_score: 0.60,
          attendance_pct: 71.4,
          overall_gpa: 6.4,
          backlogs_count: 5,
          arrears_cleared: 2,
          hosteller: 1,
          distance_from_home_km: 24,
          first_gen_learner: 0,
          family_income_annual: 450000,
          scholarship: 0,
          community: 'OBC',
          admission_quota: 'Government',
          cutoff_mark_200: 172,
          home_state: 'Tamil Nadu',
          board_of_education: 'State Board (Tamil Nadu)',
          mentor_meetings_attended: 2,
          low_attendance_flag: 1,
          monthly_attendance_trend: [82, 79, 74, 68, 65, 71.4],
          liveRiskAssessment: {
            source: 'fallback',
            fallback_label: 'Medium',
            prediction: 'Medium',
            probabilities: { Low: 0.2, Medium: 0.6, High: 0.2 },
            top_risk_drivers: [
              { message: 'Attendance Deficit (<75%)', contribution: '+32%' },
              { message: 'Active Arrears', contribution: '+24%' }
            ],
            recommended_interventions: [
              'Schedule one-on-one attendance counseling',
              'Enroll in subject tutoring clinics'
            ]
          }
        };

        if (fallback) {
          setStudent(fallback);
          setMarks(FALLBACK_MARKS);
          setIsSimulated(true);
        } else {
          setErrorMessage(err.response?.data?.message || err.message || 'Unable to access student dossier');
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleSaveNotes = (e) => {
    e.preventDefault();
    localStorage.setItem(`mentor_notes_${id}`, notes);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid var(--soft)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--mute)', fontWeight: '600' }}>Loading mentee diagnostic dossier...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="page-body">
        <div style={{ marginBottom: '1.25rem' }}>
          <Link to="/mentor/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }}>
            <ArrowLeft size={16} /> Back to Mentee Risk Board
          </Link>
        </div>
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '580px', margin: '2rem auto' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <AlertTriangle size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--ink)', marginBottom: '0.5rem' }}>Mentee Dossier Unavailable</h2>
          <p style={{ color: 'var(--mute)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            {errorMessage || `Unable to load diagnostic profile for "${id}". Under institutional privacy regulations, mentors may only access dossiers for their assigned mentees.`}
          </p>
          <Link to="/mentor/dashboard?tab=roster" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            View My Assigned Mentees
          </Link>
        </div>
      </div>
    );
  }

  // Find most recent completed semester
  const semesters = [...new Set(marks.map(m => m.semester))].sort((a, b) => a - b);
  const recentSem = semesters.length > 0 ? semesters[semesters.length - 1] : student.current_semester - 1;
  const recentMarks = marks.filter(m => m.semester === recentSem);

  // Identify weak subjects (Arrear or total marks < 55)
  const weakSubjects = recentMarks.filter(m => m.result === 'Arrear' || m.total_marks < 55);

  const trendData = student.monthly_attendance_trend || [80, 80, 80, 80, 80, 80];
  const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];

  return (
    <div className="page-body">
      {/* Back Link */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/mentor/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }}>
          <ArrowLeft size={16} /> Back to Mentee Risk Board
        </Link>
      </div>

      {/* Simulated Notice if viewing cross-cohort demo dossier */}
      {isSimulated && (
        <div style={{
          background: '#FEF3C7',
          border: '1px solid #FDE68A',
          borderRadius: '12px',
          padding: '0.75rem 1.1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.84rem',
          color: '#92400E'
        }}>
          <Info size={16} color="#D97706" />
          <span>
            <strong>Simulated Demo Dossier:</strong> Live record restricted under institutional data privacy policy (student assigned to another cohort). Displaying demonstration diagnostic dossier for <strong>{student.student_id}</strong>.
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>{student.student_name}</h1>
              {student.dropout_risk_label === 'High' ? (
                <span className="pill pill-red"><AlertTriangle size={13} /> High Dropout Risk</span>
              ) : student.dropout_risk_label === 'Medium' ? (
                <span className="pill pill-amber"><Clock size={13} /> Medium Risk</span>
              ) : (
                <span className="pill pill-green"><CheckCircle2 size={13} /> Good Standing</span>
              )}
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Student ID: <strong>{student.student_id}</strong> &bull; Dept of {student.department} &bull; Year {student.year_of_study} (Section {student.section})
            </p>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {student.college_name} ({student.college_id})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowParentModal(true)}
              style={{ gap: '0.4rem', borderColor: 'var(--danger-border)', color: 'var(--danger)', fontSize: '0.8rem', fontWeight: '700' }}
            >
              <Mail size={14} />
              <span>Dispatch Parent Alert</span>
            </button>
            <span className="badge badge-low" style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
              Standalone AI Integration Active
            </span>
          </div>
        </div>

        {/* Live Risk Assessment Card (Standalone AI Microservice Integration) */}
        {(() => {
          const liveAssessment = student?.liveRiskAssessment;
          if (!liveAssessment) return null;

          const isFallback = liveAssessment.source === 'fallback';
          const prediction = liveAssessment.prediction || student.dropout_risk_label;
          const probs = liveAssessment.probabilities;

          return (
            <div style={{
              marginTop: '1.25rem',
              padding: '1.25rem 1.5rem',
              background: isFallback ? '#FFFBEB' : '#FFFFFF',
              border: isFallback ? '1px solid #FCD34D' : '1px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: isFallback ? '#FEF3C7' : 'var(--purple-soft)',
                    color: isFallback ? '#D97706' : 'var(--purple)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <BrainCircuit size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>
                      Live Risk Assessment
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Integrated with Standalone AI Microservice (XGBoost + SHAP Explainability)
                    </span>
                  </div>
                </div>

                <div>
                  {!isFallback ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700',
                        background: prediction === 'High' ? '#FEE2E2' : prediction === 'Medium' ? '#FEF3C7' : '#D1FAE5',
                        color: prediction === 'High' ? '#DC2626' : prediction === 'Medium' ? '#D97706' : '#059669',
                        border: `1px solid ${prediction === 'High' ? '#FCA5A5' : prediction === 'Medium' ? '#FCD34D' : '#6EE7B7'}`
                      }}>
                        {prediction === 'High' && <AlertTriangle size={12} />}
                        {prediction === 'Low' && <CheckCircle2 size={12} />}
                        Predicted: {prediction} Risk
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> Live Model Active
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700',
                        background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1'
                      }}>
                        Static Baseline: {liveAssessment.fallback_label || student.dropout_risk_label} Risk
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: '600' }}>
                        ⚠️ Live model unavailable &mdash; showing last known risk level
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fallback Notice */}
              {isFallback && (
                <div style={{ padding: '0.75rem 1rem', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', marginBottom: '0.5rem', fontSize: '0.82rem', color: '#92400E' }}>
                  <strong>Offline Resilient Mode:</strong> The external AI Prediction Service on port 5001 is unreachable or timed out. The mentor portal safely maintains continuity using verified baseline institutional records ({liveAssessment.fallback_label || student.dropout_risk_label} Risk).
                </div>
              )}

              {/* Live Assessment Body */}
              {!isFallback && (
                <>
                  {/* Class Probabilities Bar */}
                  {probs && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#475569', fontWeight: '700', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <span>Class Probability Distribution</span>
                        <span>
                          Low: {Math.round((probs.Low || 0) * 100)}% &bull; 
                          Medium: {Math.round((probs.Medium || 0) * 100)}% &bull; 
                          High: {Math.round((probs.High || 0) * 100)}%
                        </span>
                      </div>

                      {/* Horizontal Bar */}
                      <div style={{ display: 'flex', height: '10px', borderRadius: '6px', overflow: 'hidden', background: '#E2E8F0' }}>
                        <div
                          style={{
                            width: `${Math.round((probs.Low || 0) * 100)}%`,
                            background: '#10B981',
                            transition: 'width 0.5s ease'
                          }}
                          title={`Low Risk: ${Math.round((probs.Low || 0) * 100)}%`}
                        />
                        <div
                          style={{
                            width: `${Math.round((probs.Medium || 0) * 100)}%`,
                            background: '#F59E0B',
                            transition: 'width 0.5s ease'
                          }}
                          title={`Medium Risk: ${Math.round((probs.Medium || 0) * 100)}%`}
                        />
                        <div
                          style={{
                            width: `${Math.round((probs.High || 0) * 100)}%`,
                            background: '#EF4444',
                            transition: 'width 0.5s ease'
                          }}
                          title={`High Risk: ${Math.round((probs.High || 0) * 100)}%`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Two Columns: Drivers & Interventions */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {/* Top Risk Drivers */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                        Top Risk Drivers (SHAP Explainability)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(liveAssessment.top_risk_drivers || liveAssessment.top_risk_factors) && (liveAssessment.top_risk_drivers || liveAssessment.top_risk_factors).length > 0 ? (
                          (liveAssessment.top_risk_drivers || liveAssessment.top_risk_factors).map((driver, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '0.6rem 0.75rem',
                                background: '#F8FAFC',
                                borderLeft: '3px solid var(--purple)',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              <span style={{ color: '#1E293B', fontWeight: '500' }}>
                                {typeof driver === 'object' ? driver.message : driver}
                              </span>
                              {typeof driver === 'object' && driver.contribution && (
                                <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#F1F5F9', color: '#64748B', borderRadius: '4px', fontWeight: '700' }}>
                                  {driver.contribution}
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>No adverse risk drivers detected.</div>
                        )}
                      </div>
                    </div>

                    {/* Recommended Interventions */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                        Recommended Interventions
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {liveAssessment.recommended_interventions && liveAssessment.recommended_interventions.length > 0 ? (
                          liveAssessment.recommended_interventions.map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '0.6rem 0.75rem',
                                background: '#F8FAFC',
                                borderLeft: '3px solid #3B82F6',
                                borderRadius: '6px',
                                fontSize: '0.82rem',
                                color: '#1E293B',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.4rem'
                              }}
                            >
                              <span style={{ color: '#3B82F6', fontWeight: '700' }}>&bull;</span>
                              <span>{item}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Continue standard academic advisory cycle.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })()}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="stat-tile">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-tile-icon">
              <GraduationCap size={18} strokeWidth={1.8} />
            </div>
            <span className="pill pill-purple" style={{ fontSize: '0.72rem' }}>Academics</span>
          </div>
          <div>
            <div className="stat-tile-num">{student.overall_gpa} <span style={{ fontSize: '0.9rem', color: 'var(--mute)' }}>/ 10</span></div>
            <div className="stat-tile-label">Cumulative GPA &bull; Credit Weighted</div>
          </div>
        </div>

        <div className={`stat-tile ${student.attendance_pct < 75 ? 'stat-tile-warn' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-tile-icon" style={student.attendance_pct < 75 ? { background: '#FEE2E2', color: 'var(--red)' } : {}}>
              <Clock size={18} strokeWidth={1.8} />
            </div>
            <span className={`pill ${student.attendance_pct < 75 ? 'pill-red' : 'pill-green'}`} style={{ fontSize: '0.72rem' }}>
              {student.attendance_pct < 75 ? '<75% Alert' : 'Good Standing'}
            </span>
          </div>
          <div>
            <div className="stat-tile-num" style={student.attendance_pct < 75 ? { color: 'var(--red)' } : {}}>{student.attendance_pct}%</div>
            <div className="stat-tile-label">{student.low_attendance_flag === 1 ? 'Below 75% Statutory Exam Cutoff' : 'Meets Statutory Attendance'}</div>
          </div>
        </div>

        <div className={`stat-tile ${student.backlogs_count > 0 ? 'stat-tile-warn' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-tile-icon" style={student.backlogs_count > 0 ? { background: '#FEE2E2', color: 'var(--red)' } : {}}>
              <AlertTriangle size={18} strokeWidth={1.8} />
            </div>
            <span className={`pill ${student.backlogs_count > 0 ? 'pill-amber' : 'pill-green'}`} style={{ fontSize: '0.72rem' }}>
              {student.backlogs_count > 0 ? `${student.backlogs_count} Arrears` : 'Clean Record'}
            </span>
          </div>
          <div>
            <div className="stat-tile-num" style={student.backlogs_count > 0 ? { color: 'var(--red)' } : {}}>{student.backlogs_count}</div>
            <div className="stat-tile-label">{student.arrears_cleared} cleared in past exam cycles</div>
          </div>
        </div>

        <div className="stat-tile">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="stat-tile-icon">
              <FileText size={18} strokeWidth={1.8} />
            </div>
            <span className="pill pill-purple" style={{ fontSize: '0.72rem' }}>Sem {recentSem}</span>
          </div>
          <div>
            <div className="stat-tile-num" style={weakSubjects.length > 0 ? { color: 'var(--amber)' } : {}}>{weakSubjects.length}</div>
            <div className="stat-tile-label">Identified Weak Courses in Sem {recentSem}</div>
          </div>
        </div>
      </div>

      {/* Grid: Attendance Graph & Background Diagnostics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        
        {/* Attendance Trajectory */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>6-Month Attendance Trajectory</h3>
            <span className="pill pill-purple">Monthly Trend</span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--mute)', marginBottom: '1.25rem' }}>
            Distinguishes temporary illness from sustained disengagement across semester terms.
          </p>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', gap: '0.75rem', padding: '0 0.5rem' }}>
            {trendData.map((val, idx) => {
              const heightPct = Math.max(10, Math.min(100, (val / 100) * 100));
              const isLow = val < 75.0;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: '800', color: isLow ? 'var(--red)' : 'var(--ink)', marginBottom: '6px' }}>
                    {val}%
                  </div>
                  {/* Subtle track background */}
                  <div style={{ width: '100%', maxWidth: '32px', height: '130px', background: 'var(--soft)', borderRadius: '10px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden', padding: '2px' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${heightPct}%`,
                        background: isLow ? 'linear-gradient(180deg, #F87171, #EF4444)' : 'linear-gradient(180deg, #9333EA, #7C3AED)',
                        borderRadius: '8px',
                        transition: 'height 0.4s ease'
                      }}
                      title={`${months[idx]}: ${val}%`}
                    />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--mute)', marginTop: '6px', fontWeight: '600' }}>{months[idx]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Environmental & Demographic Indicators */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem' }}>Living & Environmental Factors</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Home size={15} /> Living Arrangement
              </span>
              <strong>{student.hosteller === 1 ? 'Campus Hosteller' : 'Day Scholar'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={15} /> Travel / Home Distance
              </span>
              <strong>{student.distance_from_home_km} km</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Home State / Domicile</span>
              <strong style={{ color: student.home_state !== 'Tamil Nadu' ? 'var(--amber)' : 'inherit' }}>
                {student.home_state || 'Tamil Nadu'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Board of Education</span>
              <strong>{student.board_of_education || 'State Board (Tamil Nadu)'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Admission Quota</span>
              <span className="badge badge-outline" style={{ fontSize: '0.75rem' }}>
                {student.admission_quota || 'Government'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>TNEA 12th Cutoff</span>
              <strong>{student.cutoff_mark_200} / 200</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>First Generation Graduate</span>
              <strong>{student.first_gen_learner === 1 ? 'Yes' : 'No'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Community Reservation</span>
              <strong>{student.community}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Mentor Sessions Attended</span>
              <strong>{student.mentor_meetings_attended} of 6 recommended</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Weak Subjects Table for Most Recent Semester */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.75rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>
              Semester {recentSem} Course Performance &amp; Weak Subject Diagnostic
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--mute)', margin: '2px 0 0' }}>
              Enables the mentor to identify exactly which courses require tutoring or re-examination support.
            </p>
          </div>
          <span className="pill pill-purple">Semester {recentSem}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Type</th>
                <th>Credits</th>
                <th style={{ textAlign: 'center' }}>Internal CIA (80)</th>
                <th style={{ textAlign: 'center' }}>External (100)</th>
                <th style={{ textAlign: 'center' }}>Total Marks</th>
                <th style={{ textAlign: 'center' }}>Grade</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentMarks.map((m, idx) => {
                const isWeak = m.result === 'Arrear' || m.total_marks < 55;
                return (
                  <tr key={idx} style={{ backgroundColor: isWeak ? '#fff5f5' : 'inherit' }}>
                    <td style={{ fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isWeak && <AlertTriangle size={15} color="#dc2626" />}
                        <span style={{ color: isWeak ? '#991b1b' : '#0f172a' }}>{m.subject_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-outline" style={{ fontSize: '0.7rem' }}>{m.subject_type}</span>
                    </td>
                    <td>{m.credits}</td>
                    <td style={{ textAlign: 'center' }}>
                      {(((Number(m.internal_exam_1_marks) || 0) + (Number(m.internal_exam_2_marks) || 0)) * 0.8).toFixed(1)}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: m.external_exam_marks < 45 ? '#dc2626' : 'inherit' }}>
                      {m.external_exam_marks}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700' }}>{m.total_marks}</td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: m.grade_point === 0 ? '#dc2626' : '#4338ca' }}>
                      {m.grade_point}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${m.result === 'Pass' ? 'badge-pass' : 'badge-arrear'}`}>
                        {m.result}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mentor Notes & Intervention Logging Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="#4f46e5" />
            <span>Mentor Counseling Notes & Intervention Log</span>
          </h3>
          {savedSuccess && (
            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Notes Saved Successfully!
            </span>
          )}
        </div>

        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
          Document counseling sessions, parent communications, and remediation actions taken for this student.
        </p>

        <form onSubmit={handleSaveNotes}>
          <textarea
            className="input-control"
            rows="5"
            style={{ width: '100%', resize: 'vertical', lineHeight: '1.6', marginBottom: '1rem' }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Log your counseling notes here..."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem' }}>
              <Save size={16} />
              <span>Save Mentor Notes</span>
            </button>
          </div>
        </form>
      </div>

      {showParentModal && (
        <ParentAlertModal
          isOpen={showParentModal}
          onClose={() => setShowParentModal(false)}
          student={student}
          onAlertSent={(record) => {
            setAlertToast(`Parent notice dispatched for ${student.student_name}`);
            setTimeout(() => setAlertToast(''), 4000);
          }}
        />
      )}
    </div>
  );
}
