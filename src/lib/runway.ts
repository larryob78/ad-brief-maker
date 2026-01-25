/**
 * Runway AI Integration Utilities
 *
 * This module provides helpers for integrating Runway AI-generated videos
 * into your Remotion compositions.
 *
 * Usage:
 * 1. Generate a video using Runway's Gen-3 Alpha or other models
 * 2. Download the video or get a direct URL
 * 3. Pass the URL to your composition's runwayVideoUrl prop
 *
 * For the Napkin Hackathon video, consider generating:
 * - Abstract AI/tech visualizations
 * - Dynamic particle effects
 * - Futuristic city/tech landscapes
 * - Code/data flowing animations
 */

export interface RunwayVideoConfig {
  /** The URL to the Runway-generated video file */
  url: string;
  /** Optional start time in seconds to trim the video */
  startFrom?: number;
  /** Optional end time in seconds to trim the video */
  endAt?: number;
  /** Playback rate (1 = normal, 0.5 = half speed, 2 = double speed) */
  playbackRate?: number;
}

/**
 * Suggested Runway prompts for hackathon-themed videos:
 */
export const SUGGESTED_RUNWAY_PROMPTS = [
  // Tech/Innovation themes
  "Abstract visualization of neural networks and AI, glowing nodes connected by light beams, dark background with vibrant neon colors, cinematic",

  // Hackathon energy
  "Time-lapse of code being written on multiple screens, matrix-style falling code, dramatic lighting, futuristic atmosphere",

  // Creativity/Building
  "Hands building something out of light and particles, magical construction, ethereal glow, innovation concept",

  // Community/Collaboration
  "Multiple light streams converging into one bright point, representing collaboration, cosmic space background",

  // Future/Vision
  "Flying through a futuristic cityscape made of code and light, cyberpunk aesthetic, smooth camera movement",
];

/**
 * Validates a Runway video URL
 */
export function isValidVideoUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    const validExtensions = ['.mp4', '.webm', '.mov'];
    const hasValidExtension = validExtensions.some(ext =>
      parsed.pathname.toLowerCase().endsWith(ext)
    );

    // Also accept Runway's CDN URLs
    const isRunwayCdn = parsed.hostname.includes('runway') ||
                        parsed.hostname.includes('runwayml');

    return hasValidExtension || isRunwayCdn;
  } catch {
    return false;
  }
}

/**
 * Example video sources for testing (replace with actual Runway videos)
 */
export const PLACEHOLDER_VIDEOS = {
  abstract: "https://example.com/runway-abstract.mp4",
  tech: "https://example.com/runway-tech.mp4",
  particles: "https://example.com/runway-particles.mp4",
};
