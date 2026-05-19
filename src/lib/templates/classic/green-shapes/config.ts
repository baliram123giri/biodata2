import { TemplateConfig } from "../../../frame-config";

export const greenShapes: TemplateConfig = {
  id: "green-shapes",
  name: "Green Shapes",
  defaultPrimary: "#076335",
  defaultSecondary: "#4A4A4A",
  defaultAccent: "#FFD700",
  defaultPadding: 90,
  defaultYPadding: 50,
  photo: {
    x: 400,
    y: 100,
    width: 120,
    height: 140,
    cornerRadius: 10
  },
  frame: {
    type: "custom",
    componentId: "green-shapes",
    bgColor: "#ffffff",
  },
};
