import { AbsoluteFill, Sequence } from "remotion";
import { NapkinHackathonProps } from "./schema";
import { IntroScene } from "./scenes/IntroScene";
import { RunwayScene } from "./scenes/RunwayScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { CallToActionScene } from "./scenes/CallToActionScene";
import { OutroScene } from "./scenes/OutroScene";

export const NapkinHackathon: React.FC<NapkinHackathonProps> = ({
  title,
  subtitle,
  tagline,
  runwayVideoUrl,
  accentColor,
  backgroundColor,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Intro Scene: 0-90 frames (3 seconds) */}
      <Sequence from={0} durationInFrames={90}>
        <IntroScene
          title={title}
          subtitle={subtitle}
          accentColor={accentColor}
        />
      </Sequence>

      {/* Runway AI Video Scene: 90-180 frames (3 seconds) */}
      <Sequence from={90} durationInFrames={90}>
        <RunwayScene
          runwayVideoUrl={runwayVideoUrl}
          accentColor={accentColor}
          backgroundColor={backgroundColor}
        />
      </Sequence>

      {/* Features Scene: 180-300 frames (4 seconds) */}
      <Sequence from={180} durationInFrames={120}>
        <FeaturesScene accentColor={accentColor} />
      </Sequence>

      {/* Call to Action Scene: 300-390 frames (3 seconds) */}
      <Sequence from={300} durationInFrames={90}>
        <CallToActionScene tagline={tagline} accentColor={accentColor} />
      </Sequence>

      {/* Outro Scene: 390-450 frames (2 seconds) */}
      <Sequence from={390} durationInFrames={60}>
        <OutroScene title={title} accentColor={accentColor} />
      </Sequence>
    </AbsoluteFill>
  );
};
