import { TemplateConfig } from "../../frame-config";

export const royal: TemplateConfig = {
  id: "royal",
  name: "Royal Gold",
  defaultPrimary: "#800000",
  defaultSecondary: "#333333",
  defaultAccent: "#D4AF37",
  defaultPadding: 45,
  photo: { x: 420, y: 110, width: 119, height: 149, cornerRadius: 10 },
  frame: {
    type: "svg",
    bgColor: "#fffaf7",
    outerInset: 15,
    outerStrokeWidth: 3,
    outerCornerRadius: 12,
    innerInset: 28,
    innerStrokeWidth: 1.5,
    innerCornerRadius: 8,
    hasCornerCurves: true,
  },
};
