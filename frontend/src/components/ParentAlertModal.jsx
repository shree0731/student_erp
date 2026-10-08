import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  ShieldAlert,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';

export default function ParentAlertModal({ isOpen, onClose, student, onAlertSent }) {
  if (!isOpen || !student) return null;

  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('+91 98401 82341');
  const [parentEmail, setParentEmail] = useState('');
  const [channel, setChannel] = useState('both'); // 'sms' | 'email' | 'both'
  const [reason, setReason] = useState('attendance');
  const [customNotes, setCustomNotes] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [dispatchRef, setDispatchRef] = useState('');

  useEffect(() => {
    if (student) {
      const names = (student.student_name || 'Student').split(' ');
      const lastName = names.length > 1 ? names[names.length - 1] : names[0];
      setParentName(`Mr. / Mrs. ${lastName}`);
      const cleanId = (student.student_id || 'stu').toLowerCase().replace(/[^a-z0-9]/g, '');
      setParentEmail(`parent.${cleanId}@gmail.com`);

      if (student.attendance_pct < 75) {
        setReason('attendance');
      } else if (student.backlogs_count > 0) {
        setReason('backlogs');
      } else {
        setReason('general');
      }
      setSentSuccess(false);
      setSending(false);
    }
  }, [student]);

  const defaultTemplates = {
    attendance: `OFFICIAL NOTICE: ${student.college_name || 'Apex Engineering College'}
Dear ${parentName},
This is an urgent academic intimation regarding your ward ${student.student_name} (${student.student_id}), Dept of ${student.department || 'CSE'}, Year ${student.year_of_study || 2}.
Current Semester Attendance: ${student.attendance_pct}% (Deficit of ${(75 - Number(student.attendance_pct)).toFixed(1)}% below Anna University 75% statutory bar).
Please ensure your ward attends the upcoming Saturday Compensatory Clinics to prevent semester exam debarment.
Mentor Contact: Dr. Kavitha Ramanathan (+91 94441 56789).`,

    backlogs: `OFFICIAL NOTICE: ${student.college_name || 'Apex Engineering College'}
Dear ${parentName},
This is an academic performance update regarding your ward ${student.student_name} (${student.student_id}), Dept of ${student.department || 'CSE'}.
Your ward has ${student.backlogs_count} standing course backlogs requiring immediate remedial attention.
Special department tutorial hours have been scheduled this week.
Please counsel your ward to attend the diagnostic mentoring session.`,

    general: `OFFICIAL NOTICE: ${student.college_name || 'Apex Engineering College'}
Dear ${parentName},
Regarding academic progress of ${student.student_name} (${student.student_id}):
Attendance: ${student.attendance_pct}% | Current Standing: Under Faculty Mentoring.
You are invited for a brief virtual or on-campus mentor consultation with Dr. Kavitha Ramanathan.`
  };

  const messageText = customNotes || defaultTemplates[reason] || defaultTemplates.attendance;

  const handleDispatch = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSentSuccess(true);
      const ref = `INT-PAR-${Math.floor(1000 + Math.random() * 9000)}`;
      setDispatchRef(ref);

      if (onAlertSent) {
        onAlertSent({
          id: ref,
          studentId: student.student_id,
          studentName: student.student_name,
          date: 'Just now',
          category: reason === 'attendance' ? 'Attendance Shortage (<75%)' : 'Arrear Clearing & CIA Exam Remedial',
          actionTaken: `Parent Intimation (${channel.toUpperCase()}) Dispatched to ${parentPhone}`,
          status: 'Notice Dispatched',
          notes: `Official notice sent to ${parentName}. Reason: ${reason === 'attendance' ? 'Statutory Attendance Deficit' : 'Academic Performance'}.`
        });
      }
    }, 1200);
  };

  return (
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
        maxWidth: '560px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        background: '#ffffff',
        borderRadius: '16px',
        padding: '1.75rem',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--border)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                padding: '6px',
                borderRadius: '8px',
                display: 'inline-flex'
              }}>
                <AlertTriangle size={18} />
              </span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--dark)', margin: 0 }}>
                Parent / Guardian Intimation
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0 }}>
              Anna University Autonomous Clause 6.2 &bull; Statutory Academic Warning Notice
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-body)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {sentSuccess ? (
          /* SUCCESS SCREEN */
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--success-light)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--dark)', marginBottom: '0.35rem' }}>
              Intimation Notice Dispatched!
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
              Official intimation has been transmitted to <strong>{parentName}</strong>.
            </p>

            <div style={{
              background: 'var(--bg-body)',
              borderRadius: '12px',
              padding: '1rem',
              textAlign: 'left',
              fontSize: '0.8rem',
              color: 'var(--dark)',
              border: '1px solid var(--border)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--muted)' }}>Dispatch Reference:</span>
                <strong style={{ color: 'var(--primary)' }}>{dispatchRef}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--muted)' }}>Recipient Contact:</span>
                <strong>{parentPhone} &bull; {parentEmail}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--muted)' }}>Channels Used:</span>
                <span className="badge badge-light-primary">{channel.toUpperCase()} Gateway</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--muted)' }}>Audit Log:</span>
                <span style={{ color: 'var(--success)', fontWeight: '700' }}>✓ Logged in ERP Interventions</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={onClose}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Done &bull; Return to Dashboard
            </button>
          </div>
        ) : (
          /* FORM CONTENT */
          <div>
            {/* Student Dossier Strip */}
            <div style={{
              background: 'var(--bg-body)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              border: '1px solid var(--border)'
            }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.92rem', color: 'var(--dark)' }}>
                  {student.student_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {student.student_id} &bull; {student.department} (Year {student.year_of_study})
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '800',
                  color: student.attendance_pct < 75 ? 'var(--danger)' : 'var(--success)'
                }}>
                  {student.attendance_pct}% Attd
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                  {student.backlogs_count} Backlog{student.backlogs_count === 1 ? '' : 's'}
                </div>
              </div>
            </div>

            {/* Recipient Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--dark)' }}>
                  Parent / Guardian Name
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="input-control"
                  style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem 0.65rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--dark)' }}>
                  Primary Phone (SMS)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="input-control"
                    style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem 0.65rem' }}
                  />
                </div>
              </div>
            </div>

            {/* Channel Selection */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.35rem', color: 'var(--dark)' }}>
                Dispatch Channel
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setChannel('both')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    border: channel === 'both' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: channel === 'both' ? 'var(--primary-light)' : '#ffffff',
                    color: channel === 'both' ? 'var(--primary)' : 'var(--dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={14} /> SMS + Email
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    border: channel === 'sms' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: channel === 'sms' ? 'var(--primary-light)' : '#ffffff',
                    color: channel === 'sms' ? 'var(--primary)' : 'var(--dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Phone size={14} /> SMS Only
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    border: channel === 'email' ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: channel === 'email' ? 'var(--primary-light)' : '#ffffff',
                    color: channel === 'email' ? 'var(--primary)' : 'var(--dark)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Mail size={14} /> Email Notice
                </button>
              </div>
            </div>

            {/* Template Selector */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--dark)' }}>
                Intimation Reason &amp; Clause
              </label>
              <select
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setCustomNotes('');
                }}
                className="select-control"
                style={{ width: '100%', fontSize: '0.82rem', height: '36px' }}
              >
                <option value="attendance">Statutory Attendance Deficit (&lt;75% Exam Debarment Warning)</option>
                <option value="backlogs">Academic Arrear Clearance &amp; CIA Remedial Plan</option>
                <option value="general">Routine Mid-Semester Mentor-Parent Consultation</option>
              </select>
            </div>

            {/* Editable Message Preview */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--dark)' }}>
                  Message Preview (Editable)
                </label>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                  {messageText.length} characters
                </span>
              </div>
              <textarea
                rows={5}
                value={messageText}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="input-control"
                style={{
                  width: '100%',
                  fontSize: '0.78rem',
                  lineHeight: '1.45',
                  padding: '0.65rem',
                  fontFamily: 'monospace',
                  background: '#f8fafc',
                  borderRadius: '8px'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={sending}
                style={{ fontSize: '0.82rem', padding: '0.55rem 1rem' }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDispatch}
                disabled={sending}
                style={{
                  fontSize: '0.82rem',
                  padding: '0.55rem 1.25rem',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #5d87ff, #4570ea)'
                }}
              >
                {sending ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    <span>Transmitting Notice...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Dispatch Official Notice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
