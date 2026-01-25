import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NapkinLogo } from "../components/NapkinLogo";

interface OutroSceneProps {
  title: string;
  accentColor: string;
}

export const OutroScene: React.FC<OutroSceneProps> = ({ title, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: {
      damping: 15,
      stiffness: 120,
    },
  });

  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const titleOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateRight: "clamp",
  });

  const socialOpacity = interpolate(frame, [25, 40], [0, 1], {
    extrapolateRight: "clamp",
  });

  const socialY = interpolate(frame, [25, 40], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Fade out at the end
  const fadeOut = interpolate(frame, [50, 60], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: `radial-gradient(ellipse at center, ${accentColor}10 0%, #0A0A0F 70%)`,
        opacity: fadeOut,
      }}
    >
      {/* Logo */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale})`,
        }}
      >
        <NapkinLogo size={100} color={accentColor} />
      </div>

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          fontSize: 48,
          fontWeight: 700,
          color: "#FFFFFF",
          marginTop: 30,
          letterSpacing: "-1px",
        }}
      >
        {title}
      </div>

      {/* Social handles / hashtag */}
      <div
        style={{
          opacity: socialOpacity,
          transform: `translateY(${socialY}px)`,
          marginTop: 40,
          display: "flex",
          gap: 30,
          fontSize: 20,
          fontWeight: 500,
        }}
      >
        <span style={{ color: accentColor }}>#NapkinHackathon</span>
        <span style={{ color: "#666" }}>|</span>
        <span style={{ color: "#AAAAAA" }}>napkin.ai</span>
      </div>

      {/* Runway credit */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          opacity: socialOpacity * 0.7,
          fontSize: 14,
          color: "#555",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>Made with</span>
        <span style={{ color: "#7B2FF7" }}>Remotion</span>
        <span>+</span>
        <span style={{ color: "#7B2FF7" }}>Runway</span>
      </div>
    </AbsoluteFill>
  );
};
