import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, SAMPLE_PERSONAS } from '../context/AuthContext';
import { GraduationCap, Users, LayoutDashboard, ArrowRight, ShieldCheck, School, Building2 } from 'lucide-react';

export default function Login() {
  const { setCurrentUser } = useAuth();
  const navigate = useNavigate();

  const handleSelectRole = (roleKey, customData = null) => {
    const persona = customData || SAMPLE_PERSONAS[roleKey];
    setCurrentUser(persona);

    if (persona.role === 'student') navigate('/student/dashboard');
    else if (persona.role === 'mentor') navigate('/mentor/dashboard');
    else if (persona.role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', color: '#ffffff' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(129, 140, 248, 0.3)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '1rem' }}>
            <ShieldCheck size={16} />
            <span>Academic Dropout Early Intervention System — Phase 1 Skeleton</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
            Select ERP Demonstration Role
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
            This system features three role-based perspectives backed by ~7,200 simulated students and 222 faculty across urban, residential, and semi-urban engineering colleges in Tamil Nadu.
          </p>
        </div>

        {/* 3 Role Selection Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Card 1: Student Role */}
          <div className="card" style={{ background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '10px', borderRadius: '10px' }}>
                <GraduationCap size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Student View</h2>
                <span className="badge badge-low">Learner Portal</span>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem', flex: 1 }}>
              View personalized attendance percentage, 6-month trend graph, Anna University GPA, active backlogs, subject-wise assessment marks, and the Phase 2 AI Advisor chat widget.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                className="btn btn-primary"
                onClick={() => handleSelectRole('student', {
                  id: 'STU_EEC_CSE_Y2_0001',
                  name: 'Aravind Sundaram',
                  role: 'student',
                  department: 'CSE',
                  college: 'Easwari Engineering College (Urban)',
                  collegeId: 'C101',
                  year: 2,
                  risk: 'High',
                  avatar: 'AS'
                })}
              >
                <span>Enter as Student (At-Risk / EEC)</span>
                <ArrowRight size={16} />
              </button>

              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleSelectRole('student', {
                  id: 'STU_KRIT_IT_Y3_3645',
                  name: 'Siddharth Gopalakrishnan',
                  role: 'student',
                  department: 'IT',
                  college: 'Kongu Residential Institute (Residential)',
                  collegeId: 'C102',
                  year: 3,
                  risk: 'Low',
                  avatar: 'SG'
                })}
              >
                <span>Enter as Student (Good Standing / KRIT)</span>
              </button>
            </div>
          </div>

          {/* Card 2: Mentor Role */}
          <div className="card" style={{ background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#fef3c7', color: '#b45309', padding: '10px', borderRadius: '10px' }}>
                <Users size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Mentor View</h2>
                <span className="badge badge-medium">Faculty Advisor</span>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem', flex: 1 }}>
              Review assigned mentees with risk indicators (High/Medium/Low), attendance alerts (&lt;75%), backlogs, deep-dive student diagnostics, and subject-level marks breakdown.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                className="btn btn-primary"
                style={{ backgroundColor: '#d97706' }}
                onClick={() => handleSelectRole('mentor', {
                  id: 'FAC_EEC_CSE_001',
                  name: 'Dr. Kavitha Ramanathan',
                  role: 'mentor',
                  department: 'CSE',
                  college: 'Easwari Engineering College (Urban)',
                  collegeId: 'C101',
                  avatar: 'KR'
                })}
              >
                <span>Enter as Mentor (EEC - CSE Dept)</span>
                <ArrowRight size={16} />
              </button>

              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleSelectRole('mentor', {
                  id: 'FAC_KRIT_IT_112',
                  name: 'Prof. Ramesh Natarajan',
                  role: 'mentor',
                  department: 'IT',
                  college: 'Kongu Residential Institute (Perundurai)',
                  collegeId: 'C102',
                  avatar: 'RN'
                })}
              >
                <span>Enter as Mentor (KRIT - IT Dept)</span>
              </button>
            </div>
          </div>

          {/* Card 3: Admin Role */}
          <div className="card" style={{ background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '10px' }}>
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Admin View</h2>
                <span className="badge badge-high">Institutional Analytics</span>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem', flex: 1 }}>
              Inspect aggregate college-wide KPIs, cross-institutional comparisons (Urban vs Residential vs Semi-Urban), branch distributions (CSE, IT, AIDS, ECE), and backlog analytics.
            </p>

            <button
              className="btn btn-primary"
              style={{ backgroundColor: '#dc2626', marginTop: 'auto' }}
              onClick={() => handleSelectRole('admin')}
            >
              <span>Enter Institutional Admin Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>

        {/* Institutional Context Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', color: '#94a3b8', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building2 size={16} color="#818cf8" />
            <span>Easwari Engineering College (Urban Metro)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <School size={16} color="#818cf8" />
            <span>Kongu Residential Institute (Residential Campus)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building2 size={16} color="#818cf8" />
            <span>Meenakshi Institute (Tier-2 Semi-Urban)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
