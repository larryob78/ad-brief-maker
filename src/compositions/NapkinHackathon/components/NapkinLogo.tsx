import { interpolate, useCurrentFrame } from "remotion";

interface NapkinLogoProps {
  size: number;
  color: string;
}

export const NapkinLogo: React.FC<NapkinLogoProps> = ({ size, color }) => {
  const frame = useCurrentFrame();

  // Subtle breathing animation
  const breathe = interpolate(
    frame % 60,
    [0, 30, 60],
    [1, 1.02, 1],
    {}
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ transform: `scale(${breathe})` }}
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#FF8C42" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer glow ring */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.3"
      />

      {/* Main circle */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="url(#logoGradient)"
        filter="url(#glow)"
      />

      {/* Napkin "N" letter stylized */}
      <path
        d="M 32 70 L 32 30 L 42 30 L 58 55 L 58 30 L 68 30 L 68 70 L 58 70 L 42 45 L 42 70 Z"
        fill="#FFFFFF"
        opacity="0.95"
      />

      {/* Decorative dots */}
      <circle cx="25" cy="50" r="3" fill="#FFFFFF" opacity="0.6" />
      <circle cx="75" cy="50" r="3" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
};
