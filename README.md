# Napkin Hackathon Video

A stunning promotional video for the Napkin Hackathon, built with **Remotion** and designed to showcase **Runway AI** generated content.

## Features

- **5 Dynamic Scenes**: Intro, Runway AI showcase, Features, Call-to-Action, and Outro
- **Runway AI Integration**: Seamlessly embed AI-generated videos from Runway
- **Smooth Animations**: Spring physics and interpolated transitions
- **Customizable**: Easy to modify colors, text, and timing
- **Multiple Formats**: 1920x1080 (landscape) and 1080x1920 (vertical/stories)

## Quick Start

```bash
# Install dependencies
npm install

# Start Remotion Studio (preview your video)
npm start

# Render the final video
npm run build
```

## Project Structure

```
src/
├── index.ts                 # Remotion entry point
├── Root.tsx                 # Composition definitions
├── lib/
│   └── runway.ts            # Runway AI integration utilities
└── compositions/
    └── NapkinHackathon/
        ├── index.tsx        # Main composition
        ├── schema.ts        # Props schema (Zod)
        ├── scenes/
        │   ├── IntroScene.tsx
        │   ├── RunwayScene.tsx
        │   ├── FeaturesScene.tsx
        │   ├── CallToActionScene.tsx
        │   └── OutroScene.tsx
        └── components/
            ├── NapkinLogo.tsx
            ├── GlowingOrb.tsx
            └── FeatureCard.tsx
```

## Using Runway AI Videos

1. **Generate a video** on [Runway](https://runwayml.com) using Gen-3 Alpha or other models
2. **Suggested prompts** for hackathon themes:
   - *"Abstract visualization of neural networks and AI, glowing nodes connected by light beams"*
   - *"Time-lapse of code being written, matrix-style falling code, futuristic atmosphere"*
   - *"Flying through a futuristic cityscape made of code and light"*
3. **Download or get URL** of your generated video
4. **Add to the composition** by passing the URL as the `runwayVideoUrl` prop

## Customization

Edit `src/Root.tsx` to customize:

```tsx
defaultProps={{
  title: "Napkin Hackathon",
  subtitle: "January 2026",
  tagline: "Build the Future with AI",
  runwayVideoUrl: "https://your-runway-video-url.mp4",
  accentColor: "#FF6B35",
  backgroundColor: "#0A0A0F",
}}
```

## Video Specs

| Property | Value |
|----------|-------|
| Duration | 15 seconds (450 frames) |
| FPS | 30 |
| Resolution | 1920x1080 (landscape) |
| Vertical | 1080x1920 (stories) |

## Scene Breakdown

| Scene | Frames | Duration | Description |
|-------|--------|----------|-------------|
| Intro | 0-90 | 3s | Logo + title reveal with glowing orbs |
| Runway | 90-180 | 3s | AI video showcase with Runway branding |
| Features | 180-300 | 4s | Four feature cards animate in |
| CTA | 300-390 | 3s | Tagline + register button with pulse |
| Outro | 390-450 | 2s | Logo + social handles fade out |

## Scripts

```bash
npm start           # Open Remotion Studio
npm run build       # Render to out/video.mp4
npm run build:gif   # Render preview GIF
npm run render      # Custom render command
npm run upgrade     # Upgrade Remotion packages
```

## License

MIT - Built for Napkin Hackathon January 2026
