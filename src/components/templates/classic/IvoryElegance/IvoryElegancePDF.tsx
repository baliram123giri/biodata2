import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { BiodataFormValues } from "@/types/biodata";
import { translations, translateDynamicOption } from "@/lib/translations";
import { registerPDFFonts, getPDFFontFamily as getFontFamily } from "@/lib/pdf-fonts";
import { Watermark } from "@/components/pdf/Watermark";
import { RoyalWeddingClassicFrame } from "./IvoryEleganceFrame";
import { createIvoryEleganceStyles } from "./IvoryEleganceStyles";
import { processPDFField } from "@/lib/pdf-data-utils";

// Initialize fonts
registerPDFFonts();

const IvoryElegancePDF = ({ data, theme }: { data: BiodataFormValues, theme?: any }) => {
  const currentLang = data.language || "English";
  const t = translations[currentLang] || translations["English"];
  
  // Prioritize theme font, fallback to language default
  const themeFont = theme?.fontFamily === 'inter' ? 'Inter' : theme?.fontFamily === 'playfair' ? 'Playfair' : 'Noto Serif';
  const currentFont = currentLang === "English" ? themeFont : getFontFamily(currentLang);
  
  const styles = createIvoryEleganceStyles(currentFont, theme);

  const renderSection = (title: string, fields: any[]) => {
    if (!fields || fields.length === 0) return null;
    const hasValues = fields.some(f => f.value && f.type !== "hidden");
    if (!hasValues) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View>
          {fields.map((field: any) => {
            const { displayLabel, displayValue, logoUrl, shouldSkip } = processPDFField(field, fields, data, t);
            if (shouldSkip) return null;

            return (
              <View key={field.id} style={styles.fieldRow}>
                <Text style={styles.label}>{displayLabel}</Text>
                <Text style={styles.colon}>:</Text>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  {logoUrl && <Image src={logoUrl} style={styles.logo} />}
                  <Text style={styles.value}>
                    {logoUrl ? `(${displayValue})` : displayValue}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.container} >
          <RoyalWeddingClassicFrame style={styles.background} hasPhoto={!!data.photo} theme={theme} />
          <Watermark />
          <View style={styles.header}>
            {data.mantra && <Text style={styles.mantra}>{data.mantra}</Text>}
            {data.title && <Text style={styles.title}>{data.title}</Text>}
          </View>
          {data.photo && (
            <Image src={data.photo} style={{ width: '106', height: '141', borderRadius: 10, position: "absolute", left: 425, top: 112 }} />
          )}
          <View>
            {renderSection(t.personal || "Personal Details", data.personalDetails)}
            {renderSection(t.educationSec || "Education & Career", data.educationDetails)}
            {renderSection(t.family || "Family Background", data.familyDetails)}
            {renderSection(t.contact || "Contact Details", data.contactDetails)}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default IvoryElegancePDF;
