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
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const { collapsed } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const user = currentUser || {
    role: location.pathname.startsWith('/admin') ? 'admin' : location.pathname.startsWith('/mentor') ? 'mentor' : 'student'
  };

  const activeRole = user.role || 'mentor';

  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get('tab') || 'overview';

  const handleLogout = () => {
    try {
      localStorage.removeItem('erp_active_user');
      if (logout) logout();
    } catch {}
    navigate('/login');
  };

  return (
    <aside className={`floating-rail ${collapsed ? 'collapsed' : ''}`} aria-label="Main Navigation">
      {/* Top Logo Tile */}
      <div className="rail-logo-tile" title="ERP System">
        <Rocket size={22} fill="none" strokeWidth={1.8} />
      </div>

      {/* Nav Items */}
      <nav className="rail-nav">
        {/* Mentor Role Links */}
        {activeRole === 'mentor' && (
          <>
            <NavLink
              to="/mentor/dashboard?tab=overview"
              data-t="Overview"
              aria-label="Overview"
              className={`rail-item ${location.pathname === '/mentor/dashboard' && currentTab === 'overview' ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} />
            </NavLink>

            <NavLink
              to="/mentor/dashboard?tab=roster"
              data-t="Mentee Roster"
              aria-label="Mentee Roster"
              className={`rail-item ${location.pathname === '/mentor/dashboard' && currentTab === 'roster' ? 'active' : ''}`}
            >
              <Users size={20} />
            </NavLink>

            <NavLink
              to="/mentor/dashboard?tab=interventions"
              data-t="Interventions & Meetings"
              aria-label="Interventions & Meetings"
              className={`rail-item ${location.pathname === '/mentor/dashboard' && (currentTab === 'interventions' || currentTab === 'meetings') ? 'active' : ''}`}
            >
              <ShieldAlert size={20} />
            </NavLink>

            <NavLink
              to="/mentor/dashboard?tab=ai"
              data-t="AI Retention Copilot"
              aria-label="AI Retention Copilot"
              className={`rail-item ${location.pathname === '/mentor/dashboard' && currentTab === 'ai' ? 'active' : ''}`}
            >
              <Sparkles size={20} />
            </NavLink>
          </>
        )}

        {/* Student Role Links */}
        {activeRole === 'student' && (
          <>
            <NavLink
              to="/student/dashboard"
              data-t="My Academic Portal"
              aria-label="My Academic Portal"
              className={({ isActive }) => `rail-item ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} />
            </NavLink>

            <NavLink
              to="/student/marks"
              data-t="Subject Marks & CIA"
              aria-label="Subject Marks & CIA"
              className={({ isActive }) => `rail-item ${isActive ? 'active' : ''}`}
            >
              <BookOpen size={20} />
            </NavLink>
          </>
        )}

        {/* Admin Role Links */}
        {activeRole === 'admin' && (
          <>
            <NavLink
              to="/admin/dashboard"
              data-t="Institutional Overview"
              aria-label="Institutional Overview"
              className={({ isActive }) => `rail-item ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={20} />
            </NavLink>
          </>
        )}
      </nav>

      {/* Bottom Pinned Logout Button in Red */}
      <button
        className="rail-logout"
        onClick={handleLogout}
        data-t="Log Out"
        aria-label="Log Out of ERP"
      >
        <LogOut size={20} fill="none" strokeWidth={1.8} />
      </button>
    </aside>
  );
}
