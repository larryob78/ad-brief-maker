import { Composition } from "remotion";
import { NapkinHackathon } from "./compositions/NapkinHackathon";
import { NapkinHackathonSchema } from "./compositions/NapkinHackathon/schema";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="NapkinHackathon"
        component={NapkinHackathon}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        schema={NapkinHackathonSchema}
        defaultProps={{
          title: "Napkin Hackathon",
          subtitle: "January 2026",
          tagline: "Build the Future with AI",
          runwayVideoUrl: "",
          accentColor: "#FF6B35",
          backgroundColor: "#0A0A0F",
        }}
      />
      <Composition
        id="NapkinHackathon-Vertical"
        component={NapkinHackathon}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
        schema={NapkinHackathonSchema}
        defaultProps={{
          title: "Napkin Hackathon",
          subtitle: "January 2026",
          tagline: "Build the Future with AI",
          runwayVideoUrl: "",
          accentColor: "#FF6B35",
          backgroundColor: "#0A0A0F",
        }}
      />
    </>
  );
};
