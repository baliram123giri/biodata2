import type { BiodataFormValues } from "@/types/biodata";
import Classic1PDF from "../templates/classic/Classic1PDF";

interface BiodataPDFProps {
  data: BiodataFormValues;
  templateId?: string;
}

export const BiodataPDF = ({ data, templateId }: BiodataPDFProps) => {
  /**
   * PDF Generation Switcher
   * Currently focusing on Classic 1 as the primary professional template.
   */
  return <Classic1PDF data={data} />;
};
