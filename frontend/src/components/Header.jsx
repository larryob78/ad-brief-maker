export default function Header({ characterLocked, worldType, styleType }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Napkin AI Director</h1>
        <span className="header-subtitle">30-second spots in hours, not weeks</span>
      </div>
      <div className="header-pills">
        {characterLocked && (
          <span className="pill pill-locked">🔒 Character Locked</span>
        )}
        {worldType && (
          <span className="pill pill-world">🌍 {worldType.replace('_', ' ')}</span>
        )}
        {styleType && (
          <span className="pill pill-style">🎨 {styleType}</span>
        )}
      </div>
    </header>
  );
}
