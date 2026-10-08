import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  Building2,
  PlusCircle
} from 'lucide-react';

export default function Navbar() {
  const { currentUser } = useAuth();
  const { collapsed, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const user = currentUser || {
    id: 'FAC_EEC_CSE_001',
    name: 'Dr. Kavitha Ramanathan',
    role: 'mentor',
    department: 'CSE',
    college: 'Easwari Engineering College'
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case 'student': return <span className="badge badge-light-success">Student</span>;
      case 'mentor': return <span className="badge badge-light-primary">Faculty Mentor</span>;
      case 'admin': return <span className="badge badge-light-danger">Admin Dean</span>;
      default: return <span className="badge badge-light-secondary">{user.role}</span>;
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('erp_active_user');
    } catch {}
    navigate('/login');
  };

  return (
    <header className="top-navbar">
      {/* Left: Burger Menu Toggle & Academic Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="navbar-icon-btn"
          onClick={toggleSidebar}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle Sidebar"
          style={{ transition: 'all 0.2s ease' }}
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="badge badge-light-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.65rem', fontWeight: '700', fontSize: '0.78rem' }}>
            <Building2 size={13} />
            <span>{user.college || 'Easwari Engineering College'}</span>
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: '600' }}>
            {user.department || 'CSE'} Mentor Advisory
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        
        {/* Search Bar for Mentees */}
        <div className="navbar-search">
          <Search size={15} color="var(--muted)" style={{ position: 'absolute', left: '10px' }} />
          <input
            type="text"
            placeholder="Search mentees, roll numbers..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate(`/mentor/dashboard?tab=roster&q=${encodeURIComponent(e.target.value)}`);
              }
            }}
          />
        </div>

        {/* Quick Action Button for Faculty */}
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/mentor/dashboard?tab=interventions&action=log')}
          title="Log a new counseling or intervention session"
          style={{ gap: '0.35rem', fontWeight: '700', color: 'var(--primary)' }}
        >
          <PlusCircle size={14} color="var(--primary)" />
          <span>Log Counseling</span>
        </button>

        {/* Attendance Alert Bell with Badge */}
        <button
          className="navbar-icon-btn"
          title="2 Mentees below 75% attendance threshold"
          onClick={() => navigate('/mentor/dashboard?tab=roster&filter=risk')}
        >
          <Bell size={18} />
          <span className="navbar-badge-dot" />
        </button>

        <span style={{ height: '24px', width: '1px', background: 'var(--border)' }} />

        {/* User Identity Profile */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
          onClick={() => navigate('/mentor/dashboard?tab=overview')}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}
          >
            {user.avatar || 'KR'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)', lineHeight: 1.2 }}>
              {user.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
              {getRoleBadge()}
            </div>
          </div>
        </div>

        {/* Log Out Button */}
        <button
          className="btn btn-outline btn-sm"
          onClick={handleLogout}
          title="Log out of Spike ERP"
          style={{
            padding: '0.4rem 0.85rem',
            gap: '0.4rem',
            color: 'var(--danger)',
            borderColor: 'var(--danger-light)',
            fontWeight: '700'
          }}
        >
          <LogOut size={14} color="var(--danger)" />
          <span>Log Out</span>
        </button>
      </div>
    </header>
  );
}
