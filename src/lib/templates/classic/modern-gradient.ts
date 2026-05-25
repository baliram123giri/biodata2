import { TemplateConfig } from "../../frame-config";

export const modernGradient: TemplateConfig = {
  id: "modern-gradient",
  name: "Modern Gradient",
  defaultPrimary: "#1a365d",
  defaultSecondary: "#4a5568",
  defaultAccent: "#2b6cb0",
  defaultPadding: 45,
  photo: { x: 420, y: 110, width: 119, height: 149, cornerRadius: 15 },
  frame: {
    type: "gradient",
    bgColor: "#ffffff",
    gradientColors: ["#2A7B9B", "#57C785", "#EDDD53"],
    outerInset: 20,
    outerStrokeWidth: 4,
    outerCornerRadius: 20,
    innerInset: 35,
    innerStrokeWidth: 1,
    innerCornerRadius: 15,
  },
};
