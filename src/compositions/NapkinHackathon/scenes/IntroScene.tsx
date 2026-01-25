import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NapkinLogo } from "../components/NapkinLogo";
import { GlowingOrb } from "../components/GlowingOrb";

interface IntroSceneProps {
  title: string;
  subtitle: string;
  accentColor: string;
}

export const IntroScene: React.FC<IntroSceneProps> = ({
  title,
  subtitle,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });

  const titleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleY = interpolate(frame, [20, 40], [30, 0], {
    extrapolateRight: "clamp",
  });

  const subtitleOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleY = interpolate(frame, [35, 55], [20, 0], {
    extrapolateRight: "clamp",
  });

  const glowIntensity = interpolate(frame, [0, 60], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: `radial-gradient(ellipse at center, ${accentColor}15 0%, transparent 70%)`,
      }}
    >
      {/* Animated background orbs */}
      <GlowingOrb
        color={accentColor}
        size={400}
        x={-200}
        y={-150}
        intensity={glowIntensity}
        delay={0}
      />
      <GlowingOrb
        color="#4ECDC4"
        size={300}
        x={250}
        y={200}
        intensity={glowIntensity}
        delay={10}
      />

      {/* Logo */}
      <div
        style={{
          transform: `scale(${logoScale})`,
          marginBottom: 40,
        }}
      >
        <NapkinLogo size={120} color={accentColor} />
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 72,
          fontWeight: 800,
          color: "#FFFFFF",
          letterSpacing: "-2px",
          textAlign: "center",
          textShadow: `0 0 60px ${accentColor}60`,
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      <div
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          fontSize: 32,
          fontWeight: 500,
          color: accentColor,
          marginTop: 16,
          letterSpacing: "4px",
          textTransform: "uppercase",
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};
