import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import {
  Rocket,
  LayoutDashboard,
  BarChart3,
  Users,
  ShieldAlert,
  Sparkles,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  FileText,
  Clock
} from 'lucide-react';

export default function Sidebar() {
  const { currentUser } = useAuth();
  const { collapsed } = useSidebar();
  const location = useLocation();

  const user = currentUser || {
    role: location.pathname.startsWith('/admin') ? 'admin' : location.pathname.startsWith('/mentor') ? 'mentor' : 'student'
  };

  const activeRole = user.role || 'mentor';

  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get('tab') || 'overview';

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          flexShrink: 0
        }}>
          <Rocket size={22} />
        </div>
        {!collapsed && (
          <div>
            <span className="sidebar-logo-text">Spike ERP</span>
          </div>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="sidebar-nav">
        
        {/* Section: MENTOR SECTIONS */}
        {activeRole === 'mentor' && (
          <>
            {!collapsed && <div className="sidebar-section-title">MENTOR SECTIONS</div>}

            <NavLink
              to="/mentor/dashboard?tab=overview"
              title="Executive Overview"
              className={`nav-link-item ${location.pathname === '/mentor/dashboard' && currentTab === 'overview' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              {!collapsed && <span>Overview</span>}
            </NavLink>

            <NavLink
              to="/mentor/dashboard?tab=roster"
              title="Mentee Roster & Risk Directory"
              className={`nav-link-item ${location.pathname === '/mentor/dashboard' && currentTab === 'roster' ? 'active' : ''}`}
            >
              <Users size={18} />
              {!collapsed && <span>Mentee Roster</span>}
            </NavLink>

            <NavLink
              to="/mentor/dashboard?tab=analytics"
              title="Academic & Attendance Analytics"
              className={`nav-link-item ${location.pathname === '/mentor/dashboard' && currentTab === 'analytics' ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              {!collapsed && <span>Academic Analytics</span>}
            </NavLink>

            <NavLink
              to="/mentor/dashboard?tab=interventions"
              title="Interventions & Counseling Logs"
              className={`nav-link-item ${location.pathname === '/mentor/dashboard' && currentTab === 'interventions' ? 'active' : ''}`}
            >
              <ShieldAlert size={18} />
              {!collapsed && <span>Interventions &amp; Logs</span>}
            </NavLink>

            <NavLink
              to="/mentor/dashboard?tab=meetings"
              title="Meeting & Guidance Requests"
              className={`nav-link-item ${location.pathname === '/mentor/dashboard' && currentTab === 'meetings' ? 'active' : ''}`}
            >
              <Clock size={18} />
              {!collapsed && <span>Meeting Requests</span>}
            </NavLink>

            <NavLink
              to="/mentor/dashboard?tab=ai"
              title="AI Retention Copilot"
              className={`nav-link-item ${location.pathname === '/mentor/dashboard' && currentTab === 'ai' ? 'active' : ''}`}
            >
              <Sparkles size={18} />
              {!collapsed && <span>AI Retention Copilot</span>}
            </NavLink>

            {!collapsed && (
              <>
                <div className="sidebar-section-title" style={{ marginTop: '1rem' }}>COMPLIANCE WATCH</div>

                <div style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-body)', borderRadius: '10px', border: '1px solid var(--border)', margin: '0 0.25rem 0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--dark)' }}>AU 75% Rule</span>
                    <span className="badge badge-light-warning" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>2 Alerts</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', lineHeight: '1.3' }}>
                    14 / 16 mentees currently in safe attendance zone.
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Section: ADMIN */}
        {activeRole === 'admin' && (
          <>
            {!collapsed && <div className="sidebar-section-title">ADMINISTRATION</div>}
            <NavLink
              to="/admin/dashboard"
              title="Institutional Overview"
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              {!collapsed && <span>Institutional Overview</span>}
            </NavLink>
          </>
        )}

        {/* Section: STUDENT */}
        {activeRole === 'student' && (
          <>
            {!collapsed && <div className="sidebar-section-title">ACADEMICS</div>}
            <NavLink
              to="/student/dashboard"
              title="My Academic Portal"
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              {!collapsed && <span>My Academic Portal</span>}
            </NavLink>
            <NavLink
              to="/student/marks"
              title="Subject Marks & CIA"
              className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
            >
              <BookOpen size={18} />
              {!collapsed && <span>Subject Marks &amp; CIA</span>}
            </NavLink>
          </>
        )}

        {/* Footer Info Box */}
        {!collapsed && (
          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            <div style={{
              background: 'var(--primary-light)',
              padding: '0.85rem',
              borderRadius: '12px',
              border: '1px solid var(--primary-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.2rem' }}>
                <ShieldCheck size={15} />
                <span>Spike AI Connected</span>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--muted)', lineHeight: '1.35' }}>
                XGBoost ML microservice &amp; Gemini advisor connected with 45ms live inference.
              </p>
            </div>
          </div>
        )}

      </nav>
    </aside>
  );
}
