import React from 'react';
import { Svg, Rect, Path } from '@react-pdf/renderer';

interface RoyalFrameProps {
  width?: number;
  height?: number;
  style?: any;
  hasPhoto?: boolean;
}

export const RoyalFrame = ({ 
  width = 595, 
  height = 842, 
  style, 
  hasPhoto,
  theme 
}: RoyalFrameProps & { theme?: any }) => {
  const primaryColor = theme?.primaryColor || '#800000';
  const accentColor = theme?.accentColor || '#D4AF37';

  return (
    <Svg width={width} height={height} style={style}>
      {/* Background */}
      <Rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="#fffaf7"
      />

      {/* Outer Border */}
      <Rect
        x="15"
        y="15"
        width={width - 30}
        height={height - 30}
        stroke={primaryColor}
        strokeWidth="3"
        fill="none"
        rx="12"
      />

      {/* Inner Border */}
      <Rect
        x="28"
        y="28"
        width={width - 56}
        height={height - 56}
        stroke={accentColor}
        strokeWidth="1.5"
        fill="none"
        rx="8"
      />

      {/* Decorative Corners */}
      {/* Top Left */}
      <Path
        d="M35 90 Q35 35 90 35"
        stroke={primaryColor}
        strokeWidth="4"
        fill="none"
      />

      {/* Top Right */}
      <Path
        d="M560 90 Q560 35 505 35"
        stroke={primaryColor}
        strokeWidth="4"
        fill="none"
      />

      {/* Bottom Left */}
      <Path
        d="M35 752 Q35 807 90 807"
        stroke={primaryColor}
        strokeWidth="4"
        fill="none"
      />

      {/* Bottom Right */}
      <Path
        d="M560 752 Q560 807 505 807"
        stroke={primaryColor}
        strokeWidth="4"
        fill="none"
      />

      {/* Photo Frame */}
      {hasPhoto && (
        <Rect
          x="420"
          y="110"
          width="120"
          height="150"
          stroke={primaryColor}
          strokeWidth="2"
          fill="#fff"
          rx="10"
        />
      )}
    </Svg>
  );
};
