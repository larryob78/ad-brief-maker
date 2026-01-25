import { Composition } from "remotion";
import { HackerTime } from "./compositions/HackerTime";
import "./styles.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HackerTime"
        component={HackerTime}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
