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
}: RoyalWeddingClassicFrameProps) => {
  return (
    <Image

      src="https://res.cloudinary.com/dhlyinfwd/image/upload/v1778071856/biodata/templetes/classic/qeas9gkg1bdzxg4vjztg.png"
      style={{
        ...style,
        width: width,
        height: height,

      }}
    />
  );
};