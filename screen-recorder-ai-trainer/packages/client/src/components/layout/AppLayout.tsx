import React, { ReactNode } from 'react';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-sm)',
    background: 'linear-gradient(135deg, var(--accent), #a855f7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 700,
    fontSize: '14px',
  },
  logoText: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  logoSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  main: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
};

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>SR</div>
          <div>
            <div style={styles.logoText}>Screen Recorder</div>
            <div style={styles.logoSub}>AI Workflow Trainer</div>
          </div>
        </div>
      </header>
      <main style={styles.main}>{children}</main>
    </div>
  );
}
