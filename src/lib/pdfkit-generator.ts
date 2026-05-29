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
  return React.createElement(View, {});
}

const ExactBiodataPDF = ({ data, templateId, theme }: any) => {
  const config = getTemplateConfig(templateId);

  const sectionOffsets = (() => {
    try { return JSON.parse(config.bgConfig?.sectionOffsets || "{}"); } catch { return {}; }
  })();

  const sectionStyles = (() => {
    try { return JSON.parse(config.bgConfig?.sectionStyles || "{}"); } catch { return {}; }
  })();

  const primary = theme.primaryColor || config.defaultPrimary;
  const secondary = theme.secondaryColor || config.defaultSecondary;
  const accent = theme.accentColor || config.defaultAccent;
  const detailsLayout = config.detailsLayout || "classic";
  const titleShape = config.titleShape || "simple";
  
  const isTemplateGradient = (config.bgType === "linear" || config.bgType === "radial") && (config.bgGradientColors || []).length > 1;
  const isStaticGradient = config.frame.type === "gradient" && ((config.frame as any).gradientColors || []).length > 1;
  const hasTemplateGradient = isTemplateGradient || isStaticGradient;

  const bgColor = (theme.selectedPaletteName !== null && theme.selectedPaletteName !== undefined && (!theme.bgColors || theme.bgColors.length <= 1) && !hasTemplateGradient)
    ? getLightBgColor(primary)
    : (config.frame as any).bgColor || "#ffffff";
  const padding = theme.padding ?? config.defaultPadding;
  const paddingY = theme.paddingY !== undefined ? theme.paddingY : (config.defaultYPadding ?? padding);
  const initialFontSize = theme.fontSize || config.bgConfig?.fontSize || 11;

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
      cursorY += fSize * 2.8;
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
      const secIdx = sectionKeys.indexOf(sec);
      const secKey = `sec-${secIdx}`;
      const lookupKey = sec.key || secKey;
      const style = sectionStyles[lookupKey] || sectionStyles[secKey] || {};
      const secFontSize = style.fontSize ? Number(style.fontSize) : fSize;
      const secLineSpacing = secFontSize * 0.5 + 2;

      const fields = sec.fields?.map((f: any) => processPDFField(f, sec.fields, data, t)).filter((f: any) => !f.shouldSkip && f.displayValue && f.displayValue !== "Not Specified") || [];
      if (fields.length === 0) continue;

      const titleY = cursorY;
      cursorY += Math.round(secFontSize * 1.4) + secLineSpacing + 12;
      const fieldRows: any[] = [];

      let i = 0;
      while (i < fields.length) {
        const f1 = fields[i];
        const valText = String(f1.displayValue);
        
        let rowWidth = contentWidth;
        if (data.photo && config.photo && cursorY >= config.photo.y - 15 && cursorY <= config.photo.y + config.photo.height + 15) {
           rowWidth = config.photo.x - padding - 20;
        }
        
        const f2 = fields[i + 1];
        const isTwoCol = detailsLayout === "two-column";
        const canPair = isTwoCol && f2 && 
                        (valText.length < 16 && String(f1.displayLabel).length < 13) && 
                        (String(f2.displayValue).length < 16 && String(f2.displayLabel).length < 13) &&
                        !(data.photo && config.photo && cursorY >= config.photo.y - 15 && cursorY <= config.photo.y + config.photo.height + 15);
                        
        if (canPair) {
          const halfW = (rowWidth - 12) / 2;
          const labelW = Math.round(halfW * 0.45);
          const valueW = halfW - labelW - 10;
          
          fieldRows.push({
            ...f1,
            y: cursorY,
            isHalf: true,
            colIndex: 0,
            halfW,
            labelW,
            valueW
          });
          
          fieldRows.push({
            ...f2,
            y: cursorY,
            isHalf: true,
            colIndex: 1,
            halfW,
            labelW,
            valueW
          });
          
          cursorY += secFontSize * 1.35 + secLineSpacing;
          i += 2;
        } else {
          let valueW = rowWidth - LABEL_WIDTH - COLON_WIDTH;
          if (f1.logoUrl) {
            valueW -= (secFontSize + 4);
          }
          const valW = valText.length * secFontSize * 0.6;
          const lines = Math.ceil(valW / valueW) || 1;
          const rowHeight = Math.max(secFontSize, lines * secFontSize * 1.1);
          
          fieldRows.push({
            ...f1,
            y: cursorY,
            isHalf: false,
            valueW,
            rowWidth
          });
          
          cursorY += rowHeight + secLineSpacing;
          i += 1;
        }
      }
      
      sectionLayouts.push({ key: sec.key, title: sec.label, titleY, fields: fieldRows });
      cursorY += secFontSize * 1.5;
    }
    return { headerItems, sectionLayouts, totalHeight: cursorY };
  };

  // Find optimal font size to fit on one page
  let currentFontSize = initialFontSize;
  let layout = calculateLayout(currentFontSize);
  const MAX_Y = A4_H - paddingY;

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
        ...([
          renderPDFBackground(),
          config.bgConfig?.url ? React.createElement(Image, {
            src: config.bgConfig.url,
            style: {
              position: 'absolute',
              left: config.bgConfig.x ?? 0,
              top: config.bgConfig.y ?? 0,
              width: config.bgConfig.width ?? 595,
              height: config.bgConfig.height ?? 842,
              opacity: config.bgConfig.opacity ?? 1.0,
            } as any
          }) : null,
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
            config.frame.hasCornerCurves ? React.createElement(G, {},
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
            ) : null
          ),
          
        WATERMARK_CONFIG.isEnabled ? React.createElement(View, {
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
        })) : null,

        (() => {
          const headerOffset = sectionOffsets["header"] || { x: 0, y: 0 };
          return React.createElement(View, {
            style: {
              position: 'absolute',
              top: headerOffset.y,
              left: headerOffset.x,
              width: A4_W,
              height: A4_H
            } as any
          },
            ...layout.headerItems.map((item, i) => {
              if (item.type === 'title') {
                if (titleShape === "ribbon") {
                  const ribbonW = 320;
                  const ribbonH = item.fontSize * 2.8;
                  const ribbonX = (A4_W - ribbonW) / 2;
                  const ribbonY = item.y - 4;
                  
                  return React.createElement(View, { key: i, style: { position: 'absolute', top: ribbonY, left: 0, width: A4_W } as any },
                    React.createElement(Svg, { width: A4_W, height: ribbonH, viewBox: `0 0 ${A4_W} ${ribbonH}` },
                      React.createElement(Path, {
                        d: `M ${ribbonX - 20} ${8} L ${ribbonX} ${2} L ${ribbonX} ${ribbonH - 2} L ${ribbonX - 20} ${ribbonH + 4} L ${ribbonX - 28} ${(ribbonH / 2) + 5} Z`,
                        fill: primary,
                        opacity: 0.8
                      }),
                      React.createElement(Path, {
                        d: `M ${ribbonX + ribbonW + 20} ${8} L ${ribbonX + ribbonW} ${2} L ${ribbonX + ribbonW} ${ribbonH - 2} L ${ribbonX + ribbonW + 20} ${ribbonH + 4} L ${ribbonX + ribbonW + 28} ${(ribbonH / 2) + 5} Z`,
                        fill: primary,
                        opacity: 0.8
                      }),
                      React.createElement(Rect, {
                        x: ribbonX,
                        y: 0,
                        width: ribbonW,
                        height: ribbonH,
                        fill: primary,
                        stroke: accent || primary,
                        strokeWidth: 2,
                        rx: 6
                      })
                    ),
                    React.createElement(Text, {
                      style: {
                        position: 'absolute',
                        top: (ribbonH - item.fontSize * 2) / 2,
                        left: ribbonX,
                        width: ribbonW,
                        textAlign: 'center',
                        fontSize: item.fontSize * 0.9,
                        fontFamily: item.font,
                        fontWeight: 'bold',
                        color: '#ffffff'
                      } as any
                    }, item.text ? String(item.text) : "")
                  );
                } else if (titleShape === "arch") {
                  return React.createElement(View, { key: i, style: { position: 'absolute', top: item.y, left: 0, width: A4_W } as any },
                    React.createElement(Svg, { width: A4_W, height: 40, viewBox: `0 0 ${A4_W} 40`, style: { position: 'absolute', top: -28 } as any },
                      React.createElement(Path, {
                        d: `M ${A4_W / 2 - 120} 32 C ${A4_W / 2 - 80} 16 C ${A4_W / 2 - 30} 10 C ${A4_W / 2} 10 C ${A4_W / 2 + 30} 10 C ${A4_W / 2 + 80} 16 C ${A4_W / 2 + 120} 32`,
                        stroke: accent || primary,
                        strokeWidth: 2.5,
                        fill: 'none'
                      }),
                      React.createElement(Path, {
                        d: `M ${A4_W / 2 - 100} 36 C ${A4_W / 2 - 70} 22 C ${A4_W / 2 - 25} 16 C ${A4_W / 2} 16 C ${A4_W / 2 + 25} 16 C ${A4_W / 2 + 70} 22 C ${A4_W / 2 + 100} 36`,
                        stroke: primary,
                        strokeWidth: 1,
                        opacity: 0.6,
                        fill: 'none'
                      })
                    ),
                    React.createElement(Text, {
                      style: {
                        textAlign: 'center',
                        fontSize: item.fontSize,
                        fontFamily: item.font,
                        fontWeight: 'bold',
                        color: primary
                      } as any
                    }, item.text ? String(item.text) : "")
                  );
                } else if (titleShape === "ornament") {
                  return React.createElement(View, { key: i, style: { position: 'absolute', top: item.y, left: 0, width: A4_W } as any },
                    React.createElement(Svg, { width: A4_W, height: 40, viewBox: `0 0 ${A4_W} 40`, style: { position: 'absolute', top: -2 } as any },
                      React.createElement(Path, {
                        d: `M ${A4_W / 2 - 170} 15 C ${A4_W / 2 - 162} 15 C ${A4_W / 2 - 155} 21 C ${A4_W / 2 - 155} 30 C ${A4_W / 2 - 155} 38 C ${A4_W / 2 - 162} 45 C ${A4_W / 2 - 170} 45 C ${A4_W / 2 - 178} 45 C ${A4_W / 2 - 185} 38 C ${A4_W / 2 - 185} 30 C ${A4_W / 2 - 185} 21 C ${A4_W / 2 - 178} 15 Z`,
                        fill: accent || primary,
                        transform: "scale(0.8)"
                      }),
                      React.createElement(Path, {
                        d: `M ${A4_W / 2 + 140} 15 C ${A4_W / 2 + 148} 15 C ${A4_W / 2 + 155} 21 C ${A4_W / 2 + 155} 30 C ${A4_W / 2 + 155} 38 C ${A4_W / 2 + 148} 45 C ${A4_W / 2 + 140} 45 C ${A4_W / 2 + 132} 45 C ${A4_W / 2 + 125} 38 C ${A4_W / 2 + 125} 30 C ${A4_W / 2 + 125} 21 C ${A4_W / 2 + 132} 15 Z`,
                        fill: accent || primary,
                        transform: "scale(0.8)"
                      }),
                      React.createElement(Path, {
                        d: `M ${A4_W / 2 - 90} 38 L ${A4_W / 2 + 90} 38`,
                        stroke: accent || primary,
                        strokeWidth: 1.5,
                        fill: 'none'
                      }),
                      React.createElement(Path, {
                        d: `M ${A4_W / 2 - 5} 38 L ${A4_W / 2} 35.5 L ${A4_W / 2 + 5} 38 L ${A4_W / 2} 40.5 Z`,
                        fill: accent || primary
                      })
                    ),
                    React.createElement(Text, {
                      style: {
                        textAlign: 'center',
                        fontSize: item.fontSize,
                        fontFamily: item.font,
                        fontWeight: 'bold',
                        color: primary
                      } as any
                    }, item.text ? String(item.text) : "")
                  );
                }
              }
              
              // Default: simple title or mantra text
              return React.createElement(Text, {
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
              }, item.text ? String(item.text) : "");
            })
          );
        })(),
        data.photo ? React.createElement(Image, { src: data.photo, style: { ...styles.photo, borderWidth: 0 } as any }) : null,
        data.photo && config.photo.showBorder !== false ? React.createElement(View, { style: styles.photoBorder as any }) : null,
        ...layout.sectionLayouts.flatMap((sec, si) => {
          const secKey = `sec-${si}`;
          const lookupKey = sec.key || secKey;
          const offset = sectionOffsets[lookupKey] || sectionOffsets[secKey] || { x: 0, y: 0 };
          const style = sectionStyles[lookupKey] || sectionStyles[secKey] || {};
          const titleColor = style.titleColor || primary;
          const fieldColor = style.fieldColor || secondary;
          const fSize = style.fontSize ? Number(style.fontSize) : currentFontSize;
          const fontStyle = style.fontStyle || "bold";
          const textTransform = style.textTransform || "none";
          const applyTransform = (rawText: any) => {
            if (rawText === null || rawText === undefined) return "";
            const text = String(rawText);
            if (textTransform === "uppercase") return text.toUpperCase();
            if (textTransform === "lowercase") return text.toLowerCase();
            if (textTransform === "capitalize") return text.replace(/\b\w/g, c => c.toUpperCase());
            return text;
          };

          const absTitleY = sec.titleY + offset.y;

          return [
            // Modern Boxed Card Background Rendering
            detailsLayout === "modern-boxed" ? (() => {
              const lastField = sec.fields[sec.fields.length - 1];
              const boxHeight = lastField ? (lastField.y + fSize * 1.45 - sec.titleY + 12) : 50;
              return React.createElement(Svg, {
                key: `card-${si}`,
                style: {
                  position: 'absolute',
                  left: padding - 8 + offset.x,
                  top: absTitleY - 8,
                  width: A4_W - padding * 2 + 16,
                  height: boxHeight,
                } as any
              },
                React.createElement(Rect, {
                  x: 0,
                  y: 0,
                  width: A4_W - padding * 2 + 16,
                  height: boxHeight,
                  fill: titleColor,
                  fillOpacity: 0.04,
                  stroke: titleColor,
                  strokeOpacity: 0.1,
                  strokeWidth: 1.2,
                  rx: 10
                })
              );
            })() : null,

            React.createElement(View, {
              key: `bar-${si}`,
              style: [
                styles.sectionTitleBar,
                {
                  left: padding + offset.x,
                  top: absTitleY + 15,
                  backgroundColor: accent || titleColor
                }
              ] as any
            }),
            React.createElement(Text, { 
              key: `title-${si}`,
              style: [
                styles.sectionTitleText, 
                { 
                  left: padding + 10 + offset.x,
                  top: absTitleY + 2,
                  fontSize: Math.round(fSize * 1.4), 
                  fontFamily: fontFamily, 
                  fontWeight: fontStyle === 'bold' ? 'bold' : 'normal', 
                  color: titleColor 
                }
              ] as any 
            }, applyTransform(sec.title)),
            ...sec.fields.flatMap((f: any, fi: any) => {
              const colX = f.isHalf 
                ? (f.colIndex === 0 
                    ? (padding + 10) 
                    : (padding + 10 + f.halfW + 10))
                : (padding + 10);
              const lblW = f.isHalf ? f.labelW : 130;
              const colonX = colX + lblW + 5;
              const valX = colX + lblW + 15;
              
              const absFieldY = f.y + offset.y;
              
              return [
                // 1. Label
                React.createElement(Text, { 
                  key: `lbl-${si}-${fi}`,
                  style: [
                    styles.label, 
                    { 
                      position: 'absolute',
                      top: absFieldY,
                      left: colX + offset.x,
                      width: lblW, 
                      fontSize: fSize, 
                      fontFamily: fontFamily, 
                      fontWeight: fontStyle === 'bold' ? 'bold' : 'normal', 
                      color: fieldColor,
                      lineHeight: 1.1
                    }
                  ] as any 
                }, applyTransform(f.displayLabel)),
                
                // 2. Colon
                React.createElement(Text, { 
                  key: `cln-${si}-${fi}`,
                  style: [
                    styles.colon, 
                    { 
                      position: 'absolute',
                      top: absFieldY,
                      left: colonX + offset.x, 
                      width: 15,
                      fontSize: fSize, 
                      fontFamily: fontFamily, 
                      color: fieldColor,
                      lineHeight: 1.1
                    }
                  ] as any 
                }, ":"),
                
                // 3. Logo & Value wrapped inline
                React.createElement(View, {
                  key: `val-${si}-${fi}`,
                  style: {
                    position: 'absolute',
                    top: absFieldY,
                    left: valX + offset.x,
                    width: f.valueW + (f.logoUrl ? (fSize + 4) : 0),
                    flexDirection: 'row',
                    alignItems: 'flex-start'
                  } as any
                },
                  ...([
                    f.logoUrl ? (() => {
                      let resolvedSrc: any = f.logoUrl;
                      if (f.logoUrl.startsWith("data:image/")) {
                        const commaIdx = f.logoUrl.indexOf(",");
                        const base64Content = f.logoUrl.substring(commaIdx + 1);
                        resolvedSrc = Buffer.from(base64Content, "base64");
                      } else if (f.logoUrl.startsWith("/api/proxy-logo?url=")) {
                        resolvedSrc = decodeURIComponent(f.logoUrl.split("?url=")[1]);
                      } else if (f.logoUrl.startsWith("/")) {
                        resolvedSrc = path.join(process.cwd(), "public", f.logoUrl);
                      }
                      return React.createElement(Image, { 
                        src: resolvedSrc, 
                        style: [styles.logo, { width: fSize, height: fSize, marginTop: fSize * 0.05, marginRight: 4 }] as any 
                      });
                    })() : null,
                    React.createElement(Text, { 
                      style: [
                        styles.value, 
                        { 
                          fontSize: fSize, 
                          fontFamily: fontFamily, 
                          color: fieldColor,
                          width: f.valueW,
                          lineHeight: 1.1
                        }
                      ] as any 
                    }, applyTransform(f.displayValue))
                  ].filter(Boolean))
                ),
                
                // 4. Divided underline
                detailsLayout === "elegant-divided" && (!f.isHalf || f.colIndex === 1) ? React.createElement(Svg, {
                  key: `div-${si}-${fi}`,
                  height: 1,
                  width: f.isHalf ? f.halfW : (A4_W - padding * 2 - 20),
                  style: { position: 'absolute', top: absFieldY + fSize * 1.35 + 2, left: colX + offset.x } as any
                },
                  React.createElement(Path, {
                    d: `M 0 0 L ${f.isHalf ? f.halfW : (A4_W - padding * 2 - 20)} 0`,
                    stroke: fieldColor + "15",
                    strokeWidth: 0.8,
                    strokeDasharray: "2,2"
                  } as any)
                ) : null
              ].filter(Boolean);
            })
          ].filter(Boolean);
        }),
        (data.stickers || []).map((sticker: any, i: number) => {
          const asset = STICKER_ASSETS.find(a => a.id === sticker.type);
          if (!asset) return React.createElement(View, { key: `sticker-${i}` });
          
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
              ...(sticker.rotation ? { transform: `rotate(${sticker.rotation}deg)` } : {}),
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
        ].filter(Boolean))
      )
    )
  );
};

async function fetchImageAsBase64(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) return undefined;
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error(`Failed to fetch and convert image to base64: ${url}`, error);
    return undefined;
  }
}

export async function generatePDFBuffer(opts: any): Promise<Buffer> {
  const { formData, templateId, theme } = opts;
  try {
    // Pre-fetch and convert company logo (Disabled)
    // Resolve template dynamically if it is a database template to align module contexts
    const tId = templateId || "royal";
    const { TEMPLATE_CONFIGS, mapDbTemplateToConfig } = require("./frame-config");
    
    // Fetch and register custom stickers from database
    try {
      const { prisma } = require("./prisma");
      const dbStickers = await prisma.sticker.findMany();
      if (dbStickers && dbStickers.length > 0) {
        const { registerDynamicStickers } = require("./sticker-assets");
        registerDynamicStickers(dbStickers);
      }
    } catch (stickerErr) {
      console.error("Failed to load dynamic stickers for PDF generation:", stickerErr);
    }

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
