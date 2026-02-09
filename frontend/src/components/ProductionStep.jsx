import { useEffect, useState } from 'react';
import { produce } from '../api/client';
import { usePipeline } from '../hooks/usePipeline';

export default function ProductionStep({
  characterDescription,
  characterRefUrls,
  worldType,
  styleType,
  brief,
  shotList,
}) {
  const { stages, currentStage, isComplete, results, startPipeline } = usePipeline();
  const [started, setStarted] = useState(false);
  const [jobId, setJobId] = useState(null);

  const handleProduce = async () => {
    setStarted(true);
    try {
      const res = await produce({
        character_description: characterDescription,
        character_ref_urls: characterRefUrls,
        world_type: worldType,
        style_type: styleType,
        brief,
        shot_list: shotList,
      });
      setJobId(res.job_id);
      startPipeline(res.job_id);
    } catch (err) {
      console.error('Production error:', err);
    }
  };

  return (
    <div className="step-container production-container fade-in">
      <div className="step-header">
        <span className="step-number">05</span>
        <h2>Production Pipeline</h2>
      </div>

      {!started && (
        <div className="produce-cta">
          <p className="produce-description">
            Your brief is ready. Hit PRODUCE to launch the full AI pipeline — 9 stages,
            5 AI agents, one 30-second masterpiece.
          </p>
          <button className="btn btn-produce pulse" onClick={handleProduce}>
            PRODUCE
          </button>
        </div>
      )}

      {started && (
        <div className="pipeline-stages">
          {stages.map((stage, i) => (
            <div
              key={stage.stage}
              className={`pipeline-stage ${stage.status} ${
                stage.stage === currentStage && stage.status === 'running' ? 'current' : ''
              }`}
            >
              <div className="stage-icon">
                {stage.status === 'done' ? (
                  <span className="stage-check">✓</span>
                ) : (
                  <span>{stage.icon}</span>
                )}
              </div>
              <div className="stage-info">
                <div className="stage-label">{stage.label}</div>
                <div className="stage-agent">{stage.agent}</div>
              </div>
              <div className="stage-status-indicator">
                {stage.status === 'running' && <div className="stage-pulse" />}
                {stage.status === 'done' && <span className="stage-done-dot" />}
              </div>
            </div>
          ))}

          {/* Animated dots connecting stages */}
          <div className="pipeline-progress-track">
            {stages.map((stage, i) => (
              <div
                key={i}
                className={`progress-dot ${stage.status === 'done' ? 'filled' : ''} ${
                  stage.status === 'running' ? 'active' : ''
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {isComplete && (
        <div className="production-complete fade-in">
          <div className="complete-header">
            <span className="complete-icon">✅</span>
            <h3>Production Complete</h3>
          </div>
          <div className="complete-stats">
            <div className="stat">
              <span className="stat-value">{results?.shots_produced || 5}</span>
              <span className="stat-label">Shots Produced</span>
            </div>
            <div className="stat">
              <span className="stat-value">{results?.quality || '4K HDR'}</span>
              <span className="stat-label">Quality</span>
            </div>
            <div className="stat">
              <span className="stat-value">{results?.bit_depth || '16-bit EXR'}</span>
              <span className="stat-label">Bit Depth</span>
            </div>
            <div className="stat">
              <span className="stat-value">~$47</span>
              <span className="stat-label">AI Cost</span>
            </div>
            <div className="stat stat-savings">
              <span className="stat-value">$48,953</span>
              <span className="stat-label">vs Traditional</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
