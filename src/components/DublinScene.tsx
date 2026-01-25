import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

export const DublinScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Location reveal animation
  const locationSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  const pinDrop = interpolate(locationSpring, [0, 1], [-100, 0]);
  const pinBounce = Math.sin(frame * 0.3) * 3;

  // City name animation
  const cityOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cityScale = interpolate(frame, [20, 50], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline animation
  const taglineOpacity = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Irish flag colors animation
  const flagWidth = interpolate(frame, [30, 70], [0, 600], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Audience text reveal
  const audienceOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill className="flex flex-col items-center justify-center">
      {/* Dublin skyline silhouette (simplified) */}
      <div
        className="absolute bottom-0 w-full h-48 opacity-10"
        style={{
          background: `
            linear-gradient(to bottom, transparent 0%, #00A86B 100%)
          `,
        }}
      />

      {/* Location pin */}
      <div
        className="absolute"
        style={{
          top: "15%",
          transform: `translateY(${pinDrop + pinBounce}px)`,
        }}
      >
        <svg
          className="w-20 h-20 text-emerald-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 0C7.802 0 4 3.403 4 7.602C4 11.8 7.469 16.812 12 24C16.531 16.812 20 11.8 20 7.602C20 3.403 16.199 0 12 0ZM12 11C10.343 11 9 9.657 9 8C9 6.343 10.343 5 12 5C13.657 5 15 6.343 15 8C15 9.657 13.657 11 12 11Z" />
        </svg>
        {/* Pulse effect */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-emerald-500"
          style={{
            opacity: interpolate(frame % 30, [0, 30], [0.8, 0]),
            transform: `translate(-50%, -50%) scale(${interpolate(
              frame % 30,
              [0, 30],
              [0.5, 2]
            )})`,
          }}
        />
      </div>

      {/* City name */}
      <div
        className="text-center"
        style={{
          opacity: cityOpacity,
          transform: `scale(${cityScale})`,
        }}
      >
        <h2 className="text-9xl font-black text-white tracking-wider">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
            DUBLIN
          </span>
        </h2>
      </div>

      {/* Irish flag stripe */}
      <div
        className="flex mt-6 h-2 rounded-full overflow-hidden"
        style={{ width: flagWidth }}
      >
        <div className="flex-1 bg-green-500" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-orange-500" />
      </div>

      {/* Tagline */}
      <p
        className="mt-8 text-3xl text-gray-300 font-medium"
        style={{ opacity: taglineOpacity }}
      >
        Ireland's Tech Capital
      </p>

      {/* Target audience */}
      <div
        className="mt-12 flex flex-col items-center gap-4"
        style={{ opacity: audienceOpacity }}
      >
        <p className="text-xl text-gray-400">A Discovery Event For</p>
        <div className="flex gap-6">
          <div className="px-6 py-3 rounded-full bg-orange-500/20 border border-orange-500/40">
            <span className="text-orange-400 font-semibold text-xl">
              Creative Coders
            </span>
          </div>
          <div className="px-6 py-3 rounded-full bg-purple-500/20 border border-purple-500/40">
            <span className="text-purple-400 font-semibold text-xl">
              Filmmakers
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
