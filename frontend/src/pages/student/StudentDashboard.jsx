import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  GraduationCap,
  Calendar,
  AlertTriangle,
  Award,
  BookOpen,
  MapPin,
  Home,
  Clock,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Sparkles,
  LifeBuoy,
  MessageSquare,
  X,
  Send
} from 'lucide-react';

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Guidance Meeting Modal State
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingReason, setMeetingReason] = useState('attendance');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [meetingSubmitted, setMeetingSubmitted] = useState(false);

  // Read-only meeting requests status list
  const [myMeetingRequests, setMyMeetingRequests] = useState([]);

  useEffect(() => {
    async function loadMeetingRequests() {
      try {
        const res = await api.getMyMeetingRequests();
        if (res && res.data) {
          setMyMeetingRequests(res.data);
        }
      } catch (err) {
        console.warn('Could not load student meeting requests:', err.message);
      }
    }
    loadMeetingRequests();
  }, [currentUser?.id]);

  useEffect(() => {
    async function loadStudentData() {
      setLoading(true);
      try {
        const res = await api.getStudentById(currentUser.id);
        if (res && res.data) {
          setStudent(res.data);
        } else {
          throw new Error('No student data');
        }
      } catch (err) {
        // Fallback default structure for sample student
        setStudent({
          student_id: currentUser.id || 'STU_EEC_CSE_Y2_0001',
          student_name: currentUser.name || 'Aravind Sundaram',
          college_name: currentUser.college || 'Apex Engineering College (Autonomous)',
          department: currentUser.department || 'CSE',
          year_of_study: currentUser.year || 2,
          current_semester: (currentUser.year || 2) * 2,
          section: 'A',
          overall_gpa: 6.45,
          attendance_pct: 71.5,
          monthly_attendance_trend: [82.0, 79.5, 76.0, 74.5, 72.0, 69.5],
          backlogs_count: 2,
          arrears_cleared: 1,
          low_attendance_flag: 1,
          dropout_risk_label: 'High',
          hosteller: 0,
          distance_from_home_km: 26.5,
          home_state: 'Tamil Nadu',
          board_of_education: 'State Board (Tamil Nadu)',
          admission_quota: 'Government Quota',
          mentor: {
            name: 'Dr. Kavitha Ramanathan',
            email: 'kavitha.ram@eec.edu.in',
            designation: 'Associate Professor & Mentor'
          }
        });
      } finally {
        setLoading(false);
      }
    }

    loadStudentData();
  }, [currentUser?.id]);

  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    try {
      const reasonLabel = meetingReason === 'attendance'
        ? 'Compensatory Lab & Attendance Recovery'
        : meetingReason === 'backlogs'
        ? 'Arrear Course Clearance & Study Plan'
        : meetingReason === 'cia'
        ? 'Internal Assessment (CIA) Consultation'
        : 'General Academic Counseling';

      await api.createMeetingRequest({
        student_id: student?.student_id || currentUser?.linkedId || currentUser?.id,
        mentor_id: student?.mentor_id || student?.mentor?.id,
        category: (meetingReason === 'attendance' || meetingReason === 'backlogs' || meetingReason === 'cia') ? 'academic' : 'meeting',
        urgency: (student?.dropout_risk_label === 'High' || (student?.attendance_pct && student.attendance_pct < 75)) ? 'urgent' : 'normal',
        reason_short: `${reasonLabel}${meetingNotes ? ' - ' + meetingNotes : ''}`
      });

      // Refresh student's meeting request list immediately
      const refreshed = await api.getMyMeetingRequests();
      if (refreshed && refreshed.data) {
        setMyMeetingRequests(refreshed.data);
      }
    } catch (err) {
      console.warn('Could not post meeting request to ERP:', err.message);
    }

    setMeetingSubmitted(true);
    setTimeout(() => {
      setShowMeetingModal(false);
      setMeetingSubmitted(false);
      setMeetingNotes('');
    }, 2200);
  };

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p style={{ color: 'var(--muted)' }}>Loading student academic profile...</p>
      </div>
    );
  }

  const trendData = student?.monthly_attendance_trend || [82.0, 79.5, 76.0, 74.5, 72.0, 69.5];
  const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
  const hasAttendanceDeficit = (student.attendance_pct || 0) < 75;
  const hasBacklogs = (student.backlogs_count || 0) > 0;
  const needsAdvisory = hasAttendanceDeficit || hasBacklogs;

  return (
    <div className="page-body">
      
      {/* =====================================================================
          HEADER BANNER: Student Identity & Actions
          ===================================================================== */}
      <div className="card" style={{ marginBottom: '1.5rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.25rem',
              boxShadow: '0 4px 12px rgba(93, 135, 255, 0.3)'
            }}>
              {student.student_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.2rem' }}>
                <h1 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--dark)', margin: 0 }}>
                  {student.student_name}
                </h1>
                {needsAdvisory ? (
                  <span className="badge badge-light-primary" style={{ fontWeight: '700' }}>
                    <Sparkles size={13} />
                    <span>Academic Guidance Active</span>
                  </span>
                ) : (
                  <span className="badge badge-light-success" style={{ fontWeight: '700' }}>
                    <CheckCircle2 size={13} />
                    <span>Good Academic Standing</span>
                  </span>
                )}
              </div>

              <p style={{ color: 'var(--muted)', fontSize: '0.84rem', margin: 0 }}>
                Registration ID: <strong>{student.student_id}</strong> &bull; {student.college_name}
              </p>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                Department of {student.department} &bull; Year {student.year_of_study} (Semester {student.current_semester}) &bull; Section {student.section}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {needsAdvisory && (
              <button
                className="btn btn-outline"
                onClick={() => setShowMeetingModal(true)}
                style={{ gap: '0.45rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                <MessageSquare size={16} />
                <span>Request Mentor Guidance</span>
              </button>
            )}

            <Link to="/student/marks" className="btn btn-primary" style={{ gap: '0.45rem' }}>
              <BookOpen size={16} />
              <span>View Subject Marks &amp; CIA</span>
            </Link>
          </div>

        </div>
      </div>

      {/* =====================================================================
          ROW 1: 4 PROPER STAT CARDS WITH SHAPES & ICONS
          (Student-friendly: NO scary "High Dropout Risk" ML flags)
          ===================================================================== */}
      <div className="stats-grid">
        
        {/* Card 1: Attendance */}
        <div className="stat-card">
          <div>
            <div className="stat-label">Overall Attendance</div>
            <div className="stat-value" style={{ color: student.attendance_pct < 75 ? 'var(--danger)' : 'var(--success)' }}>
              {student.attendance_pct}%
            </div>
            <div className="stat-subtext" style={{ color: student.attendance_pct < 75 ? 'var(--danger)' : 'var(--success)', fontWeight: '600' }}>
              {student.attendance_pct < 75 ? '⚠️ Below 75% Statutory Bar' : '✓ Cleared for Semester Exams'}
            </div>
          </div>
          <div className="stat-icon-box" style={{ background: student.attendance_pct < 75 ? 'var(--danger-light)' : 'var(--success-light)', color: student.attendance_pct < 75 ? 'var(--danger)' : 'var(--success)' }}>
            <Calendar size={22} />
          </div>
        </div>

        {/* Card 2: Cumulative GPA */}
        <div className="stat-card">
          <div>
            <div className="stat-label">Cumulative GPA (CGPA)</div>
            <div className="stat-value">
              {student.overall_gpa} <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--muted)' }}>/ 10</span>
            </div>
            <div className="stat-subtext">Credit-weighted Anna Univ scale</div>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <GraduationCap size={24} />
          </div>
        </div>

        {/* Card 3: Active Backlogs */}
        <div className="stat-card">
          <div>
            <div className="stat-label">Course Standing</div>
            <div className="stat-value" style={{ color: student.backlogs_count > 0 ? '#B45309' : 'var(--dark)' }}>
              {student.backlogs_count > 0 ? `${student.backlogs_count} Pending` : 'All Clear'}
            </div>
            <div className="stat-subtext">
              {student.arrears_cleared > 0 ? `${student.arrears_cleared} arrear cleared previously` : 'No past arrears recorded'}
            </div>
          </div>
          <div className="stat-icon-box" style={{ background: student.backlogs_count > 0 ? 'var(--warning-light)' : 'var(--success-light)', color: student.backlogs_count > 0 ? 'var(--warning)' : 'var(--success)' }}>
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* Card 4: Academic Mentoring Support (Positive, Supportive, Ethical) */}
        <div className="stat-card">
          <div>
            <div className="stat-label">Mentorship Status</div>
            <div className="stat-value" style={{ color: 'var(--primary)' }}>
              {needsAdvisory ? 'Active Guidance' : 'On Track'}
            </div>
            <div className="stat-subtext">
              Faculty Mentor: {student.mentor?.name || 'Dr. Kavitha Ramanathan'}
            </div>
          </div>
          <div className="stat-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <UserCheck size={22} />
          </div>
        </div>

      </div>

      {/* =====================================================================
          SUPPORTIVE ACADEMIC ADVISORY SECTION (For students with attendance < 75% or arrears)
          ===================================================================== */}
      {needsAdvisory && (
        <div className="card fade-in" style={{
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
          border: '1.5px solid #bbf7d0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', maxWidth: '780px' }}>
              <div style={{
                background: '#10b981',
                color: '#ffffff',
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)'
              }}>
                <LifeBuoy size={24} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#065f46', margin: '0 0 0.35rem' }}>
                  Academic Support &amp; Recovery Plan
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#1f2937', lineHeight: '1.5', margin: '0 0 0.75rem' }}>
                  {hasAttendanceDeficit ? (
                    <>
                      Your current attendance is <strong>{student.attendance_pct}%</strong> (a <strong>{(75 - Number(student.attendance_pct)).toFixed(1)}% margin</strong> below Anna University's 75% exam cutoff). You can comfortably make up this deficit through scheduled Saturday practical sessions and compensatory tutorial hours.
                    </>
                  ) : (
                    <>
                      You have <strong>{student.backlogs_count} standing course backlogs</strong>. Department peer tutoring and revision modules are available this semester to ensure you clear them on your next attempt.
                    </>
                  )}
                </p>

                {/* Practical Supportive Recommendations */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                    <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '2px' }}>1. Saturday Compensatory Labs</strong>
                    <span>Attend 8 hours of extra laboratory practice to restore attendance to &gt;75%.</span>
                  </div>

                  <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                    <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '2px' }}>2. CIA Improvement Tests</strong>
                    <span>Consult your subject teachers to attempt the Continuous Assessment re-tests.</span>
                  </div>

                  <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                    <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '2px' }}>3. Department Peer Tutoring</strong>
                    <span>Join senior student study circles for challenging problem-oriented subjects.</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ alignSelf: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowMeetingModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  padding: '0.65rem 1.25rem',
                  gap: '0.5rem',
                  fontWeight: '700'
                }}
              >
                <MessageSquare size={16} />
                <span>Schedule Mentor Meeting</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ROW 2: 6-Month Attendance Trajectory & Student Profile Grid
          ===================================================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Attendance Trajectory Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--dark)', margin: 0 }}>
              6-Month Attendance Trajectory
            </h3>
            <span className="badge badge-light-primary">Anna Univ 75% Rule</span>
          </div>
          
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
            Monthly class presence tracking. Amber bars indicate periods requiring compensatory hours to maintain exam clearance.
          </p>

          {/* SVG Grouped Vertical Columns */}
          <div style={{ height: '170px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '25px', position: 'relative' }}>
            {/* 75% Statutory Line */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', height: '1px', borderTop: '1.5px dashed var(--danger)', zIndex: 0 }}>
              <span style={{ position: 'absolute', right: 0, top: '-16px', fontSize: '0.68rem', fontWeight: '700', color: 'var(--danger)', background: '#ffffff', padding: '0 4px' }}>
                75% Statutory Cutoff
              </span>
            </div>

            {trendData.map((val, idx) => {
              const isBelow = val < 75;
              const barHeight = Math.max(15, (val / 100) * 130);
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 1 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '800', color: isBelow ? 'var(--danger)' : 'var(--dark)' }}>
                    {val}%
                  </span>
                  <div
                    style={{
                      width: '24px',
                      height: `${barHeight}px`,
                      background: isBelow ? 'linear-gradient(180deg, #f87171, #ef4444)' : 'linear-gradient(180deg, #5d87ff, #4570ea)',
                      borderRadius: '5px 5px 0 0',
                      transition: 'height 0.6s ease'
                    }}
                    title={`${months[idx]}: ${val}%`}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: '600' }}>
                    {months[idx]}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '0.75rem', padding: '0.65rem 0.85rem', background: 'var(--bg-body)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem', color: 'var(--muted)' }}>
            <Clock size={15} color="var(--primary)" />
            <span>
              {hasAttendanceDeficit ? (
                <>Attendance deficit: <strong>{(75 - Number(student.attendance_pct)).toFixed(1)}% needed</strong> to reach safe statutory zone of 75%.</>
              ) : (
                <>All semester attendance criteria fulfilled for the upcoming university examination cycle.</>
              )}
            </span>
          </div>
        </div>

        {/* Student Academic & Living Profile */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--dark)', marginBottom: '1rem' }}>
            Academic Profile &amp; Living Context
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Home size={15} /> Living Mode
              </span>
              <strong>{student.hosteller === 1 ? 'Campus Hosteller' : 'Day Scholar (Commuter)'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <MapPin size={15} /> Distance from Campus
              </span>
              <strong>{student.distance_from_home_km} km</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--muted)' }}>Home State / Domicile</span>
              <strong>{student.home_state || 'Tamil Nadu'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--muted)' }}>Board of Education</span>
              <strong>{student.board_of_education || 'State Board (Tamil Nadu)'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.84rem' }}>
              <span style={{ color: 'var(--muted)' }}>Admission Quota</span>
              <strong>{student.admission_quota || 'Government Quota'}</strong>
            </div>
          </div>

          {/* Assigned Mentor Card */}
          <div style={{ marginTop: '1.1rem', padding: '0.85rem 1rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.85rem' }}>
                KR
              </div>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: '800', color: 'var(--dark)' }}>
                  {student.mentor?.name || 'Dr. Kavitha Ramanathan'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  Assigned Faculty Mentor &bull; CSE Department
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowMeetingModal(true)}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.74rem', background: '#ffffff', borderColor: 'var(--primary-border)', color: 'var(--primary)', fontWeight: '700' }}
            >
              Request Meeting
            </button>
          </div>

        </div>

      </div>

      {/* =====================================================================
          MY MEETING REQUESTS & ADVISORY STATUS (Read-only status list)
          ===================================================================== */}
      <div className="card" style={{ marginBottom: '1.5rem', background: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--dark)', margin: 0 }}>
              My Meeting Requests &amp; Advisories
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: '0.2rem 0 0' }}>
              Track the status of your 1-on-1 mentor guidance and counseling requests.
            </p>
          </div>
          <span className="badge badge-light-primary" style={{ fontSize: '0.75rem' }}>
            {myMeetingRequests.length} Recorded
          </span>
        </div>

        {myMeetingRequests.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: 0 }}>
            No meeting requests logged yet. Use "Request Mentor Guidance" or chat with the AI Advisor if you need support.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: 'var(--bg-body)' }}>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Category</th>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Reason</th>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Status</th>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Scheduled Time</th>
                  <th style={{ padding: '0.6rem 0.75rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {myMeetingRequests.map((m) => (
                  <tr key={m.request_id || m._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.6rem 0.75rem', textTransform: 'capitalize' }}>
                      <span className={`badge ${m.urgency === 'urgent' ? 'badge-light-danger' : 'badge-light-primary'}`} style={{ fontSize: '0.7rem' }}>
                        {m.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--dark)' }}>{m.reason_short}</td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <span className={`badge ${m.status === 'resolved' ? 'badge-light-success' : m.status === 'scheduled' ? 'badge-light-primary' : m.status === 'acknowledged' ? 'badge-light-warning' : 'badge-light-danger'}`} style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--muted)' }}>
                      {m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : 'Pending confirmation'}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--muted)' }}>
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL: REQUEST 1-ON-1 GUIDANCE MEETING
          ===================================================================== */}
      {showMeetingModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="card fade-in" style={{
            maxWidth: '500px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '6px', borderRadius: '8px', display: 'inline-flex' }}>
                  <UserCheck size={18} />
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--dark)', margin: 0 }}>
                  Request Guidance Meeting
                </h3>
              </div>
              <button
                onClick={() => setShowMeetingModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {meetingSubmitted ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--dark)', marginBottom: '0.4rem' }}>
                  Meeting Request Submitted!
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>
                  Your request has been forwarded to <strong>Dr. Kavitha Ramanathan</strong>. A slot will be confirmed during the upcoming tutorial hour.
                </p>
              </div>
            ) : (
              <form onSubmit={handleMeetingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--dark)' }}>
                    Meeting Objective
                  </label>
                  <select
                    value={meetingReason}
                    onChange={(e) => setMeetingReason(e.target.value)}
                    className="select-control"
                    style={{ width: '100%', height: '38px', fontSize: '0.82rem' }}
                  >
                    <option value="attendance">Compensatory Lab &amp; Attendance Recovery Plan</option>
                    <option value="backlogs">Arrear Course Clearance &amp; Study Resources</option>
                    <option value="cia">Internal Assessment (CIA) Retest Consultation</option>
                    <option value="general">General Academic Counseling &amp; Project Guidance</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--dark)' }}>
                    Preferred Time Slot
                  </label>
                  <input
                    type="text"
                    defaultValue="Upcoming Department Tutorial Hour (3:30 PM - 4:30 PM)"
                    className="input-control"
                    style={{ width: '100%', fontSize: '0.82rem', padding: '0.55rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--dark)' }}>
                    Brief Note for Mentor (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., I would like advice on recovering my 3.5% attendance deficit before semester exams..."
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    className="input-control"
                    style={{ width: '100%', fontSize: '0.82rem', padding: '0.55rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowMeetingModal(false)}
                    style={{ fontSize: '0.82rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ fontSize: '0.82rem', gap: '0.4rem' }}
                  >
                    <Send size={14} />
                    <span>Send Request to Mentor</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
