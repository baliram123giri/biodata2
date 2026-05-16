import React from "react";
import { Svg, Image } from "@react-pdf/renderer";
import { SVG_PATHS } from "./paths";

const A4_W = 595;
const A4_H = 842;

export function NewGenerationPDF({ primaryColor }: { primaryColor: string }) {
  // Use base64 SVG to avoid path rendering overhead
  const borderSvgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="595" height="842" viewBox="0 0 595 842">
      <g transform="translate(0,842) scale(0.0697538,-0.06578125)">
        <path d="${SVG_PATHS.join(' ')}" fill="${primaryColor}" />
      </g>
    </svg>
  `.trim();

  const base64Svg = typeof window !== 'undefined' 
    ? btoa(unescape(encodeURIComponent(borderSvgString)))
    : Buffer.from(borderSvgString).toString('base64');
  
  const borderDataUrl = `data:image/svg+xml;base64,${base64Svg}`;

  return (
    <Svg style={{ position: 'absolute', top: 0, left: 0, width: A4_W, height: A4_H } as any} viewBox={`0 0 ${A4_W} ${A4_H}`}>
      {/* Background Watermark */}
      <Image 
        src="https://res.cloudinary.com/dhlyinfwd/image/upload/v1778844624/biodata/Stickers/God%20Signs/ganesh.png"
        style={{ position: 'absolute', left: A4_W - 350, top: 350, width: 300, height: 300, opacity: 0.07 } as any}
      />
      
      {/* Editable SVG Border as Image */}
      <Image
        src={borderDataUrl}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
        } as any}
      />
    </Svg>
  );
}
