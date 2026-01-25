import { interpolate, useCurrentFrame } from "remotion";

interface GlowingOrbProps {
  color: string;
  size: number;
  x: number;
  y: number;
  intensity: number;
  delay?: number;
}

export const GlowingOrb: React.FC<GlowingOrbProps> = ({
  color,
  size,
  x,
  y,
  intensity,
  delay = 0,
}) => {
  const frame = useCurrentFrame();

  // Floating animation
  const floatY = interpolate(
    (frame + delay) % 120,
    [0, 60, 120],
    [0, -15, 0],
    {}
  );

  const floatX = interpolate(
    (frame + delay + 30) % 90,
    [0, 45, 90],
    [0, 10, 0],
    {}
  );

  // Pulsing glow
  const pulse = interpolate(
    (frame + delay) % 60,
    [0, 30, 60],
    [0.8, 1.2, 0.8],
    {}
  );

  // Fade in based on intensity prop
  const opacity = intensity * 0.4;

  return (
    <div
      style={{
        position: "absolute",
        left: `calc(50% + ${x + floatX}px)`,
        top: `calc(50% + ${y + floatY}px)`,
        transform: "translate(-50%, -50%)",
        width: size * pulse,
        height: size * pulse,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
        filter: `blur(${size * 0.15}px)`,
        pointerEvents: "none",
      }}
    />
  );
};
