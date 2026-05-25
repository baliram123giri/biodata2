import React from "react";
import { View, Svg, G, Path } from "@react-pdf/renderer";
import { SVG_PATHS } from "./paths";

const A4_W = 595;
const A4_H = 842;

export function NewGenerationPDF({ primaryColor }: { primaryColor: string }) {
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, width: A4_W, height: A4_H } as any}>
      <Svg viewBox="0 0 595 842" width={A4_W} height={A4_H} style={{ position: 'absolute', top: 0, left: 0 }}>
        <G transform="translate(0,842) scale(0.0697538,-0.06578125)">
          <Path d={SVG_PATHS.join(' ')} fill={primaryColor} />
        </G>
      </Svg>
    </View>
  );
}
