import { useState } from 'react';
import VideoPreview from './components/VideoPreview';
import ClaudePanel from './components/ClaudePanel';

interface BriefData {
  headline: string;
  description: string;
  callToAction: string;
  brandName: string;
}

function App() {
  const [briefData, setBriefData] = useState<BriefData>({
    headline: 'Your Amazing Product',
    description: 'Discover the future of innovation',
    callToAction: 'Shop Now',
    brandName: 'Brand',
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Ad Brief Maker</h1>
      </header>

      <main className="split-view">
        {/* Left Panel - Remotion Video Preview */}
        <div className="panel video-panel">
          <div className="panel-header">
            <h2>Video Preview</h2>
          </div>
          <div className="panel-content">
            <VideoPreview briefData={briefData} />
          </div>
        </div>

        {/* Right Panel - Claude Code / AI Panel */}
        <div className="panel claude-panel">
          <div className="panel-header">
            <h2>AI Brief Generator</h2>
          </div>
          <div className="panel-content">
            <ClaudePanel briefData={briefData} onUpdate={setBriefData} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
