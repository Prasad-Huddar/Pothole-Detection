import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ScanSearch, Video, BarChart3, Map, Wrench,
  FileText, Settings, ChevronLeft, ChevronRight,
  Cpu, CircleDot, User as UserIcon, LogOut, KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { path: '/detection', label: 'Pothole Detection', icon: <ScanSearch size={18} /> },
  { path: '/video', label: 'Video Analysis', icon: <Video size={18} /> },
  { path: '/analytics', label: 'Severity & Risk', icon: <BarChart3 size={18} /> },
  { path: '/monitoring', label: 'Road Monitoring', icon: <Map size={18} /> },
  { path: '/maintenance', label: 'Maintenance', icon: <Wrench size={18} />, badge: 'new' },
  { path: '/reports', label: 'Reports & Exports', icon: <FileText size={18} /> },
  { path: '/settings', label: 'Settings', icon: <Settings size={18} /> },
];

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  return (
    <aside
      style={{
        width: collapsed ? 72 : 260,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        flexShrink: 0,
        height: '100vh',
        position: 'relative',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '20px 16px' : '20px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(56,189,248,0.3)',
          }}
        >
          <CircleDot size={20} color="#0a0e1a" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: '1rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              POTHOLEIQ
              <span style={{ color: 'var(--accent-blue)' }}> AI</span>
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginTop: 1,
              }}
            >
              Intelligent Road Defect Vision
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {!collapsed && (
          <div
            style={{
              padding: '6px 20px 4px',
              fontSize: '0.68rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Navigation
          </div>
        )}
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px 0' : '9px 20px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                margin: '0 8px',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(56,189,248,0.10)' : 'transparent',
                borderLeft: isActive && !collapsed ? '2px solid var(--accent-blue)' : '2px solid transparent',
                transition: 'all 0.18s ease',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.875rem',
                position: 'relative',
                overflow: 'hidden',
              }}
              title={collapsed ? item.label : undefined}
            >
              <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
              {!collapsed && (
                <>
                  <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{item.label}</span>
                  {item.badge && (
                    <span
                      style={{
                        background: 'var(--accent-blue)',
                        color: '#0a0e1a',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 100,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Status indicator */}
      {!collapsed && (
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border-subtle)',
            margin: '0 8px 8px',
            borderRadius: 8,
            background: 'var(--bg-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="status-dot live" />
            <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: 700 }}>AI Vision Engine Live</span>
          </div>
        </div>
      )}

      {/* User profile / Auth Card at bottom of Sidebar */}
      <div
        style={{
          padding: collapsed ? '10px 8px' : '10px 12px',
          borderTop: '1px solid var(--border-subtle)',
          margin: '0 8px 12px',
          borderRadius: 8,
          background: 'var(--bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 10,
        }}
      >
        {isAuthenticated && user ? (
          <>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.75rem',
                flexShrink: 0,
              }}
              title={user.name}
            >
              {user.avatar_initials || 'PH'}
            </div>
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--accent-blue)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.role}
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={logout}
                className="btn btn-ghost btn-xs"
                title="Sign Out"
                style={{ padding: '4px', color: 'var(--text-muted)' }}
              >
                <LogOut size={14} />
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal('login')}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', padding: '6px 10px', gap: 6 }}
          >
            <KeyRound size={13} />
            {!collapsed && 'Sign In'}
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          position: 'absolute',
          right: -12,
          top: 80,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          transition: 'all 0.2s ease',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
};
