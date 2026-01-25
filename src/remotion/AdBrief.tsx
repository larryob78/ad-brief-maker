import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from 'remotion';

interface AdBriefProps {
  headline: string;
  description: string;
  callToAction: string;
  brandName: string;
}

export const AdBrief: React.FC<AdBriefProps> = ({
  headline,
  description,
  callToAction,
  brandName,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Animations
  const brandOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const headlineProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 100 },
  });

  const descriptionOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const ctaScale = spring({
    frame: frame - 70,
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  // Fade out at the end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        opacity: fadeOut,
      }}
    >
      {/* Brand Name */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 80,
          opacity: brandOpacity,
          fontSize: 32,
          fontWeight: 600,
          color: '#e94560',
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '0.1em',
        }}
      >
        {brandName.toUpperCase()}
      </div>

      {/* Main Content */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: '0 120px',
        }}
      >
        {/* Headline */}
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#ffffff',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
            marginBottom: 40,
            transform: `translateY(${interpolate(headlineProgress, [0, 1], [50, 0])}px)`,
            opacity: headlineProgress,
          }}
        >
          {headline}
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: 28,
            color: '#cccccc',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.6,
            opacity: descriptionOpacity,
          }}
        >
          {description}
        </p>

        {/* CTA Button */}
        <div
          style={{
            marginTop: 60,
            transform: `scale(${ctaScale})`,
            opacity: ctaScale,
          }}
        >
          <div
            style={{
              padding: '20px 50px',
              background: '#e94560',
              borderRadius: 12,
              fontSize: 24,
              fontWeight: 600,
              color: '#ffffff',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {callToAction}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
