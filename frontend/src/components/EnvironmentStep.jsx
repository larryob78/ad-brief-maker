const ENVIRONMENTS = [
  { id: 'neon_city', label: 'Neon City', emoji: '🌃' },
  { id: 'tropical', label: 'Tropical', emoji: '🏝️' },
  { id: 'mountain', label: 'Mountain', emoji: '🏔️' },
  { id: 'desert', label: 'Desert', emoji: '🏜️' },
  { id: 'underwater', label: 'Underwater', emoji: '🌊' },
  { id: 'space', label: 'Space', emoji: '🚀' },
  { id: 'forest', label: 'Forest', emoji: '🌲' },
  { id: 'urban', label: 'Urban', emoji: '🏙️' },
];

export default function EnvironmentStep({ selected, onSelect, onNext }) {
  return (
    <div className="step-container fade-in">
      <div className="step-header">
        <span className="step-number">02</span>
        <h2>Choose Your World</h2>
      </div>
      <p className="step-description">Select a 3D environment for your ad. Powered by Marble (World Labs).</p>

      <div className="selection-grid grid-8">
        {ENVIRONMENTS.map((env) => (
          <button
            key={env.id}
            className={`selection-card ${selected === env.id ? 'selected' : ''}`}
            onClick={() => {
              onSelect(env.id);
              setTimeout(() => onNext(), 400);
            }}
          >
            <span className="selection-emoji">{env.emoji}</span>
            <span className="selection-label">{env.label}</span>
            {selected === env.id && <span className="selection-check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
