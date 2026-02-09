const STYLES = [
  { id: 'cinematic', label: 'Cinematic', emoji: '🎥', desc: 'Hollywood blockbuster look' },
  { id: 'documentary', label: 'Documentary', emoji: '📹', desc: 'Raw, authentic feel' },
  { id: 'anime', label: 'Anime', emoji: '🎌', desc: 'Japanese animation style' },
  { id: 'noir', label: 'Noir', emoji: '🌑', desc: 'Dark, moody contrast' },
  { id: 'neon', label: 'Neon', emoji: '💜', desc: 'Vibrant synthwave glow' },
  { id: 'vintage', label: 'Vintage', emoji: '📼', desc: 'Retro film grain' },
];

export default function StyleStep({ selected, onSelect, onNext }) {
  return (
    <div className="step-container fade-in">
      <div className="step-header">
        <span className="step-number">03</span>
        <h2>Pick Your Style</h2>
      </div>
      <p className="step-description">Choose a visual style for Luma Ray3 video generation.</p>

      <div className="selection-grid grid-6">
        {STYLES.map((style) => (
          <button
            key={style.id}
            className={`selection-card ${selected === style.id ? 'selected' : ''}`}
            onClick={() => {
              onSelect(style.id);
              setTimeout(() => onNext(), 400);
            }}
          >
            <span className="selection-emoji">{style.emoji}</span>
            <span className="selection-label">{style.label}</span>
            <span className="selection-desc">{style.desc}</span>
            {selected === style.id && <span className="selection-check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
