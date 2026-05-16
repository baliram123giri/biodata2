"use client";

import React from "react";
import { Group, Path, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { SVG_PATHS } from "./paths";

export function NewGenerationKonva({ primaryColor }: { primaryColor: string }) {
  const [ganeshaImg] = useImage("https://res.cloudinary.com/dhlyinfwd/image/upload/v1778844624/biodata/Stickers/God%20Signs/ganesh.png", "anonymous");
  
  return (
    <Group>
      {/* Background Watermark (Ganesha) */}
      {ganeshaImg && (
        <KonvaImage 
          image={ganeshaImg} 
          x={595 - 350} 
          y={350} 
          width={300} 
          height={300} 
          opacity={0.07} 
        />
      )}

      {/* Editable SVG Paths from 1210514.svg */}
      {/* The original SVG has a transform: translate(0, 1280) scale(0.1, -0.1) */}
      {/* We then scale it to fit our 595x842 canvas (595/853 and 842/1280) */}
      <Group 
        scaleX={0.06975} 
        scaleY={-0.06578} 
        y={842}
      >
        {SVG_PATHS.map((d, i) => (
          <Path 
            key={i}
            data={d}
            fill={primaryColor}
            stroke="none"
          />
        ))}
      </Group>
    </Group>
  );
}
