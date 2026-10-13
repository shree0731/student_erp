import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  AlertTriangle,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function ParentAlertModal({ isOpen, onClose, student, onAlertSent }) {
  // All hooks strictly defined at top before any conditional returns (fixes hook order bug)
  const [parentName, setParentName] = useState('');
  const [reason, setReason] = useState('attendance');
  const [customNotes, setCustomNotes] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (student) {
      const names = (student.student_name || 'Student').split(' ');
      const lastName = names.length > 1 ? names[names.length - 1] : names[0];
      setParentName(`Mr. / Mrs. ${lastName}`);

      if (student.attendance_pct < 75) {
        setReason('attendance');
      } else if (student.backlogs_count > 0) {
        setReason('backlogs');
      } else {
        setReason('general');
      }
      setCopied(false);
      setCustomNotes('');
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const defaultTemplates = {
    attendance: `OFFICIAL ACADEMIC NOTICE: ${student.college_name || 'Institution'}
Dear ${parentName || 'Parent / Guardian'},
This is an academic intimation regarding your ward ${student.student_name} (${student.student_id}), Department of ${student.department || 'Engineering'}, Year ${student.year_of_study || 2}.
Current Semester Attendance: ${student.attendance_pct}% (Below the 75% statutory exam eligibility cutoff).
We request you to contact the department faculty mentor to discuss an attendance recovery plan.`,

    backlogs: `OFFICIAL ACADEMIC NOTICE: ${student.college_name || 'Institution'}
Dear ${parentName || 'Parent / Guardian'},
This is an academic performance update regarding your ward ${student.student_name} (${student.student_id}), Department of ${student.department || 'Engineering'}.
Current Standing: ${student.backlogs_count} standing course backlogs requiring remedial attention.
Special department tutorial hours are available. Please encourage your ward to attend the diagnostic mentoring sessions.`,

    general: `OFFICIAL ACADEMIC NOTICE: ${student.college_name || 'Institution'}
Dear ${parentName || 'Parent / Guardian'},
Regarding the academic progress of ${student.student_name} (${student.student_id}):
Attendance: ${student.attendance_pct}% | Active Backlogs: ${student.backlogs_count || 0}.
You are invited for a mentor consultation to discuss your ward's academic standing.`
  };

  const messageText = customNotes || defaultTemplates[reason] || defaultTemplates.attendance;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      if (onAlertSent) {
        onAlertSent({
          studentId: student.student_id,
          studentName: student.student_name,
          date: 'Just now',
          category: reason === 'attendance' ? 'Attendance Shortage (<75%)' : 'Academic Standing Update',
          actionTaken: 'Prepared communication draft copied to clipboard',
          status: 'Draft Prepared',
          notes: `Communication draft prepared for ${parentName}.`
        });
      }
    } catch (err) {
      console.warn('[ParentAlertModal] Clipboard copy failed:', err.message);
    }
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
                Parent / Guardian Communication Template
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0 }}>
              Prepare an official academic notification draft for student guardians
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
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

        {/* Honest Disclosure Notice */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          fontSize: '0.78rem',
          color: '#1e40af',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          lineHeight: '1.45'
        }}>
          <FileText size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong>Manual Communication Draft:</strong> No automatic SMS or Email dispatch service is connected. Faculty mentors should review and copy this prepared draft to contact the student's parent or guardian through official institutional communication channels.
          </div>
        </div>

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
              {student.student_id} &bull; {student.department} (Year {student.year_of_study || 2})
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
              {student.backlogs_count || 0} Backlog{student.backlogs_count === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        {/* Parent / Guardian Salutation */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--dark)' }}>
            Parent / Guardian Salutation
          </label>
          <input
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            className="input-control"
            placeholder="e.g. Mr. / Mrs. Parent"
            style={{ width: '100%', fontSize: '0.82rem', padding: '0.5rem 0.65rem' }}
          />
        </div>

        {/* Template Selector */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.25rem', color: 'var(--dark)' }}>
            Notification Reason
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
            <option value="attendance">Statutory Attendance Deficit (&lt;75% Exam Eligibility Warning)</option>
            <option value="backlogs">Academic Arrear Clearance &amp; Tutorial Plan</option>
            <option value="general">Routine Academic Mentor-Parent Consultation</option>
          </select>
        </div>

        {/* Editable Message Preview */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--dark)' }}>
              Prepared Message (Editable)
            </label>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
              {messageText.length} characters
            </span>
          </div>
          <textarea
            rows={6}
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
            style={{ fontSize: '0.82rem', padding: '0.55rem 1rem' }}
          >
            Close
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCopy}
            style={{
              fontSize: '0.82rem',
              padding: '0.55rem 1.25rem',
              gap: '0.5rem',
              background: copied ? 'var(--success, #10b981)' : 'linear-gradient(135deg, #5d87ff, #4570ea)'
            }}
          >
            {copied ? (
              <>
                <CheckCircle2 size={16} />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Message</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
