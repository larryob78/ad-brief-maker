import { Composition } from 'remotion';
import { AdBrief } from './AdBrief';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AdBrief"
        component={AdBrief}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          headline: 'Your Amazing Product',
          description: 'Discover the future of innovation',
          callToAction: 'Shop Now',
          brandName: 'Brand',
        }}
      />
    </>
  );
};
