import React from 'react';
import { RecordingProvider } from './context/RecordingContext';
import { AppLayout } from './components/layout/AppLayout';
import { RecordingControls } from './components/recording/RecordingControls';
import { RecordingList } from './components/recording/RecordingList';
import { AnnotationEditor } from './components/annotations/AnnotationEditor';
import { ExportPanel } from './components/export/ExportPanel';

const styles = {
  sidebar: {
    width: '320px',
    display: 'flex',
    flexDirection: 'column' as const,
    borderRight: '1px solid var(--border)',
    background: 'var(--bg-primary)',
    flexShrink: 0,
  },
  sidebarTop: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    background: 'var(--bg-primary)',
  },
};

export function App() {
  return (
    <RecordingProvider>
      <AppLayout>
        <div style={styles.sidebar}>
          <div style={styles.sidebarTop}>
            <RecordingControls />
            <ExportPanel />
          </div>
          <RecordingList />
        </div>
        <div style={styles.content}>
          <AnnotationEditor />
        </div>
      </AppLayout>
    </RecordingProvider>
  );
}
