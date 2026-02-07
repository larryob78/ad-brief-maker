import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Recording } from '@shared/types/recording';
import { getAllRecordings, deleteRecording as dbDelete, updateRecording as dbUpdate } from '../storage/db';

interface RecordingContextType {
  recordings: Recording[];
  selectedRecording: Recording | null;
  setSelectedRecording: (r: Recording | null) => void;
  refreshRecordings: () => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;
  updateRecording: (recording: Recording) => Promise<void>;
}

const RecordingContext = createContext<RecordingContextType | null>(null);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);

  const refreshRecordings = useCallback(async () => {
    const all = await getAllRecordings();
    setRecordings(all);
  }, []);

  const deleteRecording = useCallback(async (id: string) => {
    await dbDelete(id);
    setSelectedRecording(prev => prev?.id === id ? null : prev);
    const all = await getAllRecordings();
    setRecordings(all);
  }, []);

  const updateRecording = useCallback(async (recording: Recording) => {
    await dbUpdate(recording);
    setSelectedRecording(prev => prev?.id === recording.id ? recording : prev);
    const all = await getAllRecordings();
    setRecordings(all);
  }, []);

  useEffect(() => {
    refreshRecordings();
  }, [refreshRecordings]);

  const value = useMemo(() => ({
    recordings,
    selectedRecording,
    setSelectedRecording,
    refreshRecordings,
    deleteRecording,
    updateRecording,
  }), [recordings, selectedRecording, refreshRecordings, deleteRecording, updateRecording]);

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecordings() {
  const ctx = useContext(RecordingContext);
  if (!ctx) throw new Error('useRecordings must be used within RecordingProvider');
  return ctx;
}
