import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { api } from '../services/api';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  Building2,
  PlusCircle,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight
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

  // Notification state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem(`erp_read_notifs_${user.id || 'default'}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      // Graceful fallback: non-blocking
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    }
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationsOpen]);

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(`erp_read_notifs_${user.id || 'default'}`, JSON.stringify(allIds));
    } catch {}
  };

  const markSingleAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem(`erp_read_notifs_${user.id || 'default'}`, JSON.stringify(updated));
      } catch {}
    }
  };

  const handleNotificationClick = (notif) => {
    markSingleAsRead(notif.id);
    setNotificationsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
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
            {user.department || 'CSE'} {user.role === 'mentor' ? 'Mentor Advisory' : 'Portal'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        
        {/* Search Bar for Mentees (Mentors / Admins) */}
        {user.role !== 'student' && (
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
        )}

        {/* Quick Action Button */}
        {user.role === 'mentor' ? (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/mentor/dashboard?tab=interventions&action=log')}
            title="Log a new counseling or intervention session"
            style={{ gap: '0.35rem', fontWeight: '700', color: 'var(--primary)' }}
          >
            <PlusCircle size={14} color="var(--primary)" />
            <span>Log Counseling</span>
          </button>
        ) : user.role === 'student' ? (
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/student/dashboard')}
            title="View mentor guidance & academic plan"
            style={{ gap: '0.35rem', fontWeight: '700', color: 'var(--primary)' }}
          >
            <Calendar size={14} color="var(--primary)" />
            <span>Guidance</span>
          </button>
        ) : null}

        {/* Attendance Alert & Meeting Notification Bell with Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className="navbar-icon-btn"
            title={unreadCount > 0 ? `${unreadCount} unread notification(s)` : 'Notifications'}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '0.62rem',
                fontWeight: '800',
                borderRadius: '10px',
                padding: '1px 5px',
                minWidth: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Interactive Notifications Popover */}
          {notificationsOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 10px)',
              width: '350px',
              maxWidth: '92vw',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.16)',
              zIndex: 1100,
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={15} color="var(--primary)" />
                  <span style={{ fontWeight: '800', fontSize: '0.86rem', color: 'var(--dark)' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="badge badge-light-danger" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.72rem',
                      color: 'var(--primary)',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--muted)' }}>
                    <Bell size={26} style={{ opacity: 0.35, margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--dark)' }}>No notifications</div>
                    <div style={{ fontSize: '0.74rem' }}>You're all caught up!</div>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isRead = readIds.includes(notif.id);
                    const isUrgent = notif.urgency === 'urgent';
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          background: isRead ? '#ffffff' : (isUrgent ? '#fff7ed' : '#f0fdf4'),
                          transition: 'background 0.15s ease',
                          display: 'flex',
                          gap: '0.65rem',
                          alignItems: 'flex-start'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isRead ? '#ffffff' : (isUrgent ? '#fff7ed' : '#f0fdf4')}
                      >
                        <div style={{
                          marginTop: '2px',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background: isUrgent ? '#fee2e2' : (notif.type.includes('sched') || notif.type.includes('confirm') ? '#dcfce7' : '#e0e7ff'),
                          color: isUrgent ? '#dc2626' : (notif.type.includes('sched') || notif.type.includes('confirm') ? '#16a34a' : 'var(--primary)')
                        }}>
                          {isUrgent ? (
                            <AlertTriangle size={14} />
                          ) : notif.type.includes('sched') || notif.type.includes('confirm') ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Calendar size={14} />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <div style={{
                              fontWeight: isRead ? '600' : '800',
                              fontSize: '0.8rem',
                              color: 'var(--dark)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {notif.title}
                            </div>
                            {!isRead && (
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                flexShrink: 0,
                                marginLeft: '6px'
                              }} />
                            )}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--muted)', lineHeight: '1.35', marginBottom: '4px' }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--muted)', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={10} />
                            <span>{notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: '0.55rem 1rem',
                borderTop: '1px solid var(--border)',
                background: '#f8fafc',
                textAlign: 'center'
              }}>
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate(user.role === 'mentor' ? '/mentor/dashboard?tab=meetings' : '/student/dashboard');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.75rem',
                    color: 'var(--primary)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{user.role === 'mentor' ? 'View All Meetings & Requests' : 'View Guidance Status'}</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        <span style={{ height: '24px', width: '1px', background: 'var(--border)' }} />

        {/* User Identity Profile */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
          onClick={() => navigate(user.role === 'mentor' ? '/mentor/dashboard?tab=overview' : user.role === 'student' ? '/student/dashboard' : '/admin/dashboard')}
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
            {user.avatar || (user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'KR')}
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
          title="Log out of ERP"
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
