import React from 'react';
import { View, Svg, G, Path } from '@react-pdf/renderer';
import { ORNATE_SVG_PATHS } from './paths';

const A4_W = 595;
const A4_H = 842;

interface PDFRendererProps {
  primaryColor: string;
}

export const PDFRenderer: React.FC<PDFRendererProps> = ({ primaryColor }) => {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, width: A4_W, height: A4_H } as any}>
      <Svg viewBox="0 0 595 842" width={A4_W} height={A4_H} style={{ position: 'absolute', top: 0, left: 0 }}>
        <G transform="translate(0,842) scale(0.0716867,-0.06578125)">
          <Path d={ORNATE_SVG_PATHS.join(' ')} fill={primaryColor} />
        </G>
      </Svg>
    </View>
  );
};
