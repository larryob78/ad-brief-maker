import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FeatureCard } from "../components/FeatureCard";

interface FeaturesSceneProps {
  accentColor: string;
}

const features = [
  {
    icon: "🚀",
    title: "Build Fast",
    description: "48 hours to create something amazing",
  },
  {
    icon: "🤖",
    title: "AI-Powered",
    description: "Leverage cutting-edge AI tools",
  },
  {
    icon: "🎨",
    title: "Creative Freedom",
    description: "No limits on your imagination",
  },
  {
    icon: "🏆",
    title: "Win Big",
    description: "Prizes for top innovations",
  },
];

export const FeaturesScene: React.FC<FeaturesSceneProps> = ({ accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [0, 20], [30, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(ellipse at center, #151520 0%, #0A0A0F 100%)",
        padding: 80,
      }}
    >
      {/* Section title */}
      <div
        style={{
          position: "absolute",
          top: 100,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 48,
          fontWeight: 700,
          color: "#FFFFFF",
          letterSpacing: "-1px",
        }}
      >
        Why Join the{" "}
        <span style={{ color: accentColor }}>Hackathon</span>?
      </div>

      {/* Feature cards grid */}
      <div
        style={{
          display: "flex",
          gap: 40,
          marginTop: 60,
        }}
      >
        {features.map((feature, index) => {
          const delay = 15 + index * 12;
          const cardProgress = spring({
            frame: frame - delay,
            fps,
            config: {
              damping: 15,
              stiffness: 80,
            },
          });

          const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              accentColor={accentColor}
              progress={cardProgress}
              opacity={cardOpacity}
            />
          );
        })}
      </div>

      {/* Animated underline */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          width: interpolate(frame, [60, 100], [0, 600], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          height: 3,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};
