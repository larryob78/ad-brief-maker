import { useState, useCallback, useRef } from 'react';
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

  const startRecording = useCallback(async (config: RecordingConfig) => {
    const recorder = new ScreenRecorder({
      onStateChange: setState,
      onDurationUpdate: setDuration,
      onError: (err) => console.error('Recording error:', err),
    });

    recorderRef.current = recorder;
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
    if (!recorderRef.current || !currentRecording) return null;

    const blob = await recorderRef.current.stop();
    const finalRecording: Recording = {
      ...currentRecording,
      duration,
      fileSize: blob.size,
      mimeType: mimeTypeRef.current,
      status: 'ready',
      updatedAt: new Date().toISOString(),
      videoBlobUrl: URL.createObjectURL(blob),
    };

    await saveRecording(finalRecording, blob);
    setCurrentRecording(null);
    setDuration(0);
    return finalRecording;
  }, [currentRecording, duration]);

  const addStep = useCallback((step: Omit<AnnotationStep, 'id' | 'timestamp'>) => {
    if (!currentRecording) return;
    const newStep: AnnotationStep = {
      ...step,
      id: uuidv4(),
      timestamp: duration,
    };
    setCurrentRecording(prev => prev ? {
      ...prev,
      steps: [...prev.steps, newStep],
    } : null);
  }, [currentRecording, duration]);

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
