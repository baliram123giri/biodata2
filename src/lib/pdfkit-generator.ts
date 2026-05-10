/**
 * Pixel-Perfect Server-Side PDF Generator with Auto-Scaling.
 * 
 * Replicates the KonvaPreview.tsx layout engine and automatically adjusts 
 * font size to ensure all content fits on a single page.
 */
import React from 'react';
import { Font, renderToBuffer, Document, Page, View, Text, Image, StyleSheet, Svg, Path, G, Rect } from '@react-pdf/renderer';
import { getPDFFontFamily } from './pdf-fonts';
import { translations } from './translations';
import { processPDFField } from './pdf-data-utils';
import { getTemplateConfig, getFrameImageUrl } from './frame-config';
import { STICKER_ASSETS } from './sticker-assets';

const A4_W = 595;
const A4_H = 842;
const FONT_BASE_URL = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@master/hinted/ttf';

// ── FONT REGISTRATION ──────────────────────────────────────────────
const registerFonts = () => {
  Font.register({
    family: 'Inter',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf', fontWeight: 700 },
    ]
  });
  Font.register({
    family: 'Playfair',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.ttf', fontWeight: 400 },
      { src: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf', fontWeight: 700 },
    ]
  });

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
};

registerFonts();

// ── EXACT LAYOUT COMPONENT ──────────────────────────────────────────
const ExactBiodataPDF = ({ data, templateId, theme }: any) => {
  const config = getTemplateConfig(templateId);
  const primary = theme.selectedPaletteName === null ? config.defaultPrimary : theme.primaryColor;
  const secondary = theme.selectedPaletteName === null ? config.defaultSecondary : theme.secondaryColor;
  const padding = theme.padding ?? config.defaultPadding;
  const initialFontSize = theme.fontSize || 11;

  const currentLang = data.language || "English";
  const t = translations[currentLang] || translations["English"];
  const fontFamily = currentLang === "English" ? (theme.fontFamily === 'inter' ? 'Inter' : theme.fontFamily === 'playfair' ? 'Playfair' : 'Noto Serif') : getPDFFontFamily(currentLang);

  // ── Layout Algorithm (with Dynamic Scaling) ────────────────────
  const calculateLayout = (fSize: number) => {
    let cursorY = padding;
    const headerItems: any[] = [];
    if (data.mantra) {
      headerItems.push({ type: 'mantra', text: data.mantra, y: cursorY, fontSize: 14, font: 'Noto Sans Devanagari' });
      cursorY += 22;
    }
    if (data.title) {
      headerItems.push({ type: 'title', text: data.title.toUpperCase(), y: cursorY, fontSize: Math.round(fSize * 2.2), font: fontFamily });
      cursorY += Math.round(fSize * 2.2) + 14;
    }
    cursorY += 20;

    const sectionLayouts: any[] = [];
    const sectionKeys = [
      { key: 'personal', fields: data.personalDetails, label: t.personal || "Personal Details" },
      { key: 'educationSec', fields: data.educationDetails, label: t.educationSec || "Education & Career" },
      { key: 'family', fields: data.familyDetails, label: t.family || "Family Background" },
      { key: 'contact', fields: data.contactDetails, label: t.contact || "Contact Details" }
    ];

    for (const sec of sectionKeys) {
      const fields = sec.fields?.map((f: any) => processPDFField(f, sec.fields, data, t)).filter((f: any) => !f.shouldSkip) || [];
      if (fields.length === 0) continue;

      const titleY = cursorY;
      cursorY += Math.round(fSize * 1.4) + 14;
      const fieldRows: any[] = [];

      for (const f of fields) {
        const fieldY = cursorY;
        fieldRows.push({ ...f, y: fieldY });
        const estimatedLines = Math.ceil((f.displayValue.length * fSize * 0.5) / (A4_W - padding*2 - 145));
        cursorY += Math.max(fSize * 1.5 * estimatedLines, fSize * 1.5) + 4;
      }
      sectionLayouts.push({ title: sec.label, titleY, fields: fieldRows });
      cursorY += 10;
    }
    return { headerItems, sectionLayouts, totalHeight: cursorY };
  };

  // Find optimal font size to fit on one page
  let currentFontSize = initialFontSize;
  let layout = calculateLayout(currentFontSize);
  const MAX_Y = A4_H - padding - 20;

  // Reduce font size if content exceeds page height
  while (layout.totalHeight > MAX_Y && currentFontSize > 7) {
    currentFontSize -= 0.5;
    layout = calculateLayout(currentFontSize);
  }

  const styles = StyleSheet.create({
    page: { backgroundColor: config.frame.bgColor, padding: 0 },
    container: { position: 'absolute', top: 0, left: 0, width: A4_W, height: A4_H },
    frame: { position: 'absolute', top: 0, left: 0, width: A4_W, height: A4_H },
    photo: { 
      position: 'absolute', 
      left: config.photo.x, 
      top: config.photo.y, 
      width: config.photo.width, 
      height: config.photo.height, 
      borderRadius: config.photo.cornerRadius,
      borderWidth: 2,
      borderColor: primary
    },
    sectionTitleBar: { 
      position: 'absolute', 
      left: padding, 
      width: 4, 
      height: Math.round(currentFontSize * 1.4) + 4, 
      backgroundColor: primary,
      borderRadius: 2
    },
    sectionTitleText: {
      position: 'absolute',
      left: padding + 10,
      fontSize: Math.round(currentFontSize * 1.4),
      fontFamily: fontFamily,
      fontWeight: 'bold',
      color: primary
    },
    label: {
      width: 130,
      fontSize: currentFontSize,
      fontFamily: fontFamily,
      fontWeight: 'bold',
      color: secondary
    },
    colon: {
      width: 15,
      fontSize: currentFontSize,
      fontFamily: fontFamily,
      color: secondary
    },
    value: {
      flex: 1,
      fontSize: currentFontSize,
      fontFamily: fontFamily,
      color: '#000000'
    },
    logo: { width: 14, height: 14, marginRight: 4 }
  });

  return React.createElement(Document, {},
    React.createElement(Page, { size: "A4", style: styles.page as any },
      React.createElement(View, { style: styles.container as any, wrap: false },
        config.frame.type === 'image' ? 
          React.createElement(Image, { 
            src: getFrameImageUrl(config.frame, primary), 
            style: styles.frame as any 
          })
        : 
          React.createElement(Svg, { style: styles.frame as any, viewBox: `0 0 ${A4_W} ${A4_H}` },
            React.createElement(Rect, { width: A4_W, height: A4_H, fill: config.frame.bgColor }),
            React.createElement(Rect, { 
              x: config.frame.outerInset, 
              y: config.frame.outerInset, 
              width: A4_W - config.frame.outerInset * 2, 
              height: A4_H - config.frame.outerInset * 2, 
              stroke: primary, 
              strokeWidth: config.frame.outerStrokeWidth,
              rx: config.frame.outerCornerRadius 
            }),
            React.createElement(Rect, { 
              x: config.frame.innerInset, 
              y: config.frame.innerInset, 
              width: A4_W - config.frame.innerInset * 2, 
              height: A4_H - config.frame.innerInset * 2, 
              stroke: primary, 
              strokeWidth: config.frame.innerStrokeWidth,
              rx: config.frame.innerCornerRadius 
            }),
            config.frame.hasCornerCurves && React.createElement(G, {},
              // Top-Left
              React.createElement(Path, { 
                d: `M ${config.frame.outerInset},${config.frame.outerInset + 30} Q ${config.frame.outerInset},${config.frame.outerInset} ${config.frame.outerInset + 30},${config.frame.outerInset}`,
                stroke: primary,
                strokeWidth: config.frame.outerStrokeWidth
              }),
              // Top-Right
              React.createElement(Path, { 
                d: `M ${A4_W - config.frame.outerInset - 30},${config.frame.outerInset} Q ${A4_W - config.frame.outerInset},${config.frame.outerInset} ${A4_W - config.frame.outerInset},${config.frame.outerInset + 30}`,
                stroke: primary,
                strokeWidth: config.frame.outerStrokeWidth
              }),
              // Bottom-Left
              React.createElement(Path, { 
                d: `M ${config.frame.outerInset},${A4_H - config.frame.outerInset - 30} Q ${config.frame.outerInset},${A4_H - config.frame.outerInset} ${config.frame.outerInset + 30},${A4_H - config.frame.outerInset}`,
                stroke: primary,
                strokeWidth: config.frame.outerStrokeWidth
              }),
              // Bottom-Right
              React.createElement(Path, { 
                d: `M ${A4_W - config.frame.outerInset - 30},${A4_H - config.frame.outerInset} Q ${A4_W - config.frame.outerInset},${A4_H - config.frame.outerInset} ${A4_W - config.frame.outerInset},${A4_H - config.frame.outerInset - 30}`,
                stroke: primary,
                strokeWidth: config.frame.outerStrokeWidth
              })
            )
          ),
        layout.headerItems.map((item, i) => React.createElement(Text, {
          key: i,
          style: {
            position: 'absolute',
            top: item.y,
            left: padding + 40,
            width: A4_W - padding*2 - 80,
            textAlign: 'center',
            fontSize: item.fontSize,
            fontFamily: item.font,
            fontWeight: 'bold',
            color: primary,
            letterSpacing: item.type === 'title' ? 2 : 0
          } as any
        }, item.text)),
        data.photo && React.createElement(Image, { src: data.photo, style: styles.photo as any }),
        layout.sectionLayouts.map((sec, si) => React.createElement(View, { key: si, style: { position: 'absolute', top: sec.titleY, left: 0, width: A4_W } as any },
          React.createElement(View, { style: [styles.sectionTitleBar, { top: 0 }] as any }),
          React.createElement(Text, { style: [styles.sectionTitleText, { top: 2 }] as any }, sec.title),
          sec.fields.map((f: any, fi: any) => React.createElement(View, {
            key: fi,
            style: { position: 'absolute', top: (f.y - sec.titleY), left: padding + 10, flexDirection: 'row', width: A4_W - padding*2 - 10 } as any
          },
            React.createElement(Text, { style: styles.label as any }, f.displayLabel),
            React.createElement(Text, { style: styles.colon as any }, ":"),
            React.createElement(View, { style: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' } as any },
              f.logoUrl && React.createElement(Image, { src: f.logoUrl, style: styles.logo as any }),
              React.createElement(Text, { style: styles.value as any }, f.logoUrl ? `(${f.displayValue})` : f.displayValue)
            )
          ))
        )),
        (data.stickers || []).map((sticker: any, i: number) => {
          const asset = STICKER_ASSETS.find(a => a.id === sticker.type);
          if (!asset) return null;
          return React.createElement(View, {
            key: `sticker-${i}`,
            style: {
              position: 'absolute',
              left: sticker.x,
              top: sticker.y,
              width: 100 * sticker.scale,
              height: 100 * sticker.scale,
            } as any
          },
            React.createElement(Svg, { viewBox: asset.viewBox },
              React.createElement(Path, { d: asset.path, fill: primary })
            )
          );
        })
      )
    )
  );
};

export async function generatePDFBuffer(opts: any): Promise<Buffer> {
  const { formData, templateId, theme } = opts;
  try {
    const stream = await renderToBuffer(
      React.createElement(ExactBiodataPDF, { 
        data: formData, 
        templateId, 
        theme 
      }) as any
    );
    return Buffer.from(stream);
  } catch (error: any) {
    console.error("Exact PDF Render Error:", error);
    throw new Error(error?.message || "Failed to generate exact PDF");
  }
}
