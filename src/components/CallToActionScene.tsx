import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

export const CallToActionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Main CTA animation
  const ctaSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const ctaScale = interpolate(ctaSpring, [0, 1], [0.5, 1]);
  const ctaOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Button pulse animation
  const buttonPulse = 1 + Math.sin(frame * 0.15) * 0.05;

  // Details fade in
  const detailsOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Logos animation
  const logosOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Final tagline
  const taglineOpacity = interpolate(frame, [80, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glowing effect
  const glowIntensity = interpolate(
    Math.sin(frame * 0.1),
    [-1, 1],
    [20, 40]
  );

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center">
      {/* Background glow */}
      <div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)`,
          filter: `blur(${glowIntensity}px)`,
        }}
      />

      {/* Main CTA */}
      <div
        className="text-center z-10"
        style={{
          opacity: ctaOpacity,
          transform: `scale(${ctaScale})`,
        }}
      >
        <h2 className="text-7xl font-black text-white mb-4">JOIN US</h2>
        <p className="text-3xl text-gray-300">For An Evening Of</p>
        <p className="text-5xl font-bold mt-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-400 to-emerald-400">
            Discovery & Creation
          </span>
        </p>
      </div>

      {/* Event details */}
      <div
        className="mt-12 flex gap-8 z-10"
        style={{ opacity: detailsOpacity }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <span className="text-xl text-gray-300">Dublin, Ireland</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <span className="text-xl text-gray-300">Coders & Filmmakers</span>
        </div>
      </div>

      {/* Tool logos */}
      <div
        className="mt-10 flex items-center gap-6 z-10"
        style={{ opacity: logosOpacity }}
      >
        <span className="text-gray-500">Featuring</span>
        <div className="px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
          <span className="text-orange-400 font-bold">Napkin</span>
        </div>
        <span className="text-gray-500">×</span>
        <div className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
          <span className="text-purple-400 font-bold">Runway</span>
        </div>
      </div>

      {/* CTA Button */}
      <div
        className="mt-10 z-10"
        style={{
          opacity: detailsOpacity,
          transform: `scale(${buttonPulse})`,
        }}
      >
        <div
          className="px-12 py-5 rounded-full font-bold text-2xl text-white cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #FF6B35, #6366F1, #00A86B)",
            boxShadow: `0 0 ${glowIntensity}px rgba(99, 102, 241, 0.5)`,
          }}
        >
          REGISTER NOW
        </div>
      </div>

      {/* Final tagline */}
      <p
        className="mt-8 text-xl text-gray-400 z-10"
        style={{ opacity: taglineOpacity }}
      >
        <span className="font-mono text-purple-400">&lt;</span>
        Hack. Create. Discover.
        <span className="font-mono text-purple-400">/&gt;</span>
      </p>

      {/* Event branding */}
      <div
        className="absolute bottom-10 flex items-center gap-2 z-10"
        style={{ opacity: taglineOpacity }}
      >
        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">
          HACKER TIME
        </span>
        <span className="text-2xl text-emerald-400 font-mono">_</span>
        <span className="text-xl text-gray-500">Dublin</span>
      </div>
    </AbsoluteFill>
  );
};
