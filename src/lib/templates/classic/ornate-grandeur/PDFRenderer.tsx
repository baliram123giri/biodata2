import React from 'react';
import { Image } from '@react-pdf/renderer';
import { ORNATE_SVG_PATHS } from './paths';

interface PDFRendererProps {
  primaryColor: string;
}

export const PDFRenderer: React.FC<PDFRendererProps> = ({ primaryColor }) => {
  // Use base64 SVG to avoid path rendering overhead in preview
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="595" height="842" viewBox="0 0 595 842">
      <g transform="translate(0,842) scale(0.0716867,-0.06578125)">
        <path d="${ORNATE_SVG_PATHS.join(' ')}" fill="${primaryColor}" />
      </g>
    </svg>
  `.trim();
  
  // Use Buffer for server-side compatibility if needed, or just template string
  const base64Svg = typeof window !== 'undefined' 
    ? btoa(unescape(encodeURIComponent(svgString)))
    : Buffer.from(svgString).toString('base64');
  
  const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

  return (
    <Image
      src={dataUrl}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'fill',
      } as any}
    />
  );
};
