/**
 * Font loader for Konva canvas rendering.
 * Loads Google Fonts via the FontFace API so the canvas <Text> nodes
 * render with the exact same typeface the user selected.
 */

export interface KonvaFontDefinition {
  family: string;
  url: string;
  weight: number;
  style?: string;
}

const FONT_DEFINITIONS: KonvaFontDefinition[] = [
  // Inter
  {
    family: "Inter",
    url: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
    weight: 400,
  },
  {
    family: "Inter",
    url: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf",
    weight: 700,
  },
  // Noto Serif
  {
    family: "Noto Serif",
    url: "https://fonts.gstatic.com/s/notoserif/v33/ga6iaw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTa32J4wsL2JAlAhZqFCjwA.ttf",
    weight: 400,
  },
  {
    family: "Noto Serif",
    url: "https://fonts.gstatic.com/s/notoserif/v33/ga6iaw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTa32J4wsL2JAlAhZT1ejwA.ttf",
    weight: 700,
  },
  // Playfair Display
  {
    family: "Playfair Display",
    url: "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.ttf",
    weight: 400,
  },
  {
    family: "Playfair Display",
    url: "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf",
    weight: 700,
  },
  // Noto Sans Devanagari (for mantra)
  {
    family: "Noto Sans Devanagari",
    url: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf",
    weight: 400,
  },
  {
    family: "Noto Sans Devanagari",
    url: "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Bold.ttf",
    weight: 700,
  },
];

const loadedFonts = new Set<string>();

/**
 * Ensures the given font families are loaded and ready for canvas rendering.
 * Returns a promise that resolves once all fonts are loaded.
 */
export async function loadKonvaFonts(families: string[]): Promise<void> {
  const needed = FONT_DEFINITIONS.filter(
    (def) =>
      families.includes(def.family) &&
      !loadedFonts.has(`${def.family}-${def.weight}`)
  );

  if (needed.length === 0) return;

  const promises = needed.map(async (def) => {
    const key = `${def.family}-${def.weight}`;
    if (loadedFonts.has(key)) return;

    try {
      const fontFace = new FontFace(def.family, `url(${def.url})`, {
        weight: String(def.weight),
        style: def.style || "normal",
      });
      const loaded = await fontFace.load();
      document.fonts.add(loaded);
      loadedFonts.add(key);
    } catch (err) {
      console.warn(`Failed to load font ${def.family} (${def.weight}):`, err);
    }
  });

  await Promise.all(promises);
  // Let the browser settle the font metrics
  await document.fonts.ready;
}

/**
 * Maps the theme fontFamily key → the CSS font-family name used by Konva.
 */
export function getKonvaFontFamily(themeFontKey: string): string {
  switch (themeFontKey) {
    case "inter":
      return "Inter";
    case "playfair":
      return "Playfair Display";
    case "noto":
    default:
      return "Noto Serif";
  }
}
