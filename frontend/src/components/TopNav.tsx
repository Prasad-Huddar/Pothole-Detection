import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, Search, User, Plus, ChevronRight, Sun, Moon,
  CheckCircle2, AlertTriangle, Info, X, Shield, Activity, Power, ExternalLink,
  Edit3, Save, RotateCcw, LogOut, KeyRound, Sparkles
} from 'lucide-react';
import { getInitialTheme, applyTheme, Theme } from '../utils/theme';
import { analyticsApi, systemApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PAGE_META: Record<string, { title: string; breadcrumbs: string[] }> = {
  '/': { title: 'Overview Dashboard', breadcrumbs: ['Dashboard'] },
  '/detection': { title: 'Pothole Detection', breadcrumbs: ['Dashboard', 'Pothole Detection'] },
  '/video': { title: 'Video Analysis & Tracking', breadcrumbs: ['Dashboard', 'Video Analysis'] },
  '/analytics': { title: 'Severity & Risk Analytics', breadcrumbs: ['Dashboard', 'Analytics'] },
  '/monitoring': { title: 'Road Monitoring', breadcrumbs: ['Dashboard', 'Road Monitoring'] },
  '/maintenance': { title: 'Maintenance Prioritization', breadcrumbs: ['Dashboard', 'Maintenance'] },
  '/reports': { title: 'Reports & Exports', breadcrumbs: ['Dashboard', 'Reports'] },
  '/settings': { title: 'Settings', breadcrumbs: ['Dashboard', 'Settings'] },
};

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  type: 'danger' | 'warning' | 'success' | 'info';
  path?: string;
}

