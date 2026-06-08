import { Font } from '@react-pdf/renderer';

const FONT_BASE_URL = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf';

let fontsRegistered = false;

export const registerPDFFonts = () => {
  if (fontsRegistered) return;

  // Register Inter
  Font.register({
    family: 'Inter',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf', fontWeight: 700 },
    ]
  });

  // Register Noto Serif (default English serif)
  Font.register({
    family: 'Noto Serif',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/notoserif/v33/ga6iaw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTa32J4wsL2JAlAhZqFCjwA.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/notoserif/v33/ga6iaw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTa32J4wsL2JAlAhZT1ejwA.ttf', fontWeight: 700 },
    ]
  });

  // Register Playfair Display
  Font.register({
    family: 'Playfair Display',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf', fontWeight: 700 },
    ]
  });

  // Register Cormorant Garamond
  Font.register({
    family: 'Cormorant Garamond',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3YmX5slCNuHLi8bLeY9MK7whWMhyjYrEPjuw-NxBKL_y94.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3VmX5slCNuHLi8bLeY9MK7whWMhyjYqXdnJxe6UbKUO_yZ.ttf', fontWeight: 700 },
    ]
  });

  // Register Cinzel
  Font.register({
    family: 'Cinzel',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/cinzel/v23/8vIU7ww63mVu7gtR-kwKxNvkNOjw-tbnTYrvDE5ZdqU.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/cinzel/v23/8vIU7ww63mVu7gtR-kwKxNvkNOjw-uFmTYrvDE5ZdqU.ttf', fontWeight: 700 },
    ]
  });

  // Register Lora
  Font.register({
    family: 'Lora',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/lora/v35/0QI6MX1D_JOxE7fSWef5Pn0hTo4.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/lora/v35/0QI6MX1D_JOxE7fSWef5Pn0hTo4.ttf', fontWeight: 700 },
    ]
  });

  // Register EB Garamond
  Font.register({
    family: 'EB Garamond',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/ebgaramond/v30/SlGDmQSNjdsmc35JDF1K5E55YMjF_7DPuGi-6_RUA4V-e6yHgQ.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/ebgaramond/v30/SlGDmQSNjdsmc35JDF1K5E55YMjF_7DPuGi-6_RkBYV-e6yHgQ.ttf', fontWeight: 700 },
    ]
  });

  // Register Raleway
  Font.register({
    family: 'Raleway',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/raleway/v34/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVvaorCIPrQ.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/raleway/v34/1Ptxg8zYS_SKggPN4iEgvnHyvveLxVsEpLCIPrQ.ttf', fontWeight: 700 },
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
