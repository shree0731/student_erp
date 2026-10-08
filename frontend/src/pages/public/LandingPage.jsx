import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  BrainCircuit,
  MessageSquare,
  ArrowRight,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  FileText
} from 'lucide-react';

const INSTITUTIONS = [
  {
    code: 'C101',
    name: 'Apex Engineering College (Autonomous)',
    shortName: 'AEC',
    location: 'Guindy, Chennai',
    type: 'Autonomous • Urban Engineering Campus',
    description: 'Premier autonomous technical institution featuring industry-aligned computing curricula, proactive faculty mentoring, and AI retention governance.',
    stats: { students: '2,600', retention: '96.8%', faculty: '145+' },
    tag: 'Accredited NAAC A++'
  },
  {
    code: 'C102',
    name: 'Kavery Residential Institute of Technology',
    shortName: 'KRIT',
    location: 'Perundurai, Erode',
    type: 'Fully Residential • Autonomous Campus',
    description: 'Intensive residential campus offering immersion laboratory clusters, dedicated first-generation learner clinics, and continuous CIA evaluation.',
    stats: { students: '2,400', retention: '97.2%', faculty: '151+' },
    tag: 'Fully Residential'
  },
  {
    code: 'C103',
    name: 'Modern Institute of Science & Technology',
    shortName: 'MIST',
    location: 'Madurai',
    type: 'Semi-Urban • Research & Tech Campus',
    description: 'Autonomous research-focused campus blending traditional core disciplines with emergent computing technologies, featuring tutorial guidance groups.',
    stats: { students: '2,200', retention: '95.9%', faculty: '150+' },
    tag: 'Heritage Campus'
  },
  {
    code: 'C104',
    name: 'Sahyadri Deemed University',
    shortName: 'SDU',
    location: 'Kanchipuram',
    type: 'Deemed University • Pan-India Intake',
    description: 'Multi-campus deemed university attracting diverse student cohorts from 15+ states across India with tailored bridge courses for CBSE & State boards.',
    stats: { students: '2,000', retention: '94.8%', faculty: '143+' },
    tag: 'All India Admissions'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();

  const handleSelectCollege = (inst) => {
    navigate(`/login?college=${inst.code}`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f6f9', color: 'var(--dark)' }}>
      
      {/* =====================================================================
          1. HEADER NAVIGATION BAR
          ===================================================================== */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        padding: '0 2rem',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Brand Logo */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div style={{
              background: 'var(--primary)',
              color: '#ffffff',
              borderRadius: '10px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(93, 135, 255, 0.25)'
            }}>
              <GraduationCap size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.18rem', color: 'var(--dark)', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                InSight<span style={{ color: 'var(--primary)' }}>ERP</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontWeight: '600' }}>
                Engineering Student Retention &amp; Academic Success Ecosystem
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a
              href="#institutions"
              style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--muted)'}
            >
              Institutions Directory
            </a>
            <a
              href="#features"
              style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--muted)'}
            >
              AI Retention Platform
            </a>
            <a
              href="#statutory"
              style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--muted)'}
            >
              Statutory Attendance Audit
            </a>
          </nav>

          {/* Sign In CTA Button */}
          <div>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{
                padding: '0.6rem 1.35rem',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.86rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-btn)'
              }}
            >
              <span>ERP Portal Access</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. HERO SECTION
          ===================================================================== */}
      <section style={{
        padding: '4rem 1.5rem 3.5rem',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        {/* Compliance Pill Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--primary-light)',
          border: '1px solid rgba(93, 135, 255, 0.2)',
          padding: '0.4rem 1.15rem',
          borderRadius: '50px',
          fontSize: '0.8rem',
          fontWeight: '700',
          color: 'var(--primary)',
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={14} />
          <span>Integrated Explainable AI &bull; Anna University Regulations Compliant</span>
        </div>

        {/* Clean, Non-Glitching Headline */}
        <h1 style={{
          fontSize: 'clamp(2.1rem, 4vw, 3.2rem)',
          fontWeight: '900',
          letterSpacing: '-0.025em',
          lineHeight: '1.2',
          marginBottom: '1.25rem',
          color: 'var(--dark)'
        }}>
          AI-Powered Early Warning &amp; <br />
          <span style={{ color: 'var(--primary)' }}>
            Academic Student Retention Ecosystem
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.05rem',
          color: 'var(--muted)',
          maxWidth: '760px',
          margin: '0 auto 2.25rem',
          lineHeight: '1.6'
        }}>
          A full-stack institutional ERP bridging gradient boosted XGBoost decision modeling, 
          Anna University Clause 6.2 statutory attendance audits, registered parental intimation notices, 
          and context-aware AI academic mentoring.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <a
            href="#institutions"
            className="btn btn-primary"
            style={{
              padding: '0.8rem 1.85rem',
              borderRadius: '8px',
              fontSize: '0.94rem',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Choose Your Institution Gateway</span>
            <ChevronRight size={17} />
          </a>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-outline"
            style={{
              padding: '0.8rem 1.75rem',
              borderRadius: '8px',
              fontSize: '0.94rem',
              fontWeight: '700',
              background: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Direct Sign In Portal</span>
            <ArrowRight size={17} color="var(--primary)" />
          </button>
        </div>

        {/* Quick Capabilities Highlights Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          maxWidth: '1080px',
          margin: '0 auto',
          textAlign: 'left'
        }}>
          <div className="card" style={{ padding: '1.35rem', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ color: 'var(--primary)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BrainCircuit size={22} />
              <span style={{ fontSize: '0.74rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Explainable ML</span>
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--dark)' }}>XGBoost + SHAP</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.35rem', lineHeight: '1.5' }}>
              Real-time inference pipeline with What-If parameter simulation and feature weight attribution.
            </div>
          </div>

          <div className="card" style={{ padding: '1.35rem', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ color: 'var(--danger)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={22} />
              <span style={{ fontSize: '0.74rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statutory Audit</span>
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--dark)' }}>Clause 6.2 Compliance</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.35rem', lineHeight: '1.5' }}>
              Automated 75% attendance audit, debarment tracking, and registered parental intimation dispatch.
            </div>
          </div>

          <div className="card" style={{ padding: '1.35rem', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ color: 'var(--success)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={22} />
              <span style={{ fontSize: '0.74rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student Advisor</span>
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--dark)' }}>Contextual Advisor</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.35rem', lineHeight: '1.5' }}>
              Empathetic AI academic chatbot grounded in live grades, CIA trends, and mentor appointments.
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. INSTITUTION SELECTOR SECTION (CLEAN BALANCED GRID)
          ===================================================================== */}
      <section id="institutions" style={{
        padding: '4rem 1.5rem',
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
            <span style={{
              color: 'var(--primary)',
              fontWeight: '800',
              fontSize: '0.78rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              Consortium Participating Institutions
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: '800', marginTop: '0.35rem', letterSpacing: '-0.02em', color: 'var(--dark)' }}>
              Select Your Campus Gateway
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.94rem', maxWidth: '620px', margin: '0.4rem auto 0', lineHeight: '1.5' }}>
              Access the localized student learning portal, faculty mentoring console, or dean evaluation dashboard for your campus.
            </p>
          </div>

          {/* Structured Institution Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            alignItems: 'stretch'
          }}>
            {INSTITUTIONS.map((inst) => (
              <div
                key={inst.code}
                onClick={() => handleSelectCollege(inst)}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: '#ffffff',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(93, 135, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  {/* Card Header Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '6px',
                      fontWeight: '800',
                      fontSize: '0.78rem'
                    }}>
                      {inst.code}
                    </span>
                    <span className="badge badge-light-primary" style={{ fontWeight: '700', fontSize: '0.72rem' }}>
                      {inst.tag}
                    </span>
                  </div>

                  {/* Title with Fixed Min-Height for Consistent Baseline */}
                  <div style={{ minHeight: '52px', display: 'flex', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '1.12rem', fontWeight: '800', color: 'var(--dark)', margin: 0, lineHeight: '1.3' }}>
                      {inst.name}
                    </h3>
                  </div>

                  {/* Location & Type Subtitle with Fixed Min-Height */}
                  <div style={{ minHeight: '34px', fontSize: '0.76rem', color: 'var(--muted)', fontWeight: '600', marginBottom: '0.85rem', lineHeight: '1.4' }}>
                    {inst.location} &bull; {inst.type}
                  </div>

                  {/* Description with Uniform Vertical Flex */}
                  <p style={{
                    fontSize: '0.82rem',
                    color: 'var(--muted)',
                    lineHeight: '1.5',
                    marginBottom: '1.25rem',
                    minHeight: '68px'
                  }}>
                    {inst.description}
                  </p>
                </div>

                <div>
                  {/* Micro Stats Box: Symmetrical 3-Column Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.35rem',
                    textAlign: 'center',
                    background: 'var(--bg-body)',
                    padding: '0.75rem 0.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    marginBottom: '1.25rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: '800', color: 'var(--dark)', fontSize: '0.92rem' }}>{inst.stats.students}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.66rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '1px' }}>Enrolled</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: 'var(--success)', fontSize: '0.92rem' }}>{inst.stats.retention}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.66rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '1px' }}>Retention</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.92rem' }}>{inst.stats.faculty}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.66rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: '1px' }}>Mentors</div>
                    </div>
                  </div>

                  {/* Gateway Access Button (Always Pinned to Bottom) */}
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{
                      padding: '0.65rem 1rem',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.84rem',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span>Enter {inst.shortName} Portal</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =====================================================================
          4. PLATFORM ARCHITECTURAL CAPABILITIES SECTION
          ===================================================================== */}
      <section id="features" style={{
        padding: '4rem 1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <span style={{
            color: 'var(--primary)',
            fontWeight: '800',
            fontSize: '0.78rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            System Capabilities
          </span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: '800', marginTop: '0.35rem', letterSpacing: '-0.02em', color: 'var(--dark)' }}>
            Empathetic Mentoring Backed by Robust Data Science
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.94rem', maxWidth: '640px', margin: '0.4rem auto 0', lineHeight: '1.5' }}>
            A unified academic intelligence architecture aligning university statutory audits with early algorithmic support and safe, stigma-free guidance.
          </p>
        </div>

        {/* 3 Balanced Capability Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}>
          <div className="card" style={{ padding: '1.75rem', borderRadius: '12px', background: '#ffffff', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <SlidersHorizontal size={22} />
            </div>
            <h3 style={{ fontSize: '1.12rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--dark)', minHeight: '44px' }}>
              Interactive What-If Simulation Sandbox
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--muted)', lineHeight: '1.6', margin: 0, flex: 1 }}>
              Administrators and evaluators can interactively adjust attendance, CIA exam averages, and backlogs to observe real-time XGBoost decision boundary shifts and SHAP feature attribution in live viva demonstrations.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem', borderRadius: '12px', background: '#ffffff', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.12rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--dark)', minHeight: '44px' }}>
              Anna University Statutory Attendance Engine
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--muted)', lineHeight: '1.6', margin: 0, flex: 1 }}>
              Monitors 6-month attendance trajectories against Anna University 75% examination eligibility rules. Instantly triggers Clause 6.2 registered parental intimation letters before end-semester exam debarment.
            </p>
          </div>

          <div className="card" style={{ padding: '1.75rem', borderRadius: '12px', background: '#ffffff', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ background: 'var(--success-light)', color: 'var(--success)', width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <MessageSquare size={22} />
            </div>
            <h3 style={{ fontSize: '1.12rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--dark)', minHeight: '44px' }}>
              Contextual AI Academic Advisor Widget
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--muted)', lineHeight: '1.6', margin: 0, flex: 1 }}>
              Grounded conversational assistant injecting verified internal marks, arrear status, and faculty counselor contacts into prompt context to deliver supportive, constructive student guidance without hallucinations.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. STATUTORY REGULATIONS CALLOUT BANNER (FRAMED & BALANCED)
          ===================================================================== */}
      <section id="statutory" style={{
        padding: '0 1.5rem 4rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '2.75rem 2rem',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '0.35rem 0.95rem',
            borderRadius: '50px',
            fontSize: '0.78rem',
            fontWeight: '700',
            marginBottom: '1rem'
          }}>
            <FileText size={14} />
            <span>Autonomous Regulations Compliance Framework</span>
          </div>

          {/* Heading */}
          <h2 style={{ fontSize: '1.9rem', fontWeight: '800', marginBottom: '0.85rem', color: 'var(--dark)', letterSpacing: '-0.02em' }}>
            Built for Academic Integrity &amp; Parental Transparency
          </h2>

          {/* Explanation */}
          <p style={{ fontSize: '0.92rem', color: 'var(--muted)', lineHeight: '1.65', maxWidth: '780px', margin: '0 auto 1.75rem' }}>
            Meeting all Anna University autonomous regulations, UGC student retention benchmarks, and NBA/NAAC criteria. 
            Students receive encouraging growth recommendations, faculty mentors receive predictive early warnings, 
            and deans maintain statutory attendance compliance across all engineering disciplines.
          </p>

          {/* Direct CTA */}
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '8px',
              fontSize: '0.92rem',
              fontWeight: '700',
              boxShadow: 'var(--shadow-btn)'
            }}
          >
            <span>Access Institutional Authentication Portal</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* =====================================================================
          6. FOOTER
          ===================================================================== */}
      <footer style={{
        padding: '2.25rem 2rem',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'var(--muted)',
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border)',
        marginTop: 'auto'
      }}>
        <div style={{ fontWeight: '700', color: 'var(--dark)', marginBottom: '0.35rem' }}>
          InSight ERP &bull; Academic Student Retention &amp; Intervention System
        </div>
        <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
          Apex Engineering College (Autonomous) &bull; Kavery Residential Institute of Technology &bull; Modern Institute of Science &amp; Technology &bull; Sahyadri Deemed University
        </div>
        <div style={{ fontSize: '0.7rem', opacity: 0.75 }}>
          Compliant with Anna University Autonomous Regulations &bull; NBA Tier-I &bull; NAAC Criteria II Benchmark
        </div>
      </footer>

    </div>
  );
}
