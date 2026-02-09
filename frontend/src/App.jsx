import { useState } from 'react';
import Header from './components/Header';
import CharacterStep from './components/CharacterStep';
import EnvironmentStep from './components/EnvironmentStep';
import StyleStep from './components/StyleStep';
import ChatStep from './components/ChatStep';
import ProductionStep from './components/ProductionStep';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [characterLocked, setCharacterLocked] = useState(false);
  const [characterData, setCharacterData] = useState(null);
  const [worldType, setWorldType] = useState(null);
  const [styleType, setStyleType] = useState(null);
  const [brief, setBrief] = useState('');
  const [shotList, setShotList] = useState([]);
  const [produceReady, setProduceReady] = useState(false);

  const handleCharacterLock = (data) => {
    setCharacterLocked(true);
    setCharacterData(data);
  };

  const handleProduceReady = (userBrief, directorResponse) => {
    setBrief(userBrief);
    const shots = directorResponse
      .split('\n')
      .filter((line) => /shot\s*\d/i.test(line))
      .map((line) => line.trim());
    setShotList(shots.length > 0 ? shots : [userBrief]);
    setProduceReady(true);
  };

  return (
    <div className="app">
      <Header
        characterLocked={characterLocked}
        worldType={worldType}
        styleType={styleType}
      />

      <main className="main-content">
        {currentStep === 1 && (
          <CharacterStep
            onLock={handleCharacterLock}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <EnvironmentStep
            selected={worldType}
            onSelect={setWorldType}
            onNext={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <StyleStep
            selected={styleType}
            onSelect={setStyleType}
            onNext={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 4 && (
          <div className="chat-production-split">
            <ChatStep
              characterDescription={characterData?.description || ''}
              worldType={worldType}
              styleType={styleType}
              onProduceReady={handleProduceReady}
            />

            {produceReady && (
              <ProductionStep
                characterDescription={characterData?.description || ''}
                characterRefUrls={characterData?.refUrls || []}
                worldType={worldType}
                styleType={styleType}
                brief={brief}
                shotList={shotList}
              />
            )}
          </div>
        )}

        <div className="step-nav">
          {[1, 2, 3, 4].map((step) => (
            <button
              key={step}
              className={`step-dot ${currentStep === step ? 'active' : ''} ${
                step < currentStep ? 'completed' : ''
              }`}
              onClick={() => {
                if (step < currentStep) setCurrentStep(step);
              }}
              disabled={step > currentStep}
            >
              {step < currentStep ? '✓' : step}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
