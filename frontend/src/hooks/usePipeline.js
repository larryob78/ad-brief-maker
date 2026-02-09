import { useState, useCallback, useRef } from 'react';
import { connectPipelineWS } from '../api/client';

const INITIAL_STAGES = [
  { stage: 1, label: 'Initialize Pipeline', agent: 'System', icon: '🚀', status: 'pending' },
  { stage: 2, label: 'Generate 3D World', agent: 'Marble (World Labs)', icon: '🌍', status: 'pending' },
  { stage: 3, label: 'Segment Video', agent: 'SAM2 (Replicate)', icon: '✂️', status: 'pending' },
  { stage: 4, label: 'Generate Shot 1', agent: 'Luma Ray3', icon: '🎬', status: 'pending' },
  { stage: 5, label: 'Generate Shot 2', agent: 'Luma Ray3', icon: '🎬', status: 'pending' },
  { stage: 6, label: 'Generate Shot 3', agent: 'Luma Ray3', icon: '🎬', status: 'pending' },
  { stage: 7, label: 'Vision QA', agent: 'Kimi K2.5', icon: '👁️', status: 'pending' },
  { stage: 8, label: 'Regenerate Failed', agent: 'Luma Ray3', icon: '🔄', status: 'pending' },
  { stage: 9, label: '4K HDR Master', agent: 'Luma Hi-Fi', icon: '✨', status: 'pending' },
];

export function usePipeline() {
  const [stages, setStages] = useState(INITIAL_STAGES);
  const [currentStage, setCurrentStage] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState(null);
  const wsRef = useRef(null);

  const startPipeline = useCallback((jobId) => {
    setStages(INITIAL_STAGES);
    setCurrentStage(1);
    setIsComplete(false);
    setResults(null);

    wsRef.current = connectPipelineWS(jobId, (msg) => {
      if (msg.type === 'pipeline_stage') {
        setStages(msg.stages.map(s => ({
          ...s,
          icon: INITIAL_STAGES.find(is_ => is_.stage === s.stage)?.icon || '⚙️',
        })));
        setCurrentStage(msg.stage);
      } else if (msg.type === 'pipeline_complete') {
        setIsComplete(true);
        setResults(msg.results);
        if (wsRef.current) {
          wsRef.current.close();
        }
      }
    });
  }, []);

  const reset = useCallback(() => {
    setStages(INITIAL_STAGES);
    setCurrentStage(0);
    setIsComplete(false);
    setResults(null);
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  return { stages, currentStage, isComplete, results, startPipeline, reset };
}
