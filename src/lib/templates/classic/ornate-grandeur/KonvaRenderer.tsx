import React from 'react';
import { Group, Path, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { ORNATE_SVG_PATHS } from './paths';

interface KonvaRendererProps {
  primaryColor: string;
}

export const KonvaRenderer = React.memo(({ primaryColor }: KonvaRendererProps) => {
  // ... (transform logic)
  const [svgUrl, setSvgUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="595" height="842" viewBox="0 0 595 842">
        <g transform="translate(0,842) scale(0.0716867,-0.06578125)">
          <path d="${ORNATE_SVG_PATHS.join(' ')}" fill="${primaryColor}" />
        </g>
      </svg>
    `.trim();
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    setSvgUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [primaryColor]);

  const [image] = useImage(svgUrl || "");

  return (
    <Group id="template-frame">
      {image && (
        <KonvaImage
          image={image}
          x={0}
          y={0}
          width={595}
          height={842}
          listening={false}
        />
      )}
    </Group>
  );
});
