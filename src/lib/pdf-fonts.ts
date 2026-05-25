import { Font } from '@react-pdf/renderer';

const FONT_BASE_URL = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf';

let fontsRegistered = false;

export const registerPDFFonts = () => {
  if (fontsRegistered) return;

  // Register Inter (with fallback to multiple weights)
  Font.register({
    family: 'Inter',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf', fontWeight: 700 },
    ]
  });

  // Helper for Noto Sans registration
  const registerNoto = (name: string) => {
    Font.register({
      family: `Noto Sans ${name}`,
      fonts: [
        { src: `${FONT_BASE_URL}/NotoSans${name}/NotoSans${name}-Regular.ttf`, fontWeight: 400 },
        { src: `${FONT_BASE_URL}/NotoSans${name}/NotoSans${name}-Bold.ttf`, fontWeight: 700 },
      ]
    });
  };

  registerNoto('Devanagari');
  registerNoto('Gujarati');
  registerNoto('Bengali');
  registerNoto('Tamil');
  registerNoto('Telugu');
  registerNoto('Kannada');
  registerNoto('Gurmukhi');
  registerNoto('Arabic');

  fontsRegistered = true;
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
