import { Player } from '@remotion/player';
import { AdBrief } from '../remotion/AdBrief';

interface BriefData {
  headline: string;
  description: string;
  callToAction: string;
  brandName: string;
}

interface VideoPreviewProps {
  briefData: BriefData;
}

export default function VideoPreview({ briefData }: VideoPreviewProps) {
  return (
    <div className="video-container">
      <Player
        component={AdBrief}
        inputProps={briefData}
        durationInFrames={150}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        style={{
          width: '100%',
          maxWidth: '100%',
          aspectRatio: '16 / 9',
        }}
        controls
        autoPlay
        loop
      />
    </div>
  );
}
