import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BrainCircuit,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

const DEPARTMENTS = [
  'CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Automobile',
  'Robotics', 'Cyber Security', 'Chemical', 'Biomedical', 'Biotechnology', 'AIDS'
];

export default function AssessStudentModal({ isOpen, onClose, onAssessmentCompleted }) {
  const [examples, setExamples] = useState([]);
  const [selectedExampleIndex, setSelectedExampleIndex] = useState('');
  const [formData, setFormData] = useState({
    student_name: '',
    department: 'CSE',
    year_of_study: 2,
    attendance_pct: 75.0,
    attendance_decay: 0.0,
    overall_gpa: 6.5,
    backlogs_count: 0,
    cutoff_mark_200: 165.0,
    family_income_annual: 300000,
    mentor_meetings_attended: 3,
    first_gen_learner: 0,
    distance_from_home_km: 25.0,
    failed_subjects_count: 0,
    core_theory_average: 65.0,
    internal_exam_avg: 68.0,
    assignment_avg: 70.0,
    grade_trend: 0.0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [assessmentResult, setAssessmentResult] = useState(null);

  // Fetch demo examples once on open
  useEffect(() => {
    if (isOpen) {
      setError('');
      setAssessmentResult(null);
      setSelectedExampleIndex('');
      api.getAssessExamples()
        .then(res => {
          if (res && Array.isArray(res.data)) {
            setExamples(res.data);
          }
        })
        .catch(err => {
          console.warn('[AssessModal] Could not fetch demo examples:', err.message);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExampleSelect = (e) => {
    const val = e.target.value;
    setSelectedExampleIndex(val);
    if (val === '') return;
    const ex = examples[parseInt(val, 10)];
    if (ex) {
      setFormData({
        student_name: ex.student_name || '',
        department: ex.department || 'CSE',
        year_of_study: ex.year_of_study ?? 2,
        attendance_pct: ex.attendance_pct ?? 75.0,
        attendance_decay: ex.attendance_decay ?? 0.0,
        overall_gpa: ex.overall_gpa ?? 6.5,
        backlogs_count: ex.backlogs_count ?? 0,
        cutoff_mark_200: ex.cutoff_mark_200 ?? 165.0,
        family_income_annual: ex.family_income_annual ?? 300000,
        mentor_meetings_attended: ex.mentor_meetings_attended ?? 3,
        first_gen_learner: ex.first_gen_learner ?? 0,
        distance_from_home_km: ex.distance_from_home_km ?? 25.0,
        failed_subjects_count: ex.failed_subjects_count ?? 0,
        core_theory_average: ex.core_theory_average ?? 65.0,
        internal_exam_avg: ex.internal_exam_avg ?? 68.0,
        assignment_avg: ex.assignment_avg ?? 70.0,
        grade_trend: ex.grade_trend ?? 0.0
      });
      setError('');
    }
  };

  const handleChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        student_name: formData.student_name.trim(),
        department: formData.department,
        year_of_study: Number(formData.year_of_study),
        attendance_pct: Number(formData.attendance_pct),
        attendance_decay: Number(formData.attendance_decay),
        overall_gpa: Number(formData.overall_gpa),
        backlogs_count: Number(formData.backlogs_count),
        cutoff_mark_200: Number(formData.cutoff_mark_200),
        family_income_annual: Number(formData.family_income_annual),
        mentor_meetings_attended: Number(formData.mentor_meetings_attended),
        first_gen_learner: Number(formData.first_gen_learner),
        distance_from_home_km: Number(formData.distance_from_home_km),
        failed_subjects_count: Number(formData.failed_subjects_count),
        core_theory_average: Number(formData.core_theory_average),
        internal_exam_avg: Number(formData.internal_exam_avg),
        assignment_avg: Number(formData.assignment_avg),
        grade_trend: Number(formData.grade_trend)
      };

      const res = await api.assessStudent(payload);
      setAssessmentResult(res);
      if (onAssessmentCompleted) {
        onAssessmentCompleted(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to complete assessment');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAssessmentResult(null);
    setSelectedExampleIndex('');
    setError('');
  };

  const pred = assessmentResult?.prediction?.prediction || assessmentResult?.assessment?.prediction;
  const probs = assessmentResult?.prediction?.probabilities || assessmentResult?.assessment?.probabilities || {};
  const drivers = assessmentResult?.prediction?.top_risk_drivers || assessmentResult?.assessment?.top_risk_drivers || [];
  const interventions = assessmentResult?.prediction?.recommended_interventions || [];
  const actions = assessmentResult?.actions || [];

  return (
    <div className="dialog-backdrop">
      <div className="dialog-card fade-in" style={{
        maxWidth: assessmentResult ? '720px' : '650px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1.75rem',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{
                background: 'var(--purple-soft)',
                color: 'var(--purple)',
                padding: '6px',
                borderRadius: '8px',
                display: 'inline-flex'
              }}>
                <BrainCircuit size={18} />
              </span>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--ink)', margin: 0 }}>
                {assessmentResult ? 'Real-Time ML Assessment Result' : 'Assess New Student Profile'}
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--mute)', margin: 0 }}>
              {assessmentResult
                ? `Evaluation generated for ${assessmentResult?.student?.student_name} (${assessmentResult?.student?.student_id})`
                : 'Enter all 16 academic parameters to run trained XGBoost inference and trigger automated interventions.'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '4px', minWidth: 'auto', borderRadius: '50%' }}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#DC2626',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* --- VIEW 1: ASSESSMENT FORM --- */}
        {!assessmentResult && (
          <form onSubmit={handleSubmit}>
            {/* Load Example Selector */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid var(--line)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem'
            }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                Load Example Student (Unseen Dataset)
              </label>
              <select
                className="input-field"
                value={selectedExampleIndex}
                onChange={handleExampleSelect}
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <option value="">-- Choose an unseen student profile to auto-fill form --</option>
                {examples.map((ex, idx) => (
                  <option key={idx} value={idx}>
                    {ex.student_name} &bull; {ex.department} (Year {ex.year_of_study}) &bull; Attn: {ex.attendance_pct}% &bull; GPA: {ex.overall_gpa} &bull; Backlogs: {ex.backlogs_count}
                  </option>
                ))}
              </select>
            </div>

            {/* Inputs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Student Name *</label>
                <input
                  type="text"
                  className="input-field"
                  required
                  value={formData.student_name}
                  onChange={e => handleChange('student_name', e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Department *</label>
                <select
                  className="input-field"
                  value={formData.department}
                  onChange={e => handleChange('department', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Year of Study (1-4) *</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  className="input-field"
                  required
                  value={formData.year_of_study}
                  onChange={e => handleChange('year_of_study', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Overall GPA (0-10) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="input-field"
                  required
                  value={formData.overall_gpa}
                  onChange={e => handleChange('overall_gpa', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Attendance % (0-100) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  className="input-field"
                  required
                  value={formData.attendance_pct}
                  onChange={e => handleChange('attendance_pct', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Attendance Decay *</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  required
                  value={formData.attendance_decay}
                  onChange={e => handleChange('attendance_decay', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Active Backlogs Count *</label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  required
                  value={formData.backlogs_count}
                  onChange={e => handleChange('backlogs_count', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Cutoff Mark (/200) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="200"
                  className="input-field"
                  required
                  value={formData.cutoff_mark_200}
                  onChange={e => handleChange('cutoff_mark_200', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Failed Subjects Count *</label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  required
                  value={formData.failed_subjects_count}
                  onChange={e => handleChange('failed_subjects_count', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Core Theory Average *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="input-field"
                  required
                  value={formData.core_theory_average}
                  onChange={e => handleChange('core_theory_average', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Internal Exam Avg *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="input-field"
                  required
                  value={formData.internal_exam_avg}
                  onChange={e => handleChange('internal_exam_avg', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Assignment Avg *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="input-field"
                  required
                  value={formData.assignment_avg}
                  onChange={e => handleChange('assignment_avg', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Grade Trend *</label>
                <input
                  type="number"
                  step="0.01"
                  min="-10"
                  max="10"
                  className="input-field"
                  required
                  value={formData.grade_trend}
                  onChange={e => handleChange('grade_trend', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Family Annual Income *</label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  required
                  value={formData.family_income_annual}
                  onChange={e => handleChange('family_income_annual', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Mentor Meetings Attended *</label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  required
                  value={formData.mentor_meetings_attended}
                  onChange={e => handleChange('mentor_meetings_attended', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>First Gen Learner (0/1) *</label>
                <select
                  className="input-field"
                  value={formData.first_gen_learner}
                  onChange={e => handleChange('first_gen_learner', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                >
                  <option value={0}>0 (No)</option>
                  <option value={1}>1 (Yes)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.25rem' }}>Distance from Home (km) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="input-field"
                  required
                  value={formData.distance_from_home_km}
                  onChange={e => handleChange('distance_from_home_km', e.target.value)}
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ gap: '0.5rem' }}
              >
                {loading ? 'Running Model Inference...' : 'Score Student & Execute Actions'}
                {!loading && <ArrowRight size={14} />}
              </button>
            </div>
          </form>
        )}

        {/* --- VIEW 2: EXISTING RISK CARD RESULT --- */}
        {assessmentResult && (
          <div>
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--line)' }}>
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'var(--purple-soft)', color: 'var(--purple)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <BrainCircuit size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>
                      Live Risk Assessment
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      XGBoost Pipeline ({assessmentResult?.prediction?.explanation_method || 'SHAP Tree Explainer'})
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700',
                    background: pred === 'High' ? '#FEE2E2' : pred === 'Medium' ? '#FEF3C7' : '#D1FAE5',
                    color: pred === 'High' ? '#DC2626' : pred === 'Medium' ? '#D97706' : '#059669',
                    border: `1px solid ${pred === 'High' ? '#FCA5A5' : pred === 'Medium' ? '#FCD34D' : '#6EE7B7'}`
                  }}>
                    {pred === 'High' && <AlertTriangle size={12} />}
                    {pred === 'Low' && <CheckCircle2 size={12} />}
                    {pred === 'Medium' && <Clock size={12} />}
                    Predicted: {pred} Risk
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} /> Live Model Active
                  </span>
                </div>
              </div>

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

              {/* Drivers & Interventions Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                    Top Risk Drivers (SHAP Explainability)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {drivers && drivers.length > 0 ? (
                      drivers.map((driver, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '0.5rem 0.65rem',
                            background: '#F8FAFC',
                            borderLeft: '3px solid var(--purple)',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
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
                            <span style={{ fontSize: '0.7rem', padding: '2px 5px', background: '#F1F5F9', color: '#64748B', borderRadius: '4px', fontWeight: '700' }}>
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

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.04em' }}>
                    Recommended Interventions
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {interventions && interventions.length > 0 ? (
                      interventions.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '0.5rem 0.65rem',
                            background: '#F8FAFC',
                            borderLeft: '3px solid #3B82F6',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            color: '#1E293B'
                          }}
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>No specific interventions required.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Taken Section */}
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--line)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--ink)', textTransform: 'uppercase', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="var(--purple)" />
                <span>Automated Action Engine Logs</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {actions.map((act, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      background: '#F8FAFC',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div>
                      <strong>{act.step}</strong>: <span style={{ color: 'var(--mute)' }}>{act.detail}</span>
                    </div>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      background: act.status === 'ok' ? '#D1FAE5' : act.status === 'skipped' ? '#E2E8F0' : '#FEE2E2',
                      color: act.status === 'ok' ? '#059669' : act.status === 'skipped' ? '#475569' : '#DC2626'
                    }}>
                      {act.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Done button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={resetForm}
              >
                Assess Another Student
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
