import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        marginTop: 'auto',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(12px)',
        padding: '12px 24px',
        color: 'var(--text-muted)',
        fontSize: '0.78125rem',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 -4px 20px var(--shadow-color, rgba(0,0,0,0.15))',
      }}
    >
      <div
        style={{
          maxWidth: 1600,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          gap: 16,
          whiteSpace: 'nowrap',
        }}
      >
        {/* Left: Copyright & Autonomous System Title */}
        <div
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}
        >
          © 2026 <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>POTHOLEIQ AI</strong> — Road Defect Monitoring System. All rights reserved.
        </div>

        {/* Right: Designed by Prasad Huddar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
            fontSize: '0.78125rem',
          }}
        >
          <span
            style={{
              color: '#38bdf8',
              fontWeight: 700,
              letterSpacing: '0.02em',
              textShadow: '0 0 12px rgba(56, 189, 248, 0.35)',
            }}
          >
            Designed by Prasad Huddar
          </span>
        </div>
      </div>
    </footer>
  );
};