export const TopNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  // Interactive Popover States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isInspectorActive, setIsInspectorActive] = useState(true);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => {
      systemApi.getHealth()
        .then((res) => setBackendOnline(res.data?.status === 'ok'))
        .catch(() => setBackendOnline(false));
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);
  const { user, isAuthenticated, openAuthModal, logout, switchAccount } = useAuth();

  const currentProfile = {
    name: user?.name || 'Prasad Huddar',
    title: user?.role || 'Chief Road Infrastructure Engineer',
    department: user?.department || 'National Highway & Road Safety Command',
    email: user?.email || 'prasad.huddar@potholeiq.ai',
    initials: user?.avatar_initials || 'PH',
  };

  const [profile, setProfile] = useState(currentProfile);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        title: user.role,
        department: user.department,
        email: user.email,
        initials: user.avatar_initials || 'PH',
      });
      setEditForm({
        name: user.name,
        title: user.role,
        department: user.department,
        email: user.email,
        initials: user.avatar_initials || 'PH',
      });
    }
  }, [user]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState(currentProfile);
  const [dailyScans, setDailyScans] = useState(() => {
    return parseInt(localStorage.getItem('roadvision:dailyScans') || '0', 10);
  });
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  const handleResetActivity = async () => {
    try {
      await analyticsApi.resetActivity();
      setDailyScans(0);
      localStorage.setItem('roadvision:dailyScans', '0');
      setResetFeedback('Active session & inspection data reset successfully!');
      window.dispatchEvent(new Event('roadvision:reset'));
      setTimeout(() => {
        setResetFeedback(null);
        setShowProfile(false);
      }, 1600);
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(editForm);
    localStorage.setItem('roadvision:profile', JSON.stringify(editForm));
    setIsEditingProfile(false);
  };

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Live Notifications List
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'N1',
      title: 'High-Severity Hazard Flagged',
      desc: '10 potholes detected on Outer Ring Road (Sector 4). Immediate crew review requested.',
      time: 'Just now',
      unread: true,
      type: 'danger',
      path: '/detection',
    },
    {
      id: 'N2',
      title: 'Autonomous AI Engine Synchronized',
      desc: 'Deep Neural Vision Model loaded with high-precision road damage weights.',
      time: '12m ago',
      unread: true,
      type: 'success',
      path: '/settings',
    },
    {
      id: 'N3',
      title: 'Maintenance Work Order Scheduled',
      desc: 'Asphalt repair crew dispatched to MG Road Expressway segment #04.',
      time: '1h ago',
      unread: true,
      type: 'warning',
      path: '/maintenance',
    },
  ]);

  // Apply theme on mount and change
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  // Close popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const meta = PAGE_META[location.pathname] ?? { title: 'POTHOLEIQ AI', breadcrumbs: ['Dashboard'] };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate('/monitoring');
    }
  };

  return (
    <header
      style={{
        height: 64,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '0 24px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 50,
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      {/* Title & Breadcrumbs */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
          {meta.breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb}>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: i === meta.breadcrumbs.length - 1 ? 'var(--text-secondary)' : 'var(--text-muted)',
                }}
              >
                {crumb}
              </span>
              {i < meta.breadcrumbs.length - 1 && (
                <ChevronRight size={12} color="var(--text-muted)" />
              )}
            </React.Fragment>
          ))}
        </div>
        <h1
          style={{
            fontSize: '1.0625rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {meta.title}
        </h1>
      </div>

      {/* Global Search */}
      <form onSubmit={handleSearchSubmit}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 8,
            padding: '7px 12px',
            width: 220,
            transition: 'border-color 0.2s',
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search road hazard..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              fontFamily: 'inherit',
              width: '100%',
            }}
          />
        </div>
      </form>

      {/* Light / Dark Mode Toggle Switch */}
      <button
        type="button"
        onClick={toggleTheme}
        style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          color: theme === 'dark' ? '#f59e0b' : 'var(--accent-blue)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      {/* Real-time Notification Bell & Popover */}
      <div style={{ position: 'relative' }} ref={notifRef}>
        <button
          type="button"
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowProfile(false);
          }}
          style={{
            position: 'relative',
            width: 38,
            height: 38,
            borderRadius: 8,
            background: showNotifications ? 'var(--bg-hover)' : 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            color: showNotifications ? 'var(--accent-blue)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.18s ease',
          }}
          title="System Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                minWidth: 16,
                height: 16,
                padding: '0 4px',
                background: '#ef4444',
                color: '#ffffff',
                borderRadius: 100,
                fontSize: '0.65rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-surface)',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Popover Dropdown */}
        {showNotifications && (
          <div
            className="popover-card"
            style={{
              position: 'absolute',
              top: 48,
              right: 0,
              width: 340,
              padding: 0,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Live Alerts</span>
                {unreadCount > 0 && (
                  <span className="badge badge-high" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                    {unreadCount} New
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-blue)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  No active notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: n.unread ? 'var(--bg-elevated)' : 'transparent',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      transition: 'background 0.15s ease',
                      cursor: n.path ? 'pointer' : 'default',
                    }}
                    onClick={() => {
                      if (n.path) {
                        navigate(n.path);
                        setShowNotifications(false);
                      }
                      setNotifications((prev) =>
                        prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
                      );
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                          n.type === 'danger'
                            ? 'rgba(239,68,68,0.15)'
                            : n.type === 'warning'
                            ? 'rgba(245,158,11,0.15)'
                            : 'rgba(34,197,94,0.15)',
                        color:
                          n.type === 'danger' ? '#ef4444' : n.type === 'warning' ? '#f59e0b' : '#22c55e',
                      }}
                    >
                      {n.type === 'danger' ? (
                        <AlertTriangle size={14} />
                      ) : n.type === 'warning' ? (
                        <Info size={14} />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: n.unread ? 700 : 500,
                          color: 'var(--text-primary)',
                          marginBottom: 2,
                        }}
                      >
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {n.desc}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        {n.time}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(n.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 2,
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                padding: '8px 16px',
                background: 'var(--bg-elevated)',
                borderTop: '1px solid var(--border-subtle)',
                textAlign: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  navigate('/monitoring');
                  setShowNotifications(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-blue)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                View Surveillance Feed <ExternalLink size={11} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Analysis Action Button */}
      <button
        className="btn btn-primary btn-sm"
        onClick={() => navigate('/detection')}
        style={{ fontWeight: 600 }}
      >
        <Plus size={14} />
        New Analysis
      </button>

      {/* Real-time Inspector Profile & Popover / Sign In */}
      {!isAuthenticated ? (
        <button
          type="button"
          onClick={() => openAuthModal('login')}
          className="btn btn-primary btn-sm"
          style={{ gap: 6, fontWeight: 700, padding: '7px 14px', borderRadius: 8 }}
        >
          <KeyRound size={14} />
          Sign In
        </button>
      ) : (
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              padding: '4px 10px 4px 4px',
              borderRadius: 100,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
            title="Inspector Profile"
          >
            <div
              style={{
                position: 'relative',
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.75rem',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
              }}
            >
              {profile.initials}
              <span
                style={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 9,
                  height: 9,
                  borderRadius: '50%',
                  background: isInspectorActive ? '#22c55e' : '#f59e0b',
                  border: '2px solid var(--bg-surface)',
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.1 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {profile.name}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                {profile.title.split(' ')[0]} Active
              </span>
            </div>
          </div>

          {/* Profile Details Modal / Dropdown */}
          {showProfile && (
            <div
              className="popover-card"
              style={{
                position: 'absolute',
                top: 48,
                right: 0,
                width: 320,
                padding: 0,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-popover)',
                zIndex: 50,
              }}
            >
              {/* Header banner / Edit Mode */}
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} style={{ padding: '14px 16px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 10, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Edit Inspector Profile</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Inspector Full Name</label>
                      <input
                        type="text"
                        className="input"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        required
                        style={{ width: '100%', fontSize: '0.8rem', padding: '6px 8px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Title / Role</label>
                      <input
                        type="text"
                        className="input"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        required
                        style={{ width: '100%', fontSize: '0.8rem', padding: '6px 8px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Department</label>
                      <input
                        type="text"
                        className="input"
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        required
                        style={{ width: '100%', fontSize: '0.8rem', padding: '6px 8px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1, padding: '5px 10px', fontSize: '0.78rem' }}>
                        <Save size={12} /> Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setIsEditingProfile(false)}
                        style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div
                  style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(2,132,199,0.15), rgba(56,189,248,0.05))',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        flexShrink: 0,
                      }}
                    >
                      {profile.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {profile.name}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => {
                        setEditForm(profile);
                        setIsEditingProfile(true);
                      }}
                      title="Edit Profile"
                      style={{ padding: '4px 6px', color: 'var(--accent-blue)' }}
                    >
                      <Edit3 size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Inspector Duty Status Toggle */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Inspection Duty Status</span>
                  <button
                    type="button"
                    onClick={() => setIsInspectorActive(!isInspectorActive)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 100,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      background: isInspectorActive ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                      color: isInspectorActive ? '#22c55e' : '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Activity size={11} />
                    {isInspectorActive ? 'Active On-Duty' : 'Paused / Standby'}
                  </button>
                </div>
              </div>



              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ background: 'var(--bg-elevated)', padding: '8px 10px', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Session Scans</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-blue)' }}>{dailyScans}</div>
                </div>
              </div>

              {/* Reset Feedback Banner */}
              {resetFeedback && (
                <div
                  style={{
                    margin: '8px 12px 0',
                    padding: '8px 10px',
                    background: 'rgba(34,197,94,0.12)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: 6,
                    color: '#22c55e',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <CheckCircle2 size={13} /> {resetFeedback}
                </div>
              )}

              {/* Quick Actions */}
              <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button
                  type="button"
                  onClick={() => {
                    openAuthModal('signup');
                    setShowProfile(false);
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem', gap: 6, color: 'var(--accent-blue)' }}
                >
                  <Plus size={13} /> Register New Inspector Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/reports');
                    setShowProfile(false);
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem', gap: 6 }}
                >
                  <ExternalLink size={13} /> Audit Logs & Reports
                </button>
                <button
                  type="button"
                  onClick={handleResetActivity}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem', color: '#f59e0b', gap: 6 }}
                >
                  <RotateCcw size={13} /> Reset Activity Session Data
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setShowProfile(false);
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem', color: '#ef4444', gap: 6, marginTop: 4, borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}
                >
                  <LogOut size={13} /> Sign Out / Lock Session
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
