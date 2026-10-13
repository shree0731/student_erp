import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Bell,
  Users,
  Clock,
  GraduationCap,
  CheckCircle2,
  Building2,
  AlertTriangle,
  Calendar,
  ChevronRight,
  LogOut
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
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
      // Non-blocking graceful fallback
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

  // Initials for avatar
  const initials = user.avatar || (user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'KR');

  const greetingTitle = user.role === 'mentor'
    ? `Welcome back, ${user.name || 'Professor'}`
    : user.role === 'student'
    ? `Welcome back, ${user.name || 'Student'}`
    : `Welcome back, Dean ${user.name || 'Administrator'}`;

  const greetingSub = user.role === 'mentor'
    ? `Faculty Mentorship & Risk Oversight • ${user.department || 'CSE'} Department • ${user.college || 'Easwari Engineering College'}`
    : user.role === 'student'
    ? `Student Academic Portal • ${user.department || 'CSE'} • Roll ID: ${user.linkedId || user.id}`
    : `Institutional Retention & Academic Governance Portal • ${user.college || 'Easwari Engineering College'}`;

  return (
    <header className="shell-header" role="banner">
      {/* Left: 30px Greeting + Muted Subline */}
      <div>
        <h1 className="header-greeting-title">
          {greetingTitle}
        </h1>
        <p className="header-greeting-sub">
          {greetingSub}
        </p>
      </div>

      {/* Right Controls: Notification Chip, Compact Stat Summary, Initials Avatar */}
      <div className="header-right-controls">
        
        {/* Compact Stat Summary (No Emoji, Lucide Icons Only) */}
        {user.role === 'mentor' && (
          <>
            <div className="header-chip" title="Active Assigned Mentees">
              <Users size={15} color="var(--primary)" strokeWidth={2} />
              <span>16 Mentees</span>
            </div>
            <div className="header-chip" title="Pending Guidance Meetings">
              <Clock size={15} color="var(--amber)" strokeWidth={2} />
              <span>2 Guidance Requests</span>
            </div>
          </>
        )}

        {user.role === 'student' && (
          <>
            <div className="header-chip" title="Current Academic Stage">
              <GraduationCap size={15} color="var(--primary)" strokeWidth={2} />
              <span>Sem 6 • B.E.</span>
            </div>
            <div className="header-chip" title="Current Overall Attendance">
              <CheckCircle2 size={15} color="var(--green)" strokeWidth={2} />
              <span>82.4% Attendance</span>
            </div>
          </>
        )}

        {user.role === 'admin' && (
          <div className="header-chip" title="Affiliated Colleges Managed">
            <Building2 size={15} color="var(--primary)" strokeWidth={2} />
            <span>4 Campuses Monitored</span>
          </div>
        )}

        {/* Notification Chip with Bell & Count */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            className="header-chip"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title={unreadCount > 0 ? `${unreadCount} unread notification(s)` : 'Notifications'}
            aria-label="Open notifications"
          >
            <Bell size={15} color={unreadCount > 0 ? 'var(--red)' : 'var(--ink)'} strokeWidth={2} />
            <span>Alerts</span>
            {unreadCount > 0 && (
              <span className="header-chip-badge">
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
              background: '#FFFFFF',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--line)',
              boxShadow: '0 16px 40px rgba(59, 54, 81, 0.16)',
              zIndex: 1100,
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                padding: '0.85rem 1.15rem',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--soft)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={15} color="var(--primary)" />
                  <span style={{ fontWeight: '800', fontSize: '0.88rem', color: 'var(--ink)' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="header-chip-badge">
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
                      fontSize: '0.74rem',
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
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--mute)' }}>
                    <Bell size={26} style={{ opacity: 0.35, margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--ink)' }}>No notifications</div>
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
                          padding: '0.85rem 1.15rem',
                          borderBottom: '1px solid var(--line)',
                          cursor: 'pointer',
                          background: isRead ? '#FFFFFF' : (isUrgent ? '#FFFBEB' : '#F3EFFF'),
                          transition: 'background 0.15s ease',
                          display: 'flex',
                          gap: '0.75rem',
                          alignItems: 'flex-start'
                        }}
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
                          background: isUrgent ? '#FEE2E2' : '#F3EFFF',
                          color: isUrgent ? 'var(--red)' : 'var(--primary)'
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
                              fontSize: '0.82rem',
                              color: 'var(--ink)',
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
                          <div style={{ fontSize: '0.75rem', color: 'var(--mute)', lineHeight: '1.4', marginBottom: '4px' }}>
                            {notif.message}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--mute)', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                padding: '0.65rem 1rem',
                borderTop: '1px solid var(--line)',
                background: 'var(--soft)',
                textAlign: 'center'
              }}>
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate(user.role === 'mentor' ? '/mentor/dashboard?tab=interventions' : '/student/dashboard');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.76rem',
                    color: 'var(--primary)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{user.role === 'mentor' ? 'View All Guidance Requests' : 'View Guidance Status'}</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Circular Initials Avatar */}
        <div
          className="header-avatar"
          title={`${user.name} (${user.role})`}
          onClick={() => navigate(user.role === 'mentor' ? '/mentor/dashboard?tab=overview' : user.role === 'student' ? '/student/dashboard' : '/admin/dashboard')}
          aria-label="User Profile"
        >
          {initials}
        </div>

      </div>
    </header>
  );
}
