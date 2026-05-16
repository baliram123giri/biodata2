import { TemplateConfig } from "../../../frame-config";

export const ornateGrandeur: TemplateConfig = {
  id: "ornate-grandeur",
  name: "Ornate Grandeur",
  defaultPrimary: "#4B0082", // Deep Indigo/Purple
  defaultSecondary: "#2F4F4F",
  defaultAccent: "#FFD700",
  defaultPadding: 60,
  photo: { 
    x: 415, 
    y: 160, 
    width: 120, 
    height: 140, 
    cornerRadius: 0 
  },
  frame: {
    type: "custom",
    componentId: "ornate-grandeur-frame",
    bgColor: "#FDF5E6", // Old Lace
  },
};
