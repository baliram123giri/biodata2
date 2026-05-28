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

  // 4. Handle Company Logo
  if (field.type === "company" || field.id === "companyName") {
    if (!field.value) {
      logoUrl = undefined;
    } else {
      let rawLogo = field.logo;

      if (!rawLogo) {
        const cleanName = field.value.trim().toLowerCase();
        const popular = [
          { name: "tcs", domain: "tcs.com" },
          { name: "tata consultancy services", domain: "tcs.com" },
          { name: "infosys", domain: "infosys.com" },
          { name: "wipro", domain: "wipro.com" },
          { name: "cognizant", domain: "cognizant.com" },
          { name: "accenture", domain: "accenture.com" },
          { name: "google", domain: "google.com" },
          { name: "microsoft", domain: "microsoft.com" },
          { name: "amazon", domain: "amazon.com" },
          { name: "flipkart", domain: "flipkart.com" },
          { name: "reliance", domain: "ril.com" },
          { name: "tata motors", domain: "tatamotors.com" },
          { name: "hdfc bank", domain: "hdfcbank.com" },
          { name: "hdfc", domain: "hdfcbank.com" },
          { name: "icici bank", domain: "icicibank.com" },
          { name: "icici", domain: "icicibank.com" },
          { name: "sbi", domain: "sbi.co.in" },
          { name: "state bank of india", domain: "sbi.co.in" },
          { name: "l&t", domain: "larsentoubro.com" },
          { name: "larsen & toubro", domain: "larsentoubro.com" },
          { name: "mahindra", domain: "mahindra.com" },
          { name: "government of india", domain: "india.gov.in" },
          { name: "meta", domain: "meta.com" },
          { name: "apple", domain: "apple.com" },
          { name: "netflix", domain: "netflix.com" },
        ];
        
        const foundPopular = popular.find(p => cleanName.includes(p.name) || p.name.includes(cleanName));
        if (foundPopular) {
          rawLogo = `https://icon.horse/icon/${foundPopular.domain}`;
        }
      }

      // If not in popular list, try to fetch from the form's saved companyLogo field
      if (!rawLogo) {
        rawLogo = data.educationDetails?.find(f => f.id === "companyLogo")?.value;
        
        // Ignore stale google logo
        if (field.value.toLowerCase() !== "google" && rawLogo && rawLogo.includes("google.com")) {
          rawLogo = undefined;
        }
      }

      // If still not found, and it looks like a domain name, use it as domain
      if (!rawLogo && field.value.includes(".")) {
        const potentialDomain = field.value.replace(/https?:\/\//, "").split("/")[0].trim();
        rawLogo = `https://icon.horse/icon/${potentialDomain}`;
      }

      if (rawLogo) {
        // Proxy external URLs through our own origin to avoid CORS issues on the canvas
        logoUrl = rawLogo.startsWith("http")
          ? `/api/proxy-logo?url=${encodeURIComponent(rawLogo)}`
          : rawLogo;
      }
    }
  }

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
