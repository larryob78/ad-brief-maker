import { useState, useCallback, useRef, useEffect } from 'react';
import { ScreenRecorder, RecorderState } from '../engine/recorder';
import { RecordingConfig, Recording, AnnotationStep } from '@shared/types/recording';
import { saveRecording } from '../storage/db';
import { v4 as uuidv4 } from 'uuid';

export function useRecorder() {
  const [state, setState] = useState<RecorderState>('idle');
  const [duration, setDuration] = useState(0);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const recorderRef = useRef<ScreenRecorder | null>(null);
  const mimeTypeRef = useRef<string>('video/webm');
  const blobUrlRef = useRef<string | null>(null);
  const currentRecordingRef = useRef<Recording | null>(null);
  const durationRef = useRef(0);

  // Keep refs in sync with state so callbacks have fresh values
  useEffect(() => { currentRecordingRef.current = currentRecording; }, [currentRecording]);
  useEffect(() => { durationRef.current = duration; }, [duration]);

  const startRecording = useCallback(async (config: RecordingConfig) => {
    // Revoke any stale blob URL from previous recording
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const recording: Recording = {
      id,
      title: '',
      description: '',
      createdAt: now,
      updatedAt: now,
      duration: 0,
      mimeType: 'video/webm',
      fileSize: 0,
      config,
      steps: [],
      tags: [],
      status: 'recording',
    };

    setCurrentRecording(recording);

    const recorder = new ScreenRecorder({
      onStateChange: setState,
      onDurationUpdate: setDuration,
      onError: (err) => console.error('Recording error:', err),
      onDataAvailable: async (blob) => {
        // Handle browser-initiated stop (user clicked "Stop sharing")
        // This fires for both manual stop() and browser-initiated stops
        const rec = currentRecordingRef.current;
        if (!rec) return;

        const finalRecording: Recording = {
          ...rec,
          duration: durationRef.current,
          fileSize: blob.size,
          mimeType: mimeTypeRef.current,
          status: 'ready',
          updatedAt: new Date().toISOString(),
          // Don't persist blob URL -- it's session-scoped and invalid after reload
        };

        try {
          await saveRecording(finalRecording, blob);
        } catch (err) {
          console.error('Failed to save recording:', err);
        }
        setCurrentRecording(null);
        setDuration(0);
      },
    });

    recorderRef.current = recorder;
    const mimeType = await recorder.start(config);
    mimeTypeRef.current = mimeType;
    recording.mimeType = mimeType;
    setCurrentRecording({ ...recording });
  }, []);

  const pauseRecording = useCallback(() => {
    recorderRef.current?.pause();
  }, []);

  const resumeRecording = useCallback(() => {
    recorderRef.current?.resume();
  }, []);

  const stopRecording = useCallback(async (): Promise<Recording | null> => {
    const rec = currentRecordingRef.current;
    if (!recorderRef.current || !rec) return null;

    const blob = await recorderRef.current.stop();
    // The onDataAvailable handler saves the recording.
    // Return the final recording info for the caller.
    return {
      ...rec,
      duration: durationRef.current,
      fileSize: blob.size,
      mimeType: mimeTypeRef.current,
      status: 'ready',
      updatedAt: new Date().toISOString(),
    };
  }, []);

  const addStep = useCallback((step: Omit<AnnotationStep, 'id' | 'timestamp'>) => {
    setCurrentRecording(prev => {
      if (!prev) return null;
      const newStep: AnnotationStep = {
        ...step,
        id: uuidv4(),
        timestamp: durationRef.current,
      };
      return {
        ...prev,
        steps: [...prev.steps, newStep],
      };
    });
  }, []);

  const captureScreenshot = useCallback(async () => {
    return recorderRef.current?.captureScreenshot() ?? null;
  }, []);

  return {
    state,
    duration,
    currentRecording,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    addStep,
    captureScreenshot,
  };
}
