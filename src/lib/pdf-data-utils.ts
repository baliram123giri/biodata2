import { translations, translateDynamicOption } from "./translations";
import type { BiodataFormValues } from "@/types/biodata";

export interface ProcessedField {
  id: string;
  displayLabel: string;
  displayValue: string;
  logoUrl?: string;
  shouldSkip: boolean;
}

export const processPDFField = (
  field: any,
  fields: any[],
  data: BiodataFormValues,
  t: Record<string, string>
): ProcessedField => {
  // 1. Check if field should be skipped
  if (field.type === "hidden" || !field.value) {
    return { id: field.id, displayLabel: "", displayValue: "", shouldSkip: true };
  }

  // Skip individual occupations as they are merged into names
  if (field.id === "fatherOccupation" || field.id === "motherOccupation") {
    return { id: field.id, displayLabel: "", displayValue: "", shouldSkip: true };
  }

  let displayValue = field.value;
  let displayLabel = field.label;
  let logoUrl;

  // 2. Translate Label
  if (t[field.label]) {
    displayLabel = t[field.label];
  } else {
    const englishT = translations["English"];
    const key = Object.keys(englishT).find(k => englishT[k] === field.label);
    if (key && t[key]) {
      displayLabel = t[key];
    }
  }

  // 3. Merge Occupations
  if (field.id === "fatherName") {
    const occ = fields.find(f => f.id === "fatherOccupation")?.value;
    if (occ) displayValue = `${field.value} (${occ})`;
  }
  if (field.id === "motherName") {
    const occ = fields.find(f => f.id === "motherOccupation")?.value;
    if (occ) displayValue = `${field.value} (${occ})`;
  }

  // 4. Handle Company Logo (Disabled)
  logoUrl = undefined;

  // 5. Date formatting
  if (field.type === "date" && displayValue) {
    const [y, m, d] = displayValue.split("-");
    if (y && m && d) displayValue = `${d}/${m}/${y}`;
  }

  // 6. Translate options (Final Value Translation)
  displayValue = translateDynamicOption(displayValue, t);

  return {
    id: field.id,
    displayLabel,
    displayValue,
    logoUrl,
    shouldSkip: false
  };
};
