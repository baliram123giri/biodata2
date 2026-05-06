import type { BiodataFormValues } from "@/types/biodata";
import RoyalPDF from "../templates/classic/Royal/RoyalPDF";

interface BiodataPDFProps {
  data: BiodataFormValues;
  templateId?: string;
}

export const BiodataPDF = ({ data, templateId }: BiodataPDFProps) => {
  /**
   * PDF Generation Switcher
   * Currently focusing on the 'Royal' professional template.
   */
  return <RoyalPDF data={data} />;
};
