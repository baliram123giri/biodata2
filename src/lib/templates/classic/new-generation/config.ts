import { TemplateConfig } from "../../../frame-config";

export const newGeneration: TemplateConfig = {
  id: "new-generation",
  name: "New Generation",
  defaultPrimary: "#8B0000",
  defaultSecondary: "#4A4A4A",
  defaultAccent: "#FFD700",
  defaultPadding: 60,
  photo: {
    x: 400,
    y: 100,
    width: 120,
    height: 140,
    cornerRadius: 10
  },
  frame: {
    type: "custom",
    componentId: "new-generation-arch",
    bgColor: "#FFF5EE",
  },
};
