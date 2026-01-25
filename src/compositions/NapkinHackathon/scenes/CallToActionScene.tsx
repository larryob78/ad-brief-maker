import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GlowingOrb } from "../components/GlowingOrb";

interface CallToActionSceneProps {
  tagline: string;
  accentColor: string;
}

export const CallToActionScene: React.FC<CallToActionSceneProps> = ({
  tagline,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const taglineScale = spring({
    frame,
    fps,
    config: {
      damping: 10,
      stiffness: 80,
    },
  });

  const taglineOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const buttonScale = spring({
    frame: frame - 25,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });

  const buttonOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateRight: "clamp",
  });

  const dateOpacity = interpolate(frame, [40, 55], [0, 1], {
    extrapolateRight: "clamp",
  });

  const dateY = interpolate(frame, [40, 55], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Pulsing effect for CTA button
  const pulse = interpolate(
    frame % 30,
    [0, 15, 30],
    [1, 1.05, 1],
    {}
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: `radial-gradient(ellipse at center, ${accentColor}20 0%, #0A0A0F 70%)`,
      }}
    >
      {/* Background orbs */}
      <GlowingOrb
        color={accentColor}
        size={600}
        x={0}
        y={0}
        intensity={0.4}
        delay={0}
      />
      <GlowingOrb
        color="#4ECDC4"
        size={400}
        x={-300}
        y={200}
        intensity={0.3}
        delay={15}
      />
      <GlowingOrb
        color="#7B2FF7"
        size={350}
        x={350}
        y={-180}
        intensity={0.3}
        delay={10}
      />

      {/* Tagline */}
      <div
        style={{
          opacity: taglineOpacity,
          transform: `scale(${taglineScale})`,
          fontSize: 64,
          fontWeight: 800,
          color: "#FFFFFF",
          textAlign: "center",
          letterSpacing: "-2px",
          maxWidth: 900,
          lineHeight: 1.2,
          textShadow: `0 0 80px ${accentColor}50`,
        }}
      >
        {tagline}
      </div>

      {/* CTA Button */}
      <div
        style={{
          opacity: buttonOpacity,
          transform: `scale(${buttonScale * pulse})`,
          marginTop: 50,
          padding: "20px 60px",
          background: `linear-gradient(135deg, ${accentColor} 0%, #FF8C42 100%)`,
          borderRadius: 50,
          fontSize: 24,
          fontWeight: 700,
          color: "#FFFFFF",
          letterSpacing: "2px",
          textTransform: "uppercase",
          boxShadow: `
            0 10px 40px ${accentColor}60,
            0 0 60px ${accentColor}30
          `,
        }}
      >
        Register Now
      </div>

      {/* Event date */}
      <div
        style={{
          opacity: dateOpacity,
          transform: `translateY(${dateY}px)`,
          marginTop: 40,
          fontSize: 22,
          fontWeight: 500,
          color: "#AAAAAA",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span>📅</span>
        <span>January 25-26, 2026</span>
        <span style={{ color: "#555" }}>|</span>
        <span>🌐</span>
        <span>Virtual Event</span>
      </div>
    </AbsoluteFill>
  );
};
