"use client";

import React from "react";
import { Group, Path, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { SVG_PATHS } from "./paths";

export const NewGenerationKonva = React.memo(({ primaryColor }: { primaryColor: string }) => {
  const [ganeshaImg] = useImage("https://res.cloudinary.com/dhlyinfwd/image/upload/v1778844624/biodata/Stickers/God%20Signs/ganesh.png");

  const [svgUrl, setSvgUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="590" height="842" viewBox="0 0 595 842">
        <g transform="translate(0,842) scale(0.0697538,-0.06578125)">
          <path d="${SVG_PATHS.join(' ')}" fill="${primaryColor}" />
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
    <Group>
      {/* Background Watermark (Ganesha) */}
      {ganeshaImg && (
        <KonvaImage
          image={ganeshaImg}
          x={595 - 380}
          y={250}
          width={300}
          height={300}
          opacity={0.07}
        />
      )}

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
