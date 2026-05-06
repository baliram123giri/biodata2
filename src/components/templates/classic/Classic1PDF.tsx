import { Document, Page, Text, View, StyleSheet, Font, Image, Svg, Polygon, Rect, Path, Circle, Line } from '@react-pdf/renderer';
import type { BiodataFormValues } from "@/types/biodata";
import { translations, translateDynamicOption } from "@/lib/translations";
import frame from "./class1.svg"
/**
 * PDF FONT STRATEGY:
 * To avoid unstable network fetches for Inter (which frequently returns 404 on direct TTF links),
 * we use built-in professional fonts (Helvetica) as the primary engine. 
 * This ensures 100% reliability and instant PDF rendering without network dependency.
 */

// Register Fonts for Regional Support
const FONT_BASE_URL = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf';

Font.register({
  family: 'Inter',
  src: 'https://cdn.jsdelivr.net/gh/googlefonts/inter@master/docs/font-files/Inter-Regular.ttf',
});
Font.register({
  family: 'Noto Sans Devanagari',
  src: `${FONT_BASE_URL}/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf`,
});
Font.register({
  family: 'Noto Sans Gujarati',
  src: `${FONT_BASE_URL}/NotoSansGujarati/NotoSansGujarati-Regular.ttf`,
});
Font.register({
  family: 'Noto Sans Bengali',
  src: `${FONT_BASE_URL}/NotoSansBengali/NotoSansBengali-Regular.ttf`,
});
Font.register({
  family: 'Noto Sans Tamil',
  src: `${FONT_BASE_URL}/NotoSansTamil/NotoSansTamil-Regular.ttf`,
});
Font.register({
  family: 'Noto Sans Telugu',
  src: `${FONT_BASE_URL}/NotoSansTelugu/NotoSansTelugu-Regular.ttf`,
});
Font.register({
  family: 'Noto Sans Kannada',
  src: `${FONT_BASE_URL}/NotoSansKannada/NotoSansKannada-Regular.ttf`,
});
Font.register({
  family: 'Noto Sans Gurmukhi',
  src: `${FONT_BASE_URL}/NotoSansGurmukhi/NotoSansGurmukhi-Regular.ttf`,
});
Font.register({
  family: 'Noto Sans Arabic',
  src: `${FONT_BASE_URL}/NotoSansArabic/NotoSansArabic-Regular.ttf`,
});

const getFontFamily = (lang: string) => {
  switch (lang) {
    case "हिंदी":
    case "मराठी":
      return 'Noto Sans Devanagari';
    case "ગુજરાતી":
      return 'Noto Sans Gujarati';
    case "বাংলা":
      return 'Noto Sans Bengali';
    case "தமிழ்":
      return 'Noto Sans Tamil';
    case "తెలుగు":
      return 'Noto Sans Telugu';
    case "ಕನ್ನಡ":
      return 'Noto Sans Kannada';
    case "ਪੰਜਾਬੀ":
      return 'Noto Sans Gurmukhi';
    case "اردو":
      return 'Noto Sans Arabic';
    default:
      return 'Inter';
  }
};

const createStyles = (fontFamily: string) => StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: fontFamily,
    backgroundColor: '#FFFFFF',
    height: "100%"
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: "100%",
    zIndex: -1,
    objectFit: 'cover',
  },
  container: {
    position: 'relative',
    zIndex: 10,
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 85,
    display: 'flex',
    height: "100%",
    flexDirection: 'column',
  },
  header: {
    textAlign: 'center',
    marginBottom: 35,
  },
  mantra: {
    fontSize: 14,
    color: '#800000',
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Noto Sans Devanagari', // Always Devanagari for Mantra
  },
  title: {
    fontSize: 28,
    color: '#800000',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    borderBottom: '2.5pt solid #D4AF37',
    paddingBottom: 6,
    alignSelf: 'center',
    fontFamily: fontFamily,
  },
  photoContainer: {
    position: 'absolute',
    top: 160,
    right: 65,
    width: 105,
    height: 135,
    border: '3pt solid #FFFFFF',
    borderRadius: 2,
    boxShadow: '0 5pt 10pt rgba(0,0,0,0.3)',
    overflow: 'hidden',
    zIndex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#800000',
    borderBottom: '1.5pt solid #D4AF37',
    paddingBottom: 4,
    marginBottom: 12,
    width: 200,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: fontFamily,
  },
  fieldRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  label: {
    width: 110,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#800000',
    fontFamily: fontFamily,
  },
  colon: {
    width: 12,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#800000',
  },
  value: {
    flex: 1,
    fontSize: 11,
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontFamily: fontFamily,
    lineHeight: 1.4,
  },
  logo: {
    width: 14,
    height: 14,
    marginRight: 6,
  }
});

