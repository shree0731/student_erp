import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, SAMPLE_PERSONAS } from '../../context/AuthContext';
import {
  Rocket,
  GraduationCap,
  AlertCircle,
  Building2,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const COLLEGES = [
  { code: 'C101', name: 'Apex Engineering College (Autonomous)' },
  { code: 'C102', name: 'Kavery Residential Institute of Technology (Autonomous)' },
  { code: 'C103', name: 'Modern Institute of Science & Technology' },
  { code: 'C104', name: 'Sahyadri Deemed University (Multi-State)' }
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const roleParam = queryParams.get('role');
  const initialPersonaKey = roleParam === 'student' ? 'student-high' : (roleParam === 'admin' ? 'admin' : 'mentor');
  const initialPersona = SAMPLE_PERSONAS[initialPersonaKey] || SAMPLE_PERSONAS['mentor'];
  const initialCollege = queryParams.get('college') || initialPersona?.collegeId || 'C101';

  const [college, setCollege] = useState(initialCollege);
  const [identifier, setIdentifier] = useState(initialPersona?.username || initialPersona?.id || 'mentor');
  const [password, setPassword] = useState('DemoPass@2026');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [activePersona, setActivePersona] = useState(initialPersonaKey);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isDemoMode = import.meta.env.VITE_DEMO_MODE !== 'false';

  const handleQuickFill = (personaKey) => {
    setErrorMsg('');
    setActivePersona(personaKey);
    const persona = SAMPLE_PERSONAS[personaKey];
    if (!persona) return;

    setCollege(persona.collegeId || 'C101');
    setIdentifier(persona.username || persona.id);
    setPassword('DemoPass@2026');
  };

  // Synchronize persona pre-fill when URL query param changes
  useEffect(() => {
    const role = new URLSearchParams(location.search).get('role');
    if (role === 'student') {
      handleQuickFill('student-high');
    } else if (role === 'mentor') {
      handleQuickFill('mentor');
    } else if (role === 'admin') {
      handleQuickFill('admin');
    }
  }, [location.search]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await login(identifier, password);

      if (result && result.success) {
        const user = result.user;
        if (user.role === 'student') {
          navigate('/student/dashboard');
        } else if (user.role === 'mentor') {
          navigate('/mentor/dashboard');
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/mentor/dashboard');
        }
      } else {
        setErrorMsg(result?.message || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setErrorMsg('Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Top-Left Logo */}
      <div style={{ position: 'absolute', top: '22px', left: '26px', display: 'flex', alignItems: 'center', gap: '0.65rem', zIndex: 20 }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'var(--primary)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
        }}>
          <Rocket size={20} fill="none" strokeWidth={1.8} />
        </div>
        <span style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--ink)', letterSpacing: '-0.02em' }}>
          ERP
        </span>
      </div>

      {/* Floating Decorative Layer (aria-hidden, hidden <900px) */}
      <div className="auth-decorative-layer" aria-hidden="true">
        {/* Butterfly 1 */}
        <div className="butterfly b1">
          <svg className="butterfly-svg" viewBox="0 0 100 100">
            <g className="wing left-wing">
              <path d="M50,50 C30,20 5,25 20,55 C10,70 20,90 45,65" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            </g>
            <g className="wing right-wing">
              <path d="M50,50 C70,20 95,25 80,55 C90,70 80,90 55,65" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            </g>
            <ellipse cx="50" cy="52" rx="3" ry="12" fill="#78350F" />
            <circle cx="50" cy="42" r="4" fill="#78350F" />
          </svg>
        </div>

        {/* Butterfly 2 */}
        <div className="butterfly b2">
          <svg className="butterfly-svg" viewBox="0 0 100 100">
            <g className="wing left-wing">
              <path d="M50,50 C30,20 5,25 20,55 C10,70 20,90 45,65" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            </g>
            <g className="wing right-wing">
              <path d="M50,50 C70,20 95,25 80,55 C90,70 80,90 55,65" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            </g>
            <ellipse cx="50" cy="52" rx="3" ry="12" fill="#78350F" />
            <circle cx="50" cy="42" r="4" fill="#78350F" />
          </svg>
        </div>

        {/* Butterfly 3 */}
        <div className="butterfly b3">
          <svg className="butterfly-svg" viewBox="0 0 100 100">
            <g className="wing left-wing">
              <path d="M50,50 C30,20 5,25 20,55 C10,70 20,90 45,65" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            </g>
            <g className="wing right-wing">
              <path d="M50,50 C70,20 95,25 80,55 C90,70 80,90 55,65" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            </g>
            <ellipse cx="50" cy="52" rx="3" ry="12" fill="#78350F" />
            <circle cx="50" cy="42" r="4" fill="#78350F" />
          </svg>
        </div>

        {/* Butterfly 4 */}
        <div className="butterfly b4">
          <svg className="butterfly-svg" viewBox="0 0 100 100">
            <g className="wing left-wing">
              <path d="M50,50 C30,20 5,25 20,55 C10,70 20,90 45,65" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            </g>
            <g className="wing right-wing">
              <path d="M50,50 C70,20 95,25 80,55 C90,70 80,90 55,65" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            </g>
            <ellipse cx="50" cy="52" rx="3" ry="12" fill="#78350F" />
            <circle cx="50" cy="42" r="4" fill="#78350F" />
          </svg>
        </div>

        {/* Folder Card 1 (Left) */}
        <div className="floating-folder" style={{ top: '24%', left: '8%', transform: 'rotate(-4deg)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Mentee Case Records
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--ink)', fontWeight: '600', marginTop: '4px' }}>
            16 Active Students • AU 75%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--mute)', marginTop: '2px' }}>
            Bi-directional counseling sync
          </div>
        </div>

        {/* Folder Card 2 (Right) */}
        <div className="floating-folder" style={{ bottom: '22%', right: '8%', transform: 'rotate(3.5deg)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: '800', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Baymate AI Inference
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--ink)', fontWeight: '600', marginTop: '4px' }}>
            Real-time Risk Vectors
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--mute)', marginTop: '2px' }}>
            Connected to 45ms ML Engine
          </div>
        </div>

        {/* Floating Yellow Sticky Note with Caveat Font */}
        <div className="floating-note-yellow" style={{ top: '16%', right: '11%', transform: 'rotate(2.5deg)' }}>
          📌 AU Statutory Notice:
          Attendance below 75% requires immediate mentor intimation &amp; counseling log.
        </div>

        {/* Floating Pink Sticky Note with Caveat Font */}
        <div className="floating-note-pink" style={{ bottom: '18%', left: '10%', transform: 'rotate(-3deg)' }}>
          📝 Scheduled Guidance:
          Counseling session booked with Faculty Advisor Dr. Kavitha today.
        </div>
      </div>

      {/* Centered Tile + Two-Line H1 */}
      <div style={{ textAlign: 'center', marginBottom: '1.6rem', zIndex: 10 }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '16px',
          background: 'var(--soft)',
          color: 'var(--primary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
          border: '1px solid var(--line)',
          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.12)'
        }}>
          <GraduationCap size={28} strokeWidth={1.8} />
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--ink)', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
          Sign in to ERP
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--mute)', margin: '6px 0 0', fontWeight: '500' }}>
          Student Dropout Prediction &amp; Proactive Academic Intervention
        </p>
      </div>

      {/* Main Login Card (16px radius, line border) */}
      <div className="auth-card fade-in">
        {errorMsg && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: 'var(--red)',
            padding: '0.65rem 0.95rem',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: '600',
            marginBottom: '1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} flexShrink={0} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* College Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.35rem' }}>
              Institution / Affiliated College
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="select-control"
                style={{ width: '100%', paddingLeft: '2.4rem' }}
              >
                {COLLEGES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              <Building2 size={16} color="var(--mute)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Identifier Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.35rem' }}>
              Username / Faculty or Student ID
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input-control"
                style={{ width: '100%', paddingLeft: '2.4rem' }}
                placeholder="e.g. mentor, FAC_EEC_CSE_001, student"
                required
              />
              <User size={16} color="var(--mute)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--ink)', marginBottom: '0.35rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-control"
                style={{ width: '100%', paddingLeft: '2.4rem' }}
                placeholder="••••••••"
                required
              />
              <Lock size={16} color="var(--mute)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Remember Device Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: 'var(--mute)' }}>
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span>Remember this device</span>
            </label>
            <span style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>
              Need assistance?
            </span>
          </div>

          {/* Full-Width Primary Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem', fontSize: '0.92rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Accounts Panel (shown if VITE_DEMO_MODE !== 'false') */}
        {isDemoMode && (
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--line)',
            background: 'var(--soft)',
            borderRadius: '12px',
            padding: '12px 14px'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              Quick Demo Personas (Pre-Fill)
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('mentor')}
                className={`pill ${activePersona === 'mentor' ? 'pill-scheduled' : 'badge-light-secondary'}`}
                style={{ cursor: 'pointer', border: '1px solid var(--line)', fontSize: '0.74rem' }}
              >
                Faculty Mentor
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('student-high')}
                className={`pill ${activePersona === 'student-high' ? 'pill-high' : 'badge-light-secondary'}`}
                style={{ cursor: 'pointer', border: '1px solid var(--line)', fontSize: '0.74rem' }}
              >
                High-Risk Mentee
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('student-safe')}
                className={`pill ${activePersona === 'student-safe' ? 'pill-low' : 'badge-light-secondary'}`}
                style={{ cursor: 'pointer', border: '1px solid var(--line)', fontSize: '0.74rem' }}
              >
                Safe Mentee
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className={`pill ${activePersona === 'admin' ? 'pill-scheduled' : 'badge-light-secondary'}`}
                style={{ cursor: 'pointer', border: '1px solid var(--line)', fontSize: '0.74rem' }}
              >
                Institutional Dean
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
