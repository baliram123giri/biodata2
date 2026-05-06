import type { BiodataFormValues } from "@/types/biodata";
import RoyalPDF from "../templates/classic/Royal/RoyalPDF";
import IvoryElegancePDF from "../templates/classic/IvoryElegance/IvoryElegancePDF";

interface BiodataPDFProps {
  data: BiodataFormValues;
  templateId?: string;
}

export const BiodataPDF = ({ data, templateId }: BiodataPDFProps) => {
  if (templateId === "ivory-elegance") {
    return <IvoryElegancePDF data={data} />;
  }
  return <RoyalPDF data={data} />;
};
