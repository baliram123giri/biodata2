import React from "react";
import { Svg, Path, G, Image } from "@react-pdf/renderer";
import { SVG_PATHS } from "./paths";

const A4_W = 595;
const A4_H = 842;

export function NewGenerationPDF({ primaryColor }: { primaryColor: string }) {
  return React.createElement(Svg, { style: { position: 'absolute', top: 0, left: 0, width: A4_W, height: A4_H } as any, viewBox: `0 0 ${A4_W} ${A4_H}` },
    // Background Watermark
    React.createElement(Image, { 
      src: "https://res.cloudinary.com/dhlyinfwd/image/upload/v1778844624/biodata/Stickers/God%20Signs/ganesh.png",
      style: { position: 'absolute', left: A4_W - 350, top: 350, width: 300, height: 300, opacity: 0.07 } as any
    }),
    
    // Editable SVG Paths from 1210514.svg
    // The original SVG has a transform: translate(0, 1280) scale(0.1, -0.1)
    // We then scale it to fit our 595x842 canvas (595/853 and 842/1280)
    React.createElement(G, { transform: `translate(0, 842) scale(0.06975, -0.06578)` },
      SVG_PATHS.map((d, i) => 
        React.createElement(Path, { 
          key: i,
          d: d,
          fill: primaryColor,
          stroke: "none"
        })
      )
    )
  );
}
