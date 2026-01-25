import { useState } from 'react';

interface BriefData {
  headline: string;
  description: string;
  callToAction: string;
  brandName: string;
}

interface ClaudePanelProps {
  briefData: BriefData;
  onUpdate: (data: BriefData) => void;
}

export default function ClaudePanel({ briefData, onUpdate }: ClaudePanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (field: keyof BriefData, value: string) => {
    onUpdate({ ...briefData, [field]: value });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation - replace with actual Claude API call
    setTimeout(() => {
      onUpdate({
        headline: 'Transform Your World Today',
        description: 'Experience innovation like never before with our cutting-edge solution that redefines what\'s possible.',
        callToAction: 'Get Started Free',
        brandName: briefData.brandName || 'YourBrand',
      });
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="claude-container">
      <div className="input-group">
        <label htmlFor="brandName">Brand Name</label>
        <input
          id="brandName"
          type="text"
          value={briefData.brandName}
          onChange={(e) => handleChange('brandName', e.target.value)}
          placeholder="Enter your brand name"
        />
      </div>

      <div className="input-group">
        <label htmlFor="headline">Headline</label>
        <input
          id="headline"
          type="text"
          value={briefData.headline}
          onChange={(e) => handleChange('headline', e.target.value)}
          placeholder="Main headline for your ad"
        />
      </div>

      <div className="input-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={briefData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe your product or service"
        />
      </div>

      <div className="input-group">
        <label htmlFor="cta">Call to Action</label>
        <input
          id="cta"
          type="text"
          value={briefData.callToAction}
          onChange={(e) => handleChange('callToAction', e.target.value)}
          placeholder="e.g., Shop Now, Learn More"
        />
      </div>

      <button
        className="generate-btn"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate with AI'}
      </button>
    </div>
  );
}