export const Classic1PDF = ({ data }: { data: BiodataFormValues }) => {
  const currentLang = data.language || "English";
  const t = translations[currentLang] || translations["English"];
  const currentFont = getFontFamily(currentLang);
  const styles = createStyles(currentFont);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const renderSection = (title: string, fields: any[]) => {
    if (!fields || fields.length === 0) return null;
    const hasVisibleFields = fields.some(f => f.type !== "hidden" && f.value);
    if (!hasVisibleFields) return null;

    return (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View>
          {fields.map((field: any) => {
            if (field.type === "hidden" || !field.value) return null;
            if (field.id === "fatherOccupation" || field.id === "motherOccupation") return null;

            let displayValue = field.value;
            let displayLabel = field.label;
            let logoUrl;

            // Translate Label if possible
            if (t[field.label]) {
              displayLabel = t[field.label];
            } else {
              // Try to find the key by matching the English value
              const englishT = translations["English"];
              const key = Object.keys(englishT).find(k => englishT[k] === field.label);
              if (key && t[key]) {
                displayLabel = t[key];
              }
            }

            // Merge Occupations
            if (field.id === "fatherName") {
              const occ = fields.find(f => f.id === "fatherOccupation")?.value;
              if (occ) displayValue = `${field.value} (${occ})`;
            }
            if (field.id === "motherName") {
              const occ = fields.find(f => f.id === "motherOccupation")?.value;
              if (occ) displayValue = `${field.value} (${occ})`;
            }

            // Handle Company Logo
            if (field.type === "company" || field.id === "companyName") {
              logoUrl = data.educationDetails?.find(f => f.id === "companyLogo")?.value;
            }

            // Date formatting
            if (field.type === "date" && displayValue) {
              const [y, m, d] = displayValue.split("-");
              if (y && m && d) displayValue = `${d}/${m}/${y}`;
            }

            // Translate options
            displayValue = translateDynamicOption(displayValue, t);

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
          {/* <Image src={frame} style={styles.background} /> */}
          <BiodataFrame style={styles.background} />
          {/* Background Frame */}



          {/* Header */}
          <View style={styles.header}>
            {data.mantra && <Text style={styles.mantra}>{data.mantra}</Text>}
            {data.title && <Text style={styles.title}>{data.title}</Text>}
          </View>
          {/* Profile Photo */}
          {data.photo && (

            <Image src={data.photo} style={{ width: '119', height: '149', borderRadius: 10, position: "absolute", left: 420, top: 110 }} />

          )}
          {/* Sections */}
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

export default Classic1PDF;

// BiodataFrame.jsx
// Compatible with @react-pdf/renderer



interface BiodataFrameProps {
  width?: number;
  height?: number;
  style?: any;
}

const BiodataFrame = ({ width = 595, height = 842, style }: BiodataFrameProps) => {
  return (
    <Svg width={width} height={height} style={style}>
      {/* Background */}
      <Rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="#fffaf7"
      />

      {/* Outer Border */}
      <Rect
        x="15"
        y="15"
        width={width - 30}
        height={height - 30}
        stroke="#8B5E3C"
        strokeWidth="3"
        fill="none"
        rx="12"
      />

      {/* Inner Border */}
      <Rect
        x="28"
        y="28"
        width={width - 56}
        height={height - 56}
        stroke="#D2B48C"
        strokeWidth="1.5"
        fill="none"
        rx="8"
      />


      {/* Decorative Corners */}
      {/* Top Left */}
      <Path
        d="
          M35 90
          Q35 35 90 35
        "
        stroke="#C08B5C"
        strokeWidth="4"
        fill="none"
      />

      {/* Top Right */}
      <Path
        d="
          M560 90
          Q560 35 505 35
        "
        stroke="#C08B5C"
        strokeWidth="4"
        fill="none"
      />

      {/* Bottom Left */}
      <Path
        d="
          M35 752
          Q35 807 90 807
        "
        stroke="#C08B5C"
        strokeWidth="4"
        fill="none"
      />

      {/* Bottom Right */}
      <Path
        d="
          M560 752
          Q560 807 505 807
        "
        stroke="#C08B5C"
        strokeWidth="4"
        fill="none"
      />

      {/* Photo Frame */}
      <Rect
        x="420"
        y="110"
        width="120"
        height="150"
        stroke="#8B5E3C"
        strokeWidth="2"
        fill="#fff"
        rx="10"
      />


    </Svg>
  );
};

