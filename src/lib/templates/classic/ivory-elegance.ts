import { TemplateConfig } from "../../frame-config";

export const ivoryElegance: TemplateConfig = {
  id: "ivory-elegance",
  name: "Ivory Elegance",
  defaultPrimary: "#7A5C2F",
  defaultSecondary: "#333333",
  defaultAccent: "#B8860B",
  defaultPadding: 50,
  photo: { x: 425, y: 112, width: 106, height: 141, cornerRadius: 10 },
  frame: {
    type: "image",
    urlTemplate:
      "https://res.cloudinary.com/dhlyinfwd/image/upload/f_auto,q_100,e_tint:100:rgb:{color}/v1778071856/biodata/templetes/classic/qeas9gkg1bdzxg4vjztg.png",
    bgColor: "#FFFFF5",
  },
};
