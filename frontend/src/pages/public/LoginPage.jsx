import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, SAMPLE_PERSONAS } from '../../context/AuthContext';
import {
  Rocket,
  ArrowRight,
  AlertCircle,
  Sparkles,
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
  const initialCollege = queryParams.get('college') || 'C101';

  const [college, setCollege] = useState(initialCollege);
  const [identifier, setIdentifier] = useState('FAC_EEC_CSE_001');
  const [password, setPassword] = useState('demo1234');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [activePersona, setActivePersona] = useState('mentor');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickFill = (personaKey) => {
    setErrorMsg('');
    setActivePersona(personaKey);
    const persona = SAMPLE_PERSONAS[personaKey];
    if (!persona) return;

    setCollege(persona.collegeId || 'C101');
    setIdentifier(persona.username || persona.id);
    setPassword('DemoPass@2026');
  };

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
      {/* Background Floating Blobs matching Spike Admin Authguard */}
      <div className="auth-blob auth-blob-top" />
      <div className="auth-blob auth-blob-bottom" />

      {/* Main Centered 2-Column Card */}
      <div className="auth-card fade-in">
        
        {/* Left Column: Spike Admin Security Illustration & Brand */}
        <div className="auth-left-col">
          {/* Logo at Top-Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: '100%' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(93, 135, 255, 0.2)'
            }}>
              <Rocket size={20} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--dark)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                Spike Admin
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: '600' }}>
                Academic ERP Consortium
              </div>
            </div>
          </div>

          {/* Polished 3D Vector Security Graphic matching Spike Authguard Image 4 */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '0.75rem 0' }}>
            <svg width="280" height="190" viewBox="0 0 340 210" fill="none" style={{ maxWidth: '100%', height: 'auto' }}>
              <defs>
                <linearGradient id="vaultGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="pigGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="100%" stopColor="#db2777" />
                </linearGradient>
                <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.1" />
                </filter>
              </defs>

              {/* Ground Shadow Ellipse */}
              <ellipse cx="170" cy="188" rx="145" ry="12" fill="#e2e8f0" opacity="0.7" />

              {/* Little Grass Tufts */}
              <path d="M75 188 C73 182 70 178 68 188" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M78 188 C80 181 83 177 85 188" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M165 192 C163 186 160 182 158 192" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M260 188 C262 181 265 178 267 188" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

              {/* Central Golden Vault Safe */}
              <g filter="url(#shadowFilter)">
                <rect x="130" y="102" width="80" height="82" rx="10" fill="url(#vaultGrad)" />
                <rect x="136" y="108" width="68" height="70" rx="7" fill="#b45309" opacity="0.3" />
                <rect x="138" y="110" width="64" height="66" rx="6" fill="#f59e0b" />
                
                {/* Vault Round Handle Dial */}
                <circle cx="170" cy="143" r="17" fill="#fbbf24" stroke="#78350f" strokeWidth="3" />
                <circle cx="170" cy="143" r="7" fill="#78350f" />
                <line x1="170" y1="126" x2="170" y2="132" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                <line x1="170" y1="154" x2="170" y2="160" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                <line x1="153" y1="143" x2="159" y2="143" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                <line x1="181" y1="143" x2="187" y2="143" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
                <rect x="156" y="166" width="28" height="5" rx="2.5" fill="#78350f" opacity="0.5" />
              </g>

              {/* Pink Piggy Bank on top of safe */}
              <g>
                <ellipse cx="170" cy="94" rx="18" ry="14" fill="url(#pigGrad)" />
                <ellipse cx="156" cy="95" rx="5" ry="4" fill="#f472b6" />
                <circle cx="154" cy="94" r="1" fill="#831843" />
                <circle cx="157" cy="94" r="1" fill="#831843" />
                <circle cx="163" cy="90" r="2" fill="#1e293b" />
                <path d="M165 82 L 169 76 L 173 82 Z" fill="#f472b6" />
                {/* Coin Slot */}
                <rect x="167" y="81" width="8" height="2" rx="1" fill="#9d174d" />
                {/* Gold Coin Dropping */}
                <circle cx="171" cy="74" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
              </g>

              {/* Left Female Guard Standing */}
              <g>
                <ellipse cx="78" cy="186" rx="16" ry="4" fill="#cbd5e1" opacity="0.6" />
                {/* Legs / Skirt */}
                <path d="M68 142 L88 142 L85 168 L71 168 Z" fill="#1e293b" />
                <rect x="73" y="168" width="5" height="18" rx="2" fill="#fed7aa" />
                <rect x="80" y="168" width="5" height="18" rx="2" fill="#fed7aa" />
                <ellipse cx="75" cy="186" rx="6" ry="2.5" fill="#0f172a" />
                <ellipse cx="82" cy="186" rx="6" ry="2.5" fill="#0f172a" />
                
                {/* Blue Blazer & Body */}
                <rect x="66" y="108" width="24" height="36" rx="6" fill="#2563eb" />
                <polygon points="78,114 73,126 83,126" fill="#ffffff" />
                
                {/* Head & Hair */}
                <circle cx="78" cy="94" r="13" fill="#fed7aa" />
                <path d="M65 94 C65 78 91 78 91 94 C91 104 88 110 88 110 L68 110 Z" fill="#0f172a" />
                
                {/* Shield */}
                <g filter="url(#shadowFilter)">
                  <path d="M50 102 L72 102 L72 136 C72 148 50 155 50 155 C50 155 28 148 28 136 L28 102 Z" fill="url(#shieldGrad)" />
                  <path d="M38 123 L46 131 L60 116" stroke="#ffffff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>

              {/* Right Male Guard Kneeling */}
              <g>
                <ellipse cx="258" cy="186" rx="18" ry="4" fill="#cbd5e1" opacity="0.6" />
                {/* Pants Kneeling */}
                <path d="M246 148 L268 148 L272 178 L260 186 L246 178 Z" fill="#1e293b" />
                <ellipse cx="264" cy="186" rx="8" ry="3" fill="#0f172a" />
                
                {/* Shirt & Tie */}
                <rect x="246" y="112" width="22" height="38" rx="5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                <polygon points="257,118 255,138 259,138" fill="#0284c7" />
                
                {/* Head & Hair */}
                <circle cx="257" cy="98" r="12" fill="#fed7aa" />
                <path d="M245 96 C245 84 269 84 269 96 Z" fill="#78350f" />
                
                {/* Shield */}
                <g filter="url(#shadowFilter)">
                  <path d="M284 104 L306 104 L306 138 C306 150 284 157 284 157 C284 157 262 150 262 138 L262 104 Z" fill="url(#shieldGrad)" />
                  <path d="M272 125 L280 133 L294 118" stroke="#ffffff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </g>
            </svg>
          </div>

          {/* Clean Consortium Retention Assurance Tag */}
          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="badge badge-light-primary" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>
              Anna Univ 75% Guard
            </span>
            <span className="badge badge-light-success" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>
              XGBoost ML Active
            </span>
          </div>
        </div>

        {/* Right Column: Spike Admin Form & Persona Buttons */}
        <div className="auth-right-col">
          
          {/* Header */}
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--dark)', margin: '0 0 0.2rem', letterSpacing: '-0.02em' }}>
              Welcome to Spike Admin
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0 0 0.9rem' }}>
              Your Unified Academic Intervention Dashboard
            </p>
          </div>

          {/* Compact One-Click Evaluator Personas (Development Only) */}
          {import.meta.env.DEV && (
            <div style={{
              background: 'var(--bg-body)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '0.6rem 0.75rem',
              marginBottom: '0.9rem'
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} color="var(--primary)" />
                <span>One-Click Evaluator Personas (Dev Mode)</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => handleQuickFill('mentor')}
                  style={{
                    background: activePersona === 'mentor' ? 'var(--primary-light)' : '#ffffff',
                    border: activePersona === 'mentor' ? '1px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '0.35rem 0.55rem',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>👥</span>
                  <span>Faculty Mentor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('student-high')}
                  style={{
                    background: activePersona === 'student-high' ? 'var(--danger-light)' : '#ffffff',
                    border: activePersona === 'student-high' ? '1px solid var(--danger)' : '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '0.35rem 0.55rem',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    color: 'var(--danger)',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>🎓</span>
                  <span>Student (High Risk)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('student-low')}
                  style={{
                    background: activePersona === 'student-low' ? 'var(--success-light)' : '#ffffff',
                    border: activePersona === 'student-low' ? '1px solid var(--success)' : '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '0.35rem 0.55rem',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    color: 'var(--success)',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>📗</span>
                  <span>Student (Low Risk)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('admin')}
                  style={{
                    background: activePersona === 'admin' ? 'var(--primary-light)' : '#ffffff',
                    border: activePersona === 'admin' ? '1px solid var(--dark)' : '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '0.35rem 0.55rem',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    color: 'var(--dark)',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>🏛️</span>
                  <span>Dean Office</span>
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{
              background: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              color: 'var(--danger)',
              fontSize: '0.78rem',
              marginBottom: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            
            {/* Institution */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.2rem', color: 'var(--dark)' }}>
                Institution
              </label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="select-control"
                style={{ width: '100%', height: '36px', fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              >
                {COLLEGES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Username or ID */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.2rem', color: 'var(--dark)' }}>
                Username, Faculty ID, or Email
              </label>
              <input
                type="text"
                required
                placeholder="e.g. FAC_EEC_CSE_001 or mentor@college.edu"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input-control"
                style={{ width: '100%', height: '36px', fontSize: '0.8rem', fontWeight: '600', padding: '0.35rem 0.65rem' }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.2rem', color: 'var(--dark)' }}>
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-control"
                style={{ width: '100%', height: '36px', fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              />
            </div>

            {/* Remember & Demo Credential Row matching Spike Authguard */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', marginTop: '-0.1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--muted)', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <span>Remember this Device</span>
              </label>
              <button
                type="button"
                onClick={() => handleQuickFill('mentor')}
                style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.76rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Reset Demo
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '38px',
                fontSize: '0.88rem',
                fontWeight: '700',
                marginTop: '0.25rem'
              }}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Footer note */}
          <div style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.72rem', color: 'var(--muted)' }}>
            Anna University Consortium &bull; Multi-Campus Early Retention
          </div>

        </div>

      </div>

    </div>
  );
}
