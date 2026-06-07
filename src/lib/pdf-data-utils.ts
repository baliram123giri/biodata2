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

  // 2. Translate Label if it hasn't been customized by the user
  const fieldKey = field.id || (field.label?.toLowerCase() === "company name" ? "companyName" : "");
  
  let isStandard = false;
  if (fieldKey) {
    for (const lang of Object.keys(translations)) {
      const langT = translations[lang];
      if (langT && (langT[fieldKey] === field.label || langT[field.id] === field.label)) {
        isStandard = true;
        break;
      }
    }
  }

  // If the label matches a standard translation in some language, translate it.
  // Otherwise, it was customized, so preserve the user's custom label.
  if (isStandard) {
    if (fieldKey && t[fieldKey]) {
      displayLabel = t[fieldKey];
    } else if (t[field.label]) {
      displayLabel = t[field.label];
    } else {
      const englishT = translations["English"];
      const key = Object.keys(englishT).find(k => englishT[k] === field.label);
      if (key && t[key]) {
        displayLabel = t[key];
      }
    }
  }

  // 3. Merge Occupations
  if (field.id === "fatherName") {
    const occ = fields.find(f => f.id === "fatherOccupation")?.value;
    if (occ) {
      const transOcc = translateDynamicOption(occ, t);
      displayValue = `${field.value} (${transOcc})`;
    }
  }
  if (field.id === "motherName") {
    const occ = fields.find(f => f.id === "motherOccupation")?.value;
    if (occ) {
      const transOcc = translateDynamicOption(occ, t);
      displayValue = `${field.value} (${transOcc})`;
    }
  }

  // 4. Handle Company Logo — read from field.logo (set by CompanyAutocomplete)
  if (field.logo && typeof field.logo === "string" && field.logo.trim()) {
    logoUrl = field.logo.trim();
  }

  // 5. Date formatting
  if (field.type === "date" && displayValue) {
    const [y, m, d] = displayValue.split("-");
    if (y && m && d) {
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      if (!isNaN(dateObj.getTime())) {
        const currentLang = Object.keys(translations).find(lang => translations[lang] === t) || "English";
        const map: Record<string, string> = {
          "English": "en",
          "हिंदी": "hi",
          "मराठी": "mr",
          "ગુજરાતી": "gu",
          "বাংলা": "bn",
          "தமிழ்": "ta",
          "తెలుగు": "te",
          "ಕನ್ನಡ": "kn",
          "ਪੰਜਾਬੀ": "pa",
          "اردو": "ur"
        };
        const locale = map[currentLang] || "en";
        const numberingSystemMap: Record<string, string> = {
          "हिंदी": "deva",
          "मराठी": "deva",
          "ગુજરાતી": "gujr",
          "বাংলা": "beng",
          "ಕನ್ನಡ": "knda",
          "ਪੰਜਾਬੀ": "guru",
          "اردو": "arabext"
        };
        const numSys = numberingSystemMap[currentLang] || "latn";
        
        displayValue = new Intl.DateTimeFormat(locale, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          numberingSystem: numSys
        } as any).format(dateObj);
      }
    }
  }

  // 5.5 Format numbers in Annual Income field
  const isAnnualIncomeField = field.id === "annualIncome" || 
                              field.label?.trim().toLowerCase() === "annual income" ||
                              field.label?.trim() === "वार्षिक आय" ||
                              field.label?.trim() === "वार्षिक उत्पन्न" ||
                              field.label?.trim() === "વાર્ષિક આવક" ||
                              field.label?.trim() === "বার্ষিক আয়" ||
                              field.label?.trim() === "ஆண்டு வருமானம்" ||
                              field.label?.trim() === "వార్షిక ఆదాయం" ||
                              field.label?.trim() === "ವಾರ್ಷಿಕ ಆದಾಯ" ||
                              field.label?.trim() === "ਸਾਲਾਨਾ ਆਮਦਨ" ||
                              field.label?.trim() === "سالانہ آمدنی";

  if (isAnnualIncomeField && displayValue) {
    displayValue = displayValue.replace(/\b\d{4,}\b/g, (match: string) => {
      const num = parseInt(match, 10);
      return new Intl.NumberFormat("en-IN").format(num);
    });
  }

  // 6. Translate options (Final Value Translation)
  displayValue = translateDynamicOption(displayValue, t, field.id);

  return {
    id: field.id,
    displayLabel,
    displayValue,
    logoUrl,
    shouldSkip: false
  };
};
