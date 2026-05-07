import React from 'react';
import { Image } from '@react-pdf/renderer';

interface RoyalWeddingClassicFrameProps {
  width?: number;
  height?: number;
  style?: any;
  hasPhoto?: boolean;
}

export const RoyalWeddingClassicFrame = ({
  width = 595,
  height = 842,
  style,
  theme,
}: RoyalWeddingClassicFrameProps & { theme?: any }) => {
  const color = theme?.primaryColor?.replace('#', '') || '7A5C2F';
  const tintedUrl = `https://res.cloudinary.com/dhlyinfwd/image/upload/e_tint:100:rgb:${color}/v1778071856/biodata/templetes/classic/qeas9gkg1bdzxg4vjztg.png`;

  return (
    <Image
      src={tintedUrl}
      style={{
        ...style,
        width: width,
        height: height,
      }}
    />
  );
};