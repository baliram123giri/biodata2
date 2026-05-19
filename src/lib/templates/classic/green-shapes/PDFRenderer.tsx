import React from "react";
import { View, Svg, Path, G, Defs, LinearGradient, Stop } from "@react-pdf/renderer";

const A4_W = 595;
const A4_H = 842;

export function GreenShapesPDF({ primaryColor }: { primaryColor: string }) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' } as any}>
      <Svg viewBox="0 0 3572 5051" width={A4_W} height={A4_H} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <LinearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={primaryColor} stopOpacity={1} />
            <Stop offset="1" stopColor={primaryColor} stopOpacity={0.53} />
          </LinearGradient>
          <LinearGradient id="g2" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0" stopColor={primaryColor} stopOpacity={1} />
            <Stop offset="1" stopColor={primaryColor} stopOpacity={0.53} />
          </LinearGradient>
        </Defs>
        <G>
          <Path fill="url('#g1')" d="m1107-0.4c-54.83 159.3-206.02 273.76-383.94 273.76-94.44 0-181.35-32.25-250.32-86.34-5.06 134.32-78.47 251.15-186.44 316.72 114.01 93.75 186.73 235.88 186.73 395 0 269.36-208.38 490.05-472.72 509.68v-1408.82z"/>
          <Path fill="none" stroke={primaryColor} strokeWidth={10} d="m179 1641.5v3230.75h1968"/>
          <Path fill="url('#g2')" d="m2465.3 5050.94c54.83-159.31 206.01-273.76 383.94-273.76 94.44 0 181.35 32.25 250.31 86.33 5.07-134.32 78.47-251.15 186.44-316.72-114.01-93.74-186.72-235.87-186.72-394.99 0-269.36 208.37-490.05 472.72-509.68v1408.82z"/>
          <Path fill="none" stroke={primaryColor} strokeWidth={10} d="m3393.3 3409.04v-3230.75h-1968"/>
        </G>
      </Svg>
    </View>
  );
}
