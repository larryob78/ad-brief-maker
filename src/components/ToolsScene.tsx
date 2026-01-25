import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

export const ToolsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title fade in
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Napkin card animation
  const napkinSpring = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const napkinScale = interpolate(napkinSpring, [0, 1], [0.5, 1]);
  const napkinOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Runway card animation
  const runwaySpring = spring({
    frame: frame - 35,
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const runwayScale = interpolate(runwaySpring, [0, 1], [0.5, 1]);
  const runwayOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Plus sign animation
  const plusOpacity = interpolate(frame, [50, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const plusRotation = interpolate(frame, [50, 80], [0, 360], {
    extrapolateRight: "clamp",
  });

  // Description fade in
  const descOpacity = interpolate(frame, [70, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center px-20">
      {/* Section title */}
      <h2
        className="text-5xl font-bold text-white mb-16"
        style={{ opacity: titleOpacity }}
      >
        Discover The Power Of
      </h2>

      {/* Tools cards */}
      <div className="flex items-center gap-12">
        {/* Napkin Card */}
        <div
          className="relative"
          style={{
            opacity: napkinOpacity,
            transform: `scale(${napkinScale})`,
          }}
        >
          <div className="w-80 h-96 rounded-3xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-sm border border-orange-500/30 p-8 flex flex-col items-center justify-center">
            {/* Napkin icon placeholder */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mb-6">
              <svg
                className="w-14 h-14 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-orange-400 mb-3">Napkin</h3>
            <p className="text-gray-300 text-center text-lg">
              Transform ideas into visual stories with AI-powered sketching
            </p>
            {/* Animated sparkles */}
            <div
              className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full"
              style={{
                opacity: Math.sin(frame * 0.3) * 0.5 + 0.5,
                boxShadow: "0 0 10px #FFD93D",
              }}
            />
          </div>
        </div>

        {/* Plus sign */}
        <div
          className="text-6xl font-bold text-purple-400"
          style={{
            opacity: plusOpacity,
            transform: `rotate(${plusRotation}deg)`,
          }}
        >
          +
        </div>

        {/* Runway Card */}
        <div
          className="relative"
          style={{
            opacity: runwayOpacity,
            transform: `scale(${runwayScale})`,
          }}
        >
          <div className="w-80 h-96 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/30 p-8 flex flex-col items-center justify-center">
            {/* Runway icon placeholder */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-6">
              <svg
                className="w-14 h-14 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-purple-400 mb-3">Runway</h3>
            <p className="text-gray-300 text-center text-lg">
              Generate stunning video content with generative AI magic
            </p>
            {/* Animated sparkles */}
            <div
              className="absolute top-4 left-4 w-3 h-3 bg-blue-400 rounded-full"
              style={{
                opacity: Math.cos(frame * 0.3) * 0.5 + 0.5,
                boxShadow: "0 0 10px #3B82F6",
              }}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <p
        className="mt-12 text-2xl text-gray-400 text-center max-w-3xl"
        style={{ opacity: descOpacity }}
      >
        Two groundbreaking tools.{" "}
        <span className="text-white font-semibold">One creative journey.</span>
      </p>
    </AbsoluteFill>
  );
};
