"use client";

import React from "react";
import { Group, Path, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { SVG_PATHS } from "./paths";

export const GreenShapesKonva = React.memo(({ primaryColor }: { primaryColor: string }) => {
  const [svgUrl, setSvgUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Generate dynamic SVG based on green_shapes.svg with primaryColor
    const svgString = `
<svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3572 5051" width="595" height="842">
	<defs>
		<linearGradient id="g1" x2="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(1130.298,2027.886,-2622.502,1461.723,972.021,-858.606)">
			<stop offset="0" stop-color="${primaryColor}"/>
			<stop offset=".948" stop-color="${primaryColor}88"/>
		</linearGradient>
		<linearGradient id="g2" x2="1" gradientUnits="userSpaceOnUse" gradientTransform="matrix(-1669.005,-2570.75,3502.396,-2273.857,2860.031,6187.827)">
			<stop offset="0" stop-color="${primaryColor}"/>
			<stop offset=".948" stop-color="${primaryColor}88"/>
		</linearGradient>
	</defs>
	<style>
		.s0 { fill: url(#g1) } 
		.s1 { fill: none;stroke: ${primaryColor};stroke-miterlimit:10;stroke-width: 10 } 
		.s2 { fill: url(#g2) } 
	</style>
	<g id="Layer 1">
		<g>
			<path class="s0" d="m1107-0.4c-54.83 159.3-206.02 273.76-383.94 273.76-94.44 0-181.35-32.25-250.32-86.34-5.06 134.32-78.47 251.15-186.44 316.72 114.01 93.75 186.73 235.88 186.73 395 0 269.36-208.38 490.05-472.72 509.68v-1408.82z"/>
			<path class="s1" d="m179 1641.5v3230.75h1968"/>
			<path class="s2" d="m2465.3 5050.94c54.83-159.31 206.01-273.76 383.94-273.76 94.44 0 181.35 32.25 250.31 86.33 5.07-134.32 78.47-251.15 186.44-316.72-114.01-93.74-186.72-235.87-186.72-394.99 0-269.36 208.37-490.05 472.72-509.68v1408.82z"/>
			<path class="s1" d="m3393.3 3409.04v-3230.75h-1968"/>
		</g>
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
