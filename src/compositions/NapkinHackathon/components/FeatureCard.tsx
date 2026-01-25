interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  accentColor: string;
  progress: number;
  opacity: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  accentColor,
  progress,
  opacity,
}) => {
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${(1 - progress) * 30}px) scale(${0.9 + progress * 0.1})`,
        width: 280,
        padding: 32,
        background: "linear-gradient(145deg, #1a1a25 0%, #12121a 100%)",
        borderRadius: 20,
        border: "1px solid #2a2a35",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        boxShadow: `
          0 10px 40px rgba(0,0,0,0.4),
          inset 0 1px 0 rgba(255,255,255,0.05)
        `,
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: 48,
          marginBottom: 20,
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#FFFFFF",
          marginBottom: 12,
        }}
      >
        {title}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 400,
          color: "#888888",
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>

      {/* Accent line at bottom */}
      <div
        style={{
          width: 50,
          height: 3,
          background: `linear-gradient(90deg, ${accentColor}, #FF8C42)`,
          borderRadius: 2,
          marginTop: 24,
          opacity: progress,
        }}
      />
    </div>
  );
};
