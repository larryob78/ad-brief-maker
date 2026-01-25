import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
} from "remotion";
import { IntroScene } from "../components/IntroScene";
import { ToolsScene } from "../components/ToolsScene";
import { DublinScene } from "../components/DublinScene";
import { CallToActionScene } from "../components/CallToActionScene";

export const HackerTime: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background gradient animation
  const gradientRotation = interpolate(frame, [0, 450], [0, 360]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientRotation}deg, #0D1117 0%, #161B22 25%, #1a1a2e 50%, #16213e 75%, #0D1117 100%)`,
      }}
    >
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          transform: `translateY(${frame * 0.5}px)`,
        }}
      />

      {/* Floating particles */}
      <FloatingParticles frame={frame} />

      {/* Scene sequences */}
      <Sequence from={0} durationInFrames={100}>
        <IntroScene />
      </Sequence>

      <Sequence from={100} durationInFrames={120}>
        <ToolsScene />
      </Sequence>

      <Sequence from={220} durationInFrames={100}>
        <DublinScene />
      </Sequence>

      <Sequence from={320} durationInFrames={130}>
        <CallToActionScene />
      </Sequence>
    </AbsoluteFill>
  );
};

const FloatingParticles: React.FC<{ frame: number }> = ({ frame }) => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: (i * 137.5) % 100,
    y: (i * 73.3) % 100,
    size: 2 + (i % 4) * 2,
    speed: 0.2 + (i % 5) * 0.1,
    color: i % 3 === 0 ? "#FF6B35" : i % 3 === 1 ? "#6366F1" : "#00A86B",
  }));

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${((p.y + frame * p.speed) % 120) - 10}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: 0.6,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
        />
      ))}
    </>
  );
};
