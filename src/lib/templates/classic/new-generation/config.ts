import { TemplateConfig } from "../../../frame-config";

export const newGeneration: TemplateConfig = {
  id: "new-generation",
  name: "New Generation",
  defaultPrimary: "#8B0000",
  defaultSecondary: "#4A4A4A",
  defaultAccent: "#FFD700",
  defaultPadding: 60,
  photo: { 
    x: 415, 
    y: 210, 
    width: 120, 
    height: 120, 
    cornerRadius: 60 
  },
  frame: {
    type: "custom",
    componentId: "new-generation-arch",
    bgColor: "#FFF5EE",
  },
};
