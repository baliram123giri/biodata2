import { Font } from '@react-pdf/renderer';

const FONT_BASE_URL = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf';

export const registerPDFFonts = () => {
  Font.register({
    family: 'Inter',
    src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf',
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
};

export const getPDFFontFamily = (lang: string) => {
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
