/**
 * Pixel-Perfect Server-Side PDF Generator with Auto-Scaling.
 * 
 * Replicates the KonvaPreview.tsx layout engine and automatically adjusts 
 * font size to ensure all content fits on a single page.
 */
import React from 'react';
import { Font, renderToBuffer, Document, Page, View, Text, Image, StyleSheet, Svg, Path, G, Rect, LinearGradient, RadialGradient, Stop, Defs, Circle } from '@react-pdf/renderer';
import { getPDFFontFamily } from './pdf-fonts';
import { translations } from './translations';
import { processPDFField } from './pdf-data-utils';
import { getTemplateConfig, getFrameImageUrl } from './frame-config';
import { STICKER_ASSETS } from './sticker-assets';
import { getLightBgColor } from './color-utils';
import { WATERMARK_CONFIG, getWatermarkCoordinates } from './watermark-utils';
import path from 'path';

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
  
  Font.register({
    family: 'Noto Serif',
    fonts: [
      { src: `${FONT_BASE_URL}/NotoSerif/NotoSerif-Regular.ttf`, fontWeight: 400 },
      { src: `${FONT_BASE_URL}/NotoSerif/NotoSerif-Bold.ttf`, fontWeight: 700 },
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
function CustomPDFFrame({ componentId, primaryColor }: { componentId: string; primaryColor: string }) {
  return null;
}

const ExactBiodataPDF = ({ data, templateId, theme }: any) => {
  const config = getTemplateConfig(templateId);
  const primary = theme.primaryColor || config.defaultPrimary;
  const secondary = theme.secondaryColor || config.defaultSecondary;
  const accent = theme.accentColor || config.defaultAccent;
  const isTemplateGradient = (config.bgType === "linear" || config.bgType === "radial") && (config.bgGradientColors || []).length > 1;
  const isStaticGradient = config.frame.type === "gradient" && ((config.frame as any).gradientColors || []).length > 1;
  const hasTemplateGradient = isTemplateGradient || isStaticGradient;

  const bgColor = (theme.selectedPaletteName !== null && theme.selectedPaletteName !== undefined && (!theme.bgColors || theme.bgColors.length <= 1) && !hasTemplateGradient)
    ? getLightBgColor(primary)
    : (config.frame as any).bgColor || "#ffffff";
  const padding = theme.padding ?? config.defaultPadding;
  const paddingY = theme.paddingY !== undefined ? theme.paddingY : (config.defaultYPadding ?? padding);
  const initialFontSize = theme.fontSize || 11;

  const renderPDFBackground = () => {
    // 1. If a theme palette has a custom background gradient (length > 1), respect the palette background settings
    if (theme.selectedPaletteName !== null && theme.selectedPaletteName !== undefined && theme.bgColors && theme.bgColors.length > 1) {
      return React.createElement(Svg, { style: styles.frame as any, viewBox: `0 0 ${A4_W} ${A4_H}` },
        React.createElement(Defs, {},
          React.createElement(LinearGradient, { id: "bg-pdf-gradient", x1: 0, y1: 0, x2: 0, y2: A4_H, gradientUnits: "userSpaceOnUse" },
            theme.bgColors.map((color: string, idx: number, arr: string[]) => 
              React.createElement(Stop, { key: idx, offset: idx / (arr.length - 1), stopColor: color, stopOpacity: 1 })
            )
          )
        ),
        React.createElement(Rect, { width: A4_W, height: A4_H, fill: "url(#bg-pdf-gradient)" })
      );
    }

    // 2. Otherwise, check if the template itself has a gradient background (linear or radial)
    const bgType = config.bgType || "solid";
    const bgGradientColors = config.bgGradientColors || [];

    if ((bgType === "linear" || bgType === "radial") && bgGradientColors.length > 1) {
      if (bgType === "linear") {
        return React.createElement(Svg, { style: styles.frame as any, viewBox: `0 0 ${A4_W} ${A4_H}` },
          React.createElement(Defs, {},
            React.createElement(LinearGradient, { id: "bg-pdf-gradient", x1: 0, y1: 0, x2: 0, y2: A4_H, gradientUnits: "userSpaceOnUse" },
              bgGradientColors.map((color: string, idx: number, arr: string[]) => 
                React.createElement(Stop, { key: idx, offset: idx / (arr.length - 1), stopColor: color, stopOpacity: 1 })
              )
            )
          ),
          React.createElement(Rect, { width: A4_W, height: A4_H, fill: "url(#bg-pdf-gradient)" })
        );
      } else {
        return React.createElement(Svg, { style: styles.frame as any, viewBox: `0 0 ${A4_W} ${A4_H}` },
          React.createElement(Defs, {},
            React.createElement(RadialGradient, { id: "bg-pdf-gradient", cx: "50%", cy: "50%", r: "50%" },
              bgGradientColors.map((color: string, idx: number, arr: string[]) => 
                React.createElement(Stop, { key: idx, offset: idx / (arr.length - 1), stopColor: color, stopOpacity: 1 })
              )
            )
          ),
          React.createElement(Rect, { width: A4_W, height: A4_H, fill: "url(#bg-pdf-gradient)" })
        );
      }
    }

    // Legacy static template gradients
    if (config.frame.type === "gradient") {
      const gradColors = (config.frame as any).gradientColors || [];
      if (gradColors.length > 1) {
        return React.createElement(Svg, { style: styles.frame as any, viewBox: `0 0 ${A4_W} ${A4_H}` },
          React.createElement(Defs, {},
            React.createElement(LinearGradient, { id: "bg-pdf-gradient", x1: 0, y1: 0, x2: A4_W, y2: 0, gradientUnits: "userSpaceOnUse" },
              gradColors.map((color: string, idx: number, arr: string[]) => 
                React.createElement(Stop, { key: idx, offset: idx / (arr.length - 1), stopColor: color, stopOpacity: 1 })
              )
            )
          ),
          React.createElement(Rect, { width: A4_W, height: A4_H, fill: "url(#bg-pdf-gradient)" })
        );
      }
    }

    // 3. Fall back to solid background colors (apply solid theme fallback if active)
    if (theme.selectedPaletteName !== null && theme.selectedPaletteName !== undefined) {
      const lightBg = getLightBgColor(primary);
      return React.createElement(Svg, { style: styles.frame as any, viewBox: `0 0 ${A4_W} ${A4_H}` },
        React.createElement(Rect, { width: A4_W, height: A4_H, fill: lightBg })
      );
    }

    // 4. Default template solid background fallback
    const solidColor = (config.frame as any).bgColor || "#ffffff";
    return React.createElement(Svg, { style: styles.frame as any, viewBox: `0 0 ${A4_W} ${A4_H}` },
      React.createElement(Rect, { width: A4_W, height: A4_H, fill: solidColor })
    );
  };

  const currentLang = data.language || "English";
  const t = translations[currentLang] || translations["English"];
  const fontFamily = currentLang === "English" ? (theme.fontFamily === 'inter' ? 'Inter' : theme.fontFamily === 'playfair' ? 'Playfair' : 'Noto Serif') : getPDFFontFamily(currentLang);

  // ── Layout Algorithm (with Dynamic Scaling) ────────────────────
  const calculateLayout = (fSize: number) => {
    let cursorY = paddingY + 20;
    const headerItems: any[] = [];
    if (data.mantra) {
      headerItems.push({ type: 'mantra', text: data.mantra, y: paddingY + 10, fontSize: fSize * 1.2, font: 'Noto Sans Devanagari' });
      cursorY += fSize * 2;
    }
    if (data.title) {
      headerItems.push({ type: 'title', text: data.title, y: paddingY + 10 + (data.mantra ? fSize * 2 : 0), fontSize: fSize * 2, font: fontFamily });
      cursorY += fSize * 2.5;
    }

    const LABEL_WIDTH = 130;
    const COLON_WIDTH = 20;
    const LINE_SPACING = fSize * 0.5 + 2;
    const contentWidth = A4_W - padding * 2 - 10;
    const sectionLayouts: any[] = [];
    const sectionKeys = [
      { key: 'personal', fields: data.personalDetails, label: t.personal || "Personal Details" },
      { key: 'educationSec', fields: data.educationDetails, label: t.educationSec || "Education & Career" },
      { key: 'family', fields: data.familyDetails, label: t.family || "Family Background" },
      { key: 'contact', fields: data.contactDetails, label: t.contact || "Contact Details" }
    ];

    for (const sec of sectionKeys) {
      const fields = sec.fields?.map((f: any) => processPDFField(f, sec.fields, data, t)).filter((f: any) => !f.shouldSkip && f.displayValue && f.displayValue !== "Not Specified") || [];
      if (fields.length === 0) continue;

      const titleY = cursorY;
      cursorY += Math.round(fSize * 1.4) + LINE_SPACING + 6;
      const fieldRows: any[] = [];

      for (const f of fields) {
        const fieldY = cursorY;
        
        let rowWidth = contentWidth;
        if (data.photo && config.photo && fieldY >= config.photo.y - 15 && fieldY <= config.photo.y + config.photo.height + 15) {
           rowWidth = config.photo.x - padding - 20;
        }
        const valueW = rowWidth - LABEL_WIDTH - COLON_WIDTH;
        
        const valText = String(f.displayValue);
        const valW = valText.length * fSize * 0.6;
        const lines = Math.ceil(valW / valueW) || 1;
        const rowHeight = Math.max(fSize, lines * fSize * 1.1);

        fieldRows.push({ ...f, y: fieldY, rowWidth, valueW });
        
        cursorY += rowHeight + LINE_SPACING;
      }
      sectionLayouts.push({ title: sec.label, titleY, fields: fieldRows });
      cursorY += fSize * 1.5;
    }
    return { headerItems, sectionLayouts, totalHeight: cursorY };
  };

  // Find optimal font size to fit on one page
  let currentFontSize = initialFontSize;
  let layout = calculateLayout(currentFontSize);
  const MAX_Y = A4_H - paddingY - 20;

  // Reduce font size if content exceeds page height
  while (layout.totalHeight > MAX_Y && currentFontSize > 7) {
    currentFontSize -= 0.5;
    layout = calculateLayout(currentFontSize);
  }

  const styles = StyleSheet.create({
    page: { backgroundColor: bgColor, padding: 0, margin: 0 },
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
    photoBorder: {
      position: 'absolute',
      left: config.photo.x,
      top: config.photo.y,
      width: config.photo.width,
      height: config.photo.height,
      borderRadius: config.photo.cornerRadius,
      borderWidth: 2,
      borderColor: primary,
      backgroundColor: 'transparent'
    },
    sectionTitleBar: { 
      position: 'absolute', 
      left: padding, 
      top: 15,
      width: 5, 
      height: 3, 
      backgroundColor: theme.accentColor || primary,
      borderRadius: 1.5
    },
    sectionTitleText: {
      position: 'absolute',
      left: padding + 10,
      top: 2,
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
      color: secondary,
      lineHeight: 1.1
    },
    logo: { width: 14, height: 14, marginRight: 4 }
  });

  return React.createElement(Document, {},
    React.createElement(Page, { size: "A4", style: styles.page as any },
      React.createElement(View, { style: styles.container as any, wrap: false },
        renderPDFBackground(),
        config.bgConfig?.url && React.createElement(Image, {
          src: config.bgConfig.url,
          style: {
            position: 'absolute',
            left: config.bgConfig.x ?? 0,
            top: config.bgConfig.y ?? 0,
            width: config.bgConfig.width ?? 595,
            height: config.bgConfig.height ?? 842,
            opacity: config.bgConfig.opacity ?? 1.0,
          } as any
        }),
        config.frame.type === 'image' ? 
          React.createElement(Image, { 
            src: theme?.rasterizedFrameBase64 || (() => {
              let url = getFrameImageUrl(config.frame, primary);
              // Force PNG format by replacing f_auto with f_png and translating .svg to .png
              // to bypass the @react-pdf/renderer SVG-in-Image style stripping/black rendering bug.
              url = url.replace(/f_auto/g, 'f_png');
              if (url.toLowerCase().endsWith('.svg')) {
                url = url.substring(0, url.length - 4) + '.png';
              } else if (url.toLowerCase().includes('.svg?')) {
                url = url.replace(/\.svg\?/i, '.png?');
              }
              return url;
            })(), 
            style: [styles.frame, { objectFit: 'fill' }] as any
          })
        : config.frame.type === 'gradient' ?
          React.createElement(Svg, { style: styles.frame as any, viewBox: `0 0 ${A4_W} ${A4_H}` },
            React.createElement(Rect, { 
              x: config.frame.outerInset, 
              y: config.frame.outerInset, 
              width: A4_W - config.frame.outerInset * 2, 
              height: A4_H - config.frame.outerInset * 2, 
              stroke: primary, 
              strokeWidth: config.frame.outerStrokeWidth,
              rx: config.frame.outerCornerRadius,
              fill: "none"
            }),
            React.createElement(Rect, { 
              x: config.frame.innerInset, 
              y: config.frame.innerInset, 
              width: A4_W - config.frame.innerInset * 2, 
              height: A4_H - config.frame.innerInset * 2, 
              stroke: primary, 
              strokeWidth: config.frame.innerStrokeWidth,
              rx: config.frame.innerCornerRadius,
              strokeOpacity: 0.3,
              fill: "none"
            })
          )
        : config.frame.type === 'custom' ?
          React.createElement(View, { style: styles.frame as any },
            React.createElement(CustomPDFFrame, { componentId: config.frame.componentId, primaryColor: primary })
          )
        : 
          React.createElement(Svg, { style: styles.frame as any, viewBox: `0 0 ${A4_W} ${A4_H}` },
            React.createElement(Rect, { 
              x: config.frame.outerInset, 
              y: config.frame.outerInset, 
              width: A4_W - config.frame.outerInset * 2, 
              height: A4_H - config.frame.outerInset * 2, 
              stroke: primary, 
              strokeWidth: config.frame.outerStrokeWidth,
              rx: config.frame.outerCornerRadius,
              fill: "none"
            }),
            React.createElement(Rect, { 
              x: config.frame.innerInset, 
              y: config.frame.innerInset, 
              width: A4_W - config.frame.innerInset * 2, 
              height: A4_H - config.frame.innerInset * 2, 
              stroke: primary, 
              strokeWidth: config.frame.innerStrokeWidth,
              rx: config.frame.innerCornerRadius,
              strokeOpacity: 0.6,
              fill: "none"
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
          
        WATERMARK_CONFIG.isEnabled && React.createElement(View, {
          style: {
            position: 'absolute',
            left: (A4_W - WATERMARK_CONFIG.width) / 2,
            top: (A4_H - WATERMARK_CONFIG.height) / 2,
            width: WATERMARK_CONFIG.width,
            height: WATERMARK_CONFIG.height,
            opacity: WATERMARK_CONFIG.opacity,
            transform: `rotate(${WATERMARK_CONFIG.rotation || 0}deg)`,
          } as any
        }, React.createElement(Image, {
          src: path.join(process.cwd(), WATERMARK_CONFIG.fallbackPngPath),
          style: { width: '100%', height: '100%' } as any
        })),

        layout.headerItems.map((item, i) => React.createElement(Text, {
          key: i,
          style: {
            position: 'absolute',
            top: item.y,
            left: 0,
            width: A4_W,
            textAlign: 'center',
            fontSize: item.fontSize,
            fontFamily: item.font,
            fontWeight: 'bold',
            color: primary
          } as any
        }, item.text)),
        data.photo && React.createElement(Image, { src: data.photo, style: { ...styles.photo, borderWidth: 0 } as any }),
        data.photo && React.createElement(View, { style: styles.photoBorder as any }),
        layout.sectionLayouts.map((sec, si) => React.createElement(View, { key: si, style: { position: 'absolute', top: sec.titleY, left: 0, width: A4_W } as any },
          React.createElement(View, { style: styles.sectionTitleBar as any }),
          React.createElement(Text, { style: styles.sectionTitleText as any }, sec.title),
          sec.fields.map((f: any, fi: any) => React.createElement(View, {
            key: fi,
            style: { position: 'absolute', top: (f.y - sec.titleY), left: padding + 10, flexDirection: 'row', width: f.rowWidth - 10 } as any
          },
            React.createElement(Text, { style: styles.label as any }, f.displayLabel),
            React.createElement(Text, { style: styles.colon as any }, ":"),
            React.createElement(View, { style: { width: f.valueW, flexDirection: 'row', flexWrap: 'wrap' } as any },
              f.logoUrl && React.createElement(Image, { src: f.logoUrl, style: styles.logo as any }),
              React.createElement(Text, { style: styles.value as any }, f.logoUrl ? `(${f.displayValue})` : f.displayValue)
            )
          ))
        )),
        (data.stickers || []).map((sticker: any, i: number) => {
          const asset = STICKER_ASSETS.find(a => a.id === sticker.type);
          if (!asset) return null;
          
          const sX = sticker.scaleX ?? 1;
          const sY = sticker.scaleY ?? 1;
          
          return React.createElement(View, {
            key: `sticker-${i}`,
            style: {
              position: 'absolute',
              left: sticker.x,
              top: sticker.y,
              width: 100 * sX,
              height: 100 * sY,
              transformOrigin: 'top left',
              transform: sticker.rotation ? `rotate(${sticker.rotation}deg)` : undefined,
            } as any
          },
            asset.type === 'image' ? 
              React.createElement(Image, { 
                src: asset.url!, 
                style: { width: '100%', height: '100%', objectFit: 'fill' } as any
              })
            : 
              React.createElement(Svg, { viewBox: asset.viewBox || "0 0 100 100", width: '100%', height: '100%' },
                React.createElement(Path, { d: asset.path || "", fill: primary })
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
    // Resolve template dynamically if it is a database template to align module contexts
    const tId = templateId || "royal";
    const { TEMPLATE_CONFIGS, mapDbTemplateToConfig } = require("./frame-config");
    if (tId && !TEMPLATE_CONFIGS[tId]) {
      const { prisma } = require("./prisma");
      const dbTpl = await prisma.template.findUnique({
        where: { id: tId }
      });
      if (dbTpl) {
        TEMPLATE_CONFIGS[tId] = mapDbTemplateToConfig(dbTpl);
      }
    }

    const config = TEMPLATE_CONFIGS[tId];
    if (config && config.frame && config.frame.type === "image") {
      const primaryColor = theme?.primaryColor || config.defaultPrimary || "#800000";
      const finalUrl = getFrameImageUrl(config.frame as any, primaryColor);
      
      if (finalUrl && finalUrl.startsWith("data:image/svg+xml")) {
        try {
          const base64Content = finalUrl.substring(finalUrl.indexOf(",") + 1);
          let svgXml = "";
          if (finalUrl.includes(";base64,")) {
            svgXml = Buffer.from(base64Content, "base64").toString("utf-8");
          } else {
            svgXml = decodeURIComponent(base64Content);
          }
          
          const sharp = require("sharp");
          const pngBuffer = await sharp(Buffer.from(svgXml), { density: 300 })
            .png()
            .toBuffer();
            
          theme.rasterizedFrameBase64 = `data:image/png;base64,${pngBuffer.toString("base64")}`;
        } catch (rasterError) {
          console.error("Failed to rasterize base64 SVG frame to PNG:", rasterError);
        }
      }
    }

    const stream = await renderToBuffer(
      React.createElement(ExactBiodataPDF, { 
        data: formData, 
        templateId: tId, 
        theme 
      }) as any
    );
    return Buffer.from(stream);
  } catch (error: any) {
    console.error("Exact PDF Render Error:", error);
    throw new Error(error?.message || "Failed to generate exact PDF");
  }
}
