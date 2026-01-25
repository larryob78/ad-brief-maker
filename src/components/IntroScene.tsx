import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title animation
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const titleY = interpolate(titleSpring, [0, 1], [100, 0]);
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtitle animation
  const subtitleOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [25, 45], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glitch effect
  const glitchOffset = Math.sin(frame * 0.5) * (frame > 50 && frame < 60 ? 3 : 0);

  // Terminal cursor blink
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center">
      {/* Code bracket decorations */}
      <div
        className="absolute text-9xl font-mono text-purple-500/20"
        style={{
          left: "10%",
          top: "30%",
          transform: `translateX(${interpolate(frame, [0, 30], [-50, 0], {
            extrapolateRight: "clamp",
          })}px)`,
        }}
      >
        {"<"}
      </div>
      <div
        className="absolute text-9xl font-mono text-orange-500/20"
        style={{
          right: "10%",
          top: "30%",
          transform: `translateX(${interpolate(frame, [0, 30], [50, 0], {
            extrapolateRight: "clamp",
          })}px)`,
        }}
      >
        {"/>"}
      </div>

      {/* Main title */}
      <div
        className="relative"
        style={{
          transform: `translateY(${titleY}px) translateX(${glitchOffset}px)`,
          opacity: titleOpacity,
        }}
      >
        <h1 className="text-8xl font-black text-white tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-500 to-emerald-500">
            HACKER
          </span>
        </h1>
        <h1 className="text-8xl font-black text-white tracking-tight -mt-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-purple-500 to-orange-500">
            TIME
          </span>
          <span
            className="text-purple-400 font-mono"
            style={{ opacity: cursorVisible ? 1 : 0 }}
          >
            _
          </span>
        </h1>
      </div>

      {/* Subtitle */}
      <div
        className="mt-8 text-center"
        style={{
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
        }}
      >
        <p className="text-2xl text-gray-300 font-medium">
          Where{" "}
          <span className="text-orange-400 font-semibold">Creative Coders</span>{" "}
          Meet{" "}
          <span className="text-purple-400 font-semibold">Filmmakers</span>
        </p>
      </div>

      {/* Animated underline */}
      <div
        className="mt-6 h-1 bg-gradient-to-r from-orange-500 via-purple-500 to-emerald-500 rounded-full"
        style={{
          width: interpolate(frame, [40, 70], [0, 400], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </AbsoluteFill>
  );
};
