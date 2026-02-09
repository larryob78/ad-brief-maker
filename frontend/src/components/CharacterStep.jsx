import { useState, useEffect, useRef } from 'react';
import { generateTurntable, getTurntableStatus, lockCharacter } from '../api/client';

const ANGLES = ['Front', '3/4 Left', 'Profile Left', '3/4 Back', 'Back', '3/4 Right'];

export default function CharacterStep({ onLock, onNext }) {
  const [description, setDescription] = useState('');
  const [jobId, setJobId] = useState(null);
  const [angles, setAngles] = useState(ANGLES.map(a => ({ angle: a, url: null, status: 'pending' })));
  const [generating, setGenerating] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const [locked, setLocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visibleAngles, setVisibleAngles] = useState([]);
  const pollRef = useRef(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setGenerating(true);
    setAngles(ANGLES.map(a => ({ angle: a, url: null, status: 'generating' })));
    setVisibleAngles([]);
    setProgress(0);
    setAllDone(false);

    try {
      const res = await generateTurntable(description);
      setJobId(res.job_id);

      // Start polling
      pollRef.current = setInterval(async () => {
        try {
          const status = await getTurntableStatus(res.job_id);
          if (status.angles && status.angles.length > 0) {
            setAngles(status.angles);
            const doneCount = status.angles.filter(a => a.status === 'done').length;
            setProgress((doneCount / 6) * 100);

            // Staggered reveal
            const newVisible = [];
            status.angles.forEach((a, i) => {
              if (a.status === 'done' || a.status === 'error') {
                newVisible.push(i);
              }
            });
            setVisibleAngles(newVisible);

            if (status.all_done) {
              setAllDone(true);
              setGenerating(false);
              clearInterval(pollRef.current);
            }
          }
        } catch {
          // Continue polling
        }
      }, 1500);
    } catch (err) {
      console.error('Generation error:', err);
      setGenerating(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleLock = async () => {
    if (!jobId) return;
    const res = await lockCharacter(jobId);
    if (res.status === 'locked') {
      setLocked(true);
      onLock({
        description,
        refUrls: res.character_ref_urls,
        jobId,
      });
      setTimeout(() => onNext(), 500);
    }
  };

  return (
    <div className="step-container fade-in">
      <div className="step-header">
        <span className="step-number">01</span>
        <h2>Create Your Character</h2>
      </div>

      <div className="character-input-group">
        <textarea
          className="character-textarea"
          placeholder="Describe your character in detail... e.g., 'A confident young woman in her 20s, wearing a sleek black leather jacket, silver earrings, short pixie cut hair dyed electric blue, athletic build, holding a next-gen smartphone'"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          disabled={generating || locked}
        />
        <button
          className="btn btn-primary btn-generate"
          onClick={handleGenerate}
          disabled={!description.trim() || generating || locked}
        >
          {generating ? 'GENERATING...' : 'GENERATE CHARACTER'}
        </button>
      </div>

      {(generating || angles.some(a => a.status !== 'pending')) && (
        <>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
            <span className="progress-label">{Math.round(progress)}%</span>
          </div>

          <div className="turntable-grid">
            {angles.map((angle, i) => (
              <div
                key={angle.angle}
                className={`turntable-cell ${visibleAngles.includes(i) ? 'visible' : ''} ${angle.status}`}
                style={{ animationDelay: `${i * 600}ms` }}
              >
                <div className="turntable-cell-inner">
                  {angle.url ? (
                    <img src={angle.url} alt={angle.angle} />
                  ) : (
                    <div className="turntable-placeholder">
                      {angle.status === 'generating' && <div className="spinner" />}
                      {angle.status === 'error' && <span className="error-icon">✕</span>}
                    </div>
                  )}
                  <div className="turntable-label">
                    {angle.angle}
                    {angle.status === 'done' && <span className="checkmark">✓</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {allDone && !locked && (
        <button
          className={`btn btn-lock ${allDone ? 'pulse' : ''}`}
          onClick={handleLock}
        >
          LOCK CHARACTER
        </button>
      )}

      {locked && (
        <div className="locked-badge">
          <span className="checkmark">✓</span> Character Locked
        </div>
      )}
    </div>
  );
}
