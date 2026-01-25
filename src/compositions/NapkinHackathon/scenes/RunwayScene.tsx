import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  OffthreadVideo,
  Img,
} from "remotion";
import { GlowingOrb } from "../components/GlowingOrb";

interface RunwaySceneProps {
  runwayVideoUrl?: string;
  accentColor: string;
  backgroundColor: string;
}

export const RunwayScene: React.FC<RunwaySceneProps> = ({
  runwayVideoUrl,
  accentColor,
  backgroundColor,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const containerScale = interpolate(frame, [0, 20], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  const containerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const borderGlow = interpolate(frame, [0, 45, 90], [0, 1, 0.7], {
    extrapolateRight: "clamp",
  });

  const labelOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateRight: "clamp",
  });

  const labelY = interpolate(frame, [20, 35], [-20, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: `linear-gradient(135deg, ${backgroundColor} 0%, #1a1a2e 100%)`,
      }}
    >
      {/* Background glow effects */}
      <GlowingOrb
        color="#7B2FF7"
        size={500}
        x={0}
        y={0}
        intensity={0.5}
        delay={0}
      />

      {/* "Powered by Runway" label */}
      <div
        style={{
          position: "absolute",
          top: 80,
          opacity: labelOpacity,
          transform: `translateY(${labelY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#7B2FF7",
            boxShadow: "0 0 20px #7B2FF7",
          }}
        />
        <span
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: "#FFFFFF",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Powered by Runway AI
        </span>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#7B2FF7",
            boxShadow: "0 0 20px #7B2FF7",
          }}
        />
      </div>

      {/* Video container with glowing border */}
      <div
        style={{
          opacity: containerOpacity,
          transform: `scale(${containerScale})`,
          width: width * 0.7,
          height: height * 0.6,
          borderRadius: 24,
          overflow: "hidden",
          position: "relative",
          boxShadow: `
            0 0 ${40 * borderGlow}px ${accentColor}40,
            0 0 ${80 * borderGlow}px #7B2FF740,
            inset 0 0 60px rgba(0,0,0,0.5)
          `,
          border: `2px solid rgba(123, 47, 247, ${0.3 + borderGlow * 0.4})`,
        }}
      >
        {runwayVideoUrl ? (
          <OffthreadVideo
            src={runwayVideoUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          /* Placeholder when no Runway video is provided */
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 50%, #1a1a2e 100%)`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* Animated AI visualization placeholder */}
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: `conic-gradient(from ${frame * 4}deg, #7B2FF7, ${accentColor}, #4ECDC4, #7B2FF7)`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0 0 60px #7B2FF760",
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  backgroundColor: "#0f0f1a",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 48 }}>🎬</span>
              </div>
            </div>
            <span
              style={{
                fontSize: 20,
                color: "#666",
                fontWeight: 500,
              }}
            >
              Add your Runway AI video
            </span>
          </div>
        )}
      </div>

      {/* Bottom caption */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          fontSize: 18,
          color: "#888",
          fontWeight: 400,
          letterSpacing: "1px",
        }}
      >
        Generate stunning visuals with AI
      </div>
    </AbsoluteFill>
  );
};
