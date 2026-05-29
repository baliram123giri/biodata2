/**
 * Server-Side Word Document (DOCX) Generator for Biodata.
 *
 * Mirrors the PDF generator's data extraction and produces a
 * professional .docx file with styled sections, colored headers,
 * and a structured label : value table layout.
 */
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ImageRun,
  Packer,
  convertInchesToTwip,
  TableLayoutType,
  VerticalAlign,
  HorizontalPositionRelativeFrom,
  HorizontalPositionAlign,
  VerticalPositionRelativeFrom,
  VerticalPositionAlign,
  FrameAnchorType,
  TextWrappingType,
  TextWrappingSide,
} from "docx";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { translations } from "./translations";
import { processPDFField } from "./pdf-data-utils";
import { getTemplateConfig, getFrameImageUrl } from "./frame-config";
import { getLightBgColor } from "./color-utils";
import { ORNATE_SVG_PATHS } from "./templates/classic/ornate-grandeur/paths";
import { SVG_PATHS } from "./templates/classic/new-generation/paths";
import { STICKER_ASSETS } from "./sticker-assets";
import { WATERMARK_CONFIG, getWatermarkCoordinates } from "./watermark-utils";

// ── Helpers ──────────────────────────────────────────────────────────

const networkCache = new Map<string, Buffer>();

async function fetchWithCache(url: string): Promise<Buffer> {
  if (networkCache.has(url)) {
    return networkCache.get(url)!;
  }
  console.log(`[docx-generator fetchWithCache] Fetching remote URL: "${url.substring(0, 150)}..."`);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`[docx-generator fetchWithCache] Fetch successful! Buffer size: ${buffer.length} bytes`);
    networkCache.set(url, buffer);
    return buffer;
  } catch (err) {
    console.error(`[docx-generator fetchWithCache] Failed to fetch remote URL: ${url}`, err);
    throw err;
  }
}

async function resolveBgImageBuffer(url: string): Promise<Buffer | null> {
  if (!url) {
    console.log("[docx-generator resolveBgImageBuffer] Empty URL received.");
    return null;
  }
  console.log(`[docx-generator resolveBgImageBuffer] Resolving URL: "${url.substring(0, 100)}..."`);
  try {
    if (url.startsWith("data:image/")) {
      const base64Content = url.substring(url.indexOf(",") + 1);
      const buffer = Buffer.from(base64Content, "base64");
      if (url.includes("svg") || url.startsWith("data:image/svg+xml")) {
        console.log("[docx-generator resolveBgImageBuffer] SVG Data URL detected. Rasterizing with sharp...");
        return await sharp(buffer, { density: 300 }).png().toBuffer();
      }
      console.log(`[docx-generator resolveBgImageBuffer] Resolved Base64 image successfully. Buffer size: ${buffer.length} bytes`);
      return buffer;
    } else if (url.startsWith("http://") || url.startsWith("https://")) {
      return await fetchWithCache(url);
    } else {
      const filePath = path.join(process.cwd(), 'public', url);
      console.log(`[docx-generator resolveBgImageBuffer] Resolving as local file path: "${filePath}"`);
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        console.log(`[docx-generator resolveBgImageBuffer] Read local file successfully. Buffer size: ${buffer.length} bytes`);
        return buffer;
      } else {
        console.warn(`[docx-generator resolveBgImageBuffer] Local file does not exist at: "${filePath}"`);
      }
    }
  } catch (err) {
    console.error(`[docx-generator resolveBgImageBuffer] Failed to resolve background image buffer for URL: ${url.substring(0, 100)}`, err);
  }
  return null;
}


/** Convert hex color like "#800000" to "800000" (docx expects no hash, and strictly 6 digits) */
function hexColor(hex: string): string {
  if (!hex || typeof hex !== "string") return "000000";
  let clean = hex.trim().replace(/^#/, "");
  if (clean.length === 3) {
    clean = clean.split("").map(c => c + c).join("");
  }
  if (clean.length !== 6) {
    return "000000";
  }
  return clean;
}

/** Build a no-border cell config */
const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
} as const;

async function getFrameImageBuffer(config: any, primaryColor: string, bgColor: string, theme: any): Promise<Buffer | null> {
  const A4_W = 794;
  const A4_H = 1123;
  const scale = A4_W / 595.28; // scale from pdfkit dimensions
  const cleanBgColor = bgColor.replace(/^#/, "");

  try {
    if (config.frame.type === "image") {
      const url = theme?.rasterizedFrameBase64 || getFrameImageUrl(config.frame as any, primaryColor);
      let imgBuffer: Buffer | null = null;
      if (url.startsWith("data:image/")) {
        const formatMatch = url.match(/^data:image\/(\w+);base64,/);
        const format = formatMatch ? formatMatch[1] : "png";
        const base64Content = url.substring(url.indexOf(",") + 1);
        const buffer = Buffer.from(base64Content, "base64");

        if (format.includes("svg") || url.includes("svg")) {
          imgBuffer = await sharp(buffer, { density: 300 }).png().toBuffer();
        } else {
          imgBuffer = buffer;
        }
      } else if (url.startsWith("http://") || url.startsWith("https://")) {
        imgBuffer = await fetchWithCache(url);
      } else {
        const filePath = path.join(process.cwd(), 'public', url);
        if (fs.existsSync(filePath)) {
          imgBuffer = fs.readFileSync(filePath);
        }
      }

      if (imgBuffer) {
        let bgBuffer: Buffer;
        const isGradient = theme.bgColors && theme.bgColors.length > 1;

        if (isGradient) {
          const stops = theme.bgColors.map((c: string, idx: number) => `<stop offset="${Math.round((idx / (theme.bgColors.length - 1)) * 100)}%" stop-color="${c}" />`).join('');
          const bgSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${A4_W}" height="${A4_H}">
              <defs>
                <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  ${stops}
                </linearGradient>
              </defs>
              <rect width="${A4_W}" height="${A4_H}" fill="url(#bg-gradient)" />
            </svg>
          `;
          bgBuffer = await sharp(Buffer.from(bgSvg)).png().toBuffer();
        } else {
          const hexBg = cleanBgColor.startsWith("#") ? cleanBgColor : `#${cleanBgColor}`;
          bgBuffer = await sharp({
            create: {
              width: A4_W,
              height: A4_H,
              channels: 4,
              background: hexBg
            }
          }).png().toBuffer();
        }

        const resizedFrame = await sharp(imgBuffer).resize(A4_W, A4_H).png().toBuffer();
        
        // Composite custom background image if present
        const customBgImgBuffer = await resolveBgImageBuffer(theme?.bgImageUrlBase64 || theme?.bgImageUrl || config?.bgConfig?.url);
        if (customBgImgBuffer) {
          try {
            const isCustomBg = !!theme?.bgImageUrl;
            const baseW = isCustomBg ? 300 : (config.bgConfig?.width ?? 595);
            const baseH = isCustomBg ? 300 : (config.bgConfig?.height ?? 842);
            const scaleVal = isCustomBg ? (theme.bgImageScale ?? 1.0) : 1.0;
            const w = baseW * scaleVal;
            const h = baseH * scaleVal;
            const baseLeft = isCustomBg ? 147.5 : (config.bgConfig?.x ?? 0);
            const baseTop = isCustomBg ? 271 : (config.bgConfig?.y ?? 0);
            const xOffset = isCustomBg ? (theme.bgImageXOffset ?? 0) : 0;
            const yOffset = isCustomBg ? (theme.bgImageYOffset ?? 0) : 0;
            const left = baseLeft + xOffset - (baseW * (scaleVal - 1)) / 2;
            const top = baseTop + yOffset - (baseH * (scaleVal - 1)) / 2;
            const opacity = isCustomBg ? (theme.bgImageOpacity ?? 0.15) : (config.bgConfig?.opacity ?? 1.0);

            const pdfToDocxScale = A4_W / 595.28;
            const finalW = Math.max(1, Math.round(w * pdfToDocxScale));
            const finalH = Math.max(1, Math.round(h * pdfToDocxScale));
            const finalLeft = Math.round(left * pdfToDocxScale);
            const finalTop = Math.round(top * pdfToDocxScale);

            const processedBg = await sharp(customBgImgBuffer)
              .resize(finalW, finalH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
              .ensureAlpha()
              .composite([
                {
                  input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
                  raw: { width: 1, height: 1, channels: 4 },
                  blend: 'dest-in',
                  tile: true
                }
              ])
              .png()
              .toBuffer();

            bgBuffer = await sharp(bgBuffer)
              .composite([{ input: processedBg, top: finalTop, left: finalLeft }])
              .png()
              .toBuffer();
          } catch (bgOverlayErr) {
            console.error("Failed to overlay custom background image for docx", bgOverlayErr);
          }
        }

        let finalBuffer = await sharp(bgBuffer)
          .composite([{ input: resizedFrame, top: 0, left: 0 }])
          .png()
          .toBuffer();

        if (WATERMARK_CONFIG.isEnabled) {
          try {
            const coords = getWatermarkCoordinates(595, 842);
            const watermarkPath = path.join(process.cwd(), WATERMARK_CONFIG.fallbackPngPath);
            const logoBuffer = fs.readFileSync(watermarkPath);
            const wWidth = Math.round(coords.width * (A4_W / 595));
            const wHeight = Math.round(coords.height * (A4_H / 842));

            const rotatedImage = sharp(logoBuffer)
              .resize(wWidth, wHeight)
              .rotate(WATERMARK_CONFIG.rotation || 0, { background: { r: 0, g: 0, b: 0, alpha: 0 } });

            const meta = await rotatedImage.metadata();
            const finalTop = Math.round((A4_H - (meta.height || wHeight)) / 2);
            const finalLeft = Math.round((A4_W - (meta.width || wWidth)) / 2);

            const opaqueLogo = await rotatedImage
              .ensureAlpha()
              .composite([
                {
                  input: Buffer.from([255, 255, 255, Math.round(WATERMARK_CONFIG.opacity * 255)]),
                  raw: { width: 1, height: 1, channels: 4 },
                  blend: 'dest-in',
                  tile: true
                }
              ])
              .png()
              .toBuffer();

            finalBuffer = await sharp(finalBuffer)
              .composite([{ input: opaqueLogo, top: finalTop, left: finalLeft }])
              .png()
              .toBuffer();
          } catch (watermarkErr) {
            console.error("Failed to add watermark in docx frame compositing", watermarkErr);
          }
        }
        return finalBuffer;
      }
      return null;
    }

    if (config.frame.type === "custom") {
      const componentId = config.frame.componentId;
      let svgContent = `<rect width="${A4_W}" height="${A4_H}" fill="#${cleanBgColor}" />`;

      if (componentId === "ornate-grandeur-frame") {
        svgContent += `
          <g transform="scale(${A4_W / 595}, ${A4_H / 842})">
            <g transform="translate(0,842) scale(0.0716867,-0.06578125)">
              <path d="${ORNATE_SVG_PATHS.join(' ')}" fill="${primaryColor}" />
            </g>
          </g>
        `;
      } else if (componentId === "new-generation-arch") {
        svgContent += `
          <g transform="scale(${A4_W / 595}, ${A4_H / 842})">
            <g transform="translate(0,842) scale(0.0697538,-0.06578125)">
              <path d="${SVG_PATHS.join(' ')}" fill="${primaryColor}" />
            </g>
          </g>
        `;
      } else if (componentId === "green-shapes") {
        svgContent += `
          <g transform="scale(${A4_W / 3572}, ${A4_H / 5051})">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="${primaryColor}" stop-opacity="1" />
                <stop offset="1" stop-color="${primaryColor}" stop-opacity="0.53" />
              </linearGradient>
              <linearGradient id="g2" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stop-color="${primaryColor}" stop-opacity="1" />
                <stop offset="1" stop-color="${primaryColor}" stop-opacity="0.53" />
              </linearGradient>
            </defs>
            <path fill="url(#g1)" d="m1107-0.4c-54.83 159.3-206.02 273.76-383.94 273.76-94.44 0-181.35-32.25-250.32-86.34-5.06 134.32-78.47 251.15-186.44 316.72 114.01 93.75 186.73 235.88 186.73 395 0 269.36-208.38 490.05-472.72 509.68v-1408.82z"/>
            <path fill="none" stroke="${primaryColor}" stroke-width="10" d="m179 1641.5v3230.75h1968"/>
            <path fill="url(#g2)" d="m2465.3 5050.94c54.83-159.31 206.01-273.76 383.94-273.76 94.44 0 181.35 32.25 250.31 86.33 5.07-134.32 78.47-251.15 186.44-316.72-114.01-93.74-186.72-235.87-186.72-394.99 0-269.36 208.37-490.05 472.72-509.68v1408.82z"/>
            <path fill="none" stroke="${primaryColor}" stroke-width="10" d="m3393.3 3409.04v-3230.75h-1968"/>
          </g>
        `;
      }

      const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${A4_W}" height="${A4_H}">${svgContent}</svg>`;
      let compositeOps: any[] = [];

      let sharpImg = sharp(Buffer.from(fullSvg));
      if (compositeOps.length > 0) {
        sharpImg = sharpImg.composite(compositeOps);
      }
      let buf = await sharpImg.png().toBuffer();

      if (WATERMARK_CONFIG.isEnabled) {
        try {
          const coords = getWatermarkCoordinates(595, 842);
          const watermarkPath = path.join(process.cwd(), WATERMARK_CONFIG.fallbackPngPath);
          const logoBuffer = fs.readFileSync(watermarkPath);
          const wWidth = Math.round(coords.width * (A4_W / 595));
          const wHeight = Math.round(coords.height * (A4_H / 842));

          const rotatedImage = sharp(logoBuffer)
            .resize(wWidth, wHeight)
            .rotate(WATERMARK_CONFIG.rotation || 0, { background: { r: 0, g: 0, b: 0, alpha: 0 } });

          const meta = await rotatedImage.metadata();
          const finalTop = Math.round((A4_H - (meta.height || wHeight)) / 2);
          const finalLeft = Math.round((A4_W - (meta.width || wWidth)) / 2);

          const opaqueLogo = await rotatedImage
            .ensureAlpha()
            .composite([
              {
                input: Buffer.from([255, 255, 255, Math.round(WATERMARK_CONFIG.opacity * 255)]),
                raw: { width: 1, height: 1, channels: 4 },
                blend: 'dest-in',
                tile: true
              }
            ])
            .png()
            .toBuffer();

          buf = await sharp(buf).composite([{ input: opaqueLogo, top: finalTop, left: finalLeft }]).png().toBuffer();
        } catch (fetchErr) {
          console.error("Failed to fetch/process watermark for docx", fetchErr);
        }
      }

      // Composite custom background watermark if present
      const customBgImgBuffer = await resolveBgImageBuffer(theme?.bgImageUrlBase64 || theme?.bgImageUrl || config?.bgConfig?.url);
      if (customBgImgBuffer) {
        try {
          const isCustomBg = !!theme?.bgImageUrl;
          const baseW = isCustomBg ? 300 : (config.bgConfig?.width ?? 595);
          const baseH = isCustomBg ? 300 : (config.bgConfig?.height ?? 842);
          const scaleVal = isCustomBg ? (theme.bgImageScale ?? 1.0) : 1.0;
          const w = baseW * scaleVal;
          const h = baseH * scaleVal;
          const baseLeft = isCustomBg ? 147.5 : (config.bgConfig?.x ?? 0);
          const baseTop = isCustomBg ? 271 : (config.bgConfig?.y ?? 0);
          const xOffset = isCustomBg ? (theme.bgImageXOffset ?? 0) : 0;
          const yOffset = isCustomBg ? (theme.bgImageYOffset ?? 0) : 0;
          const left = baseLeft + xOffset - (baseW * (scaleVal - 1)) / 2;
          const top = baseTop + yOffset - (baseH * (scaleVal - 1)) / 2;
          const opacity = isCustomBg ? (theme.bgImageOpacity ?? 0.15) : (config.bgConfig?.opacity ?? 1.0);

          const pdfToDocxScale = A4_W / 595.28;
          const finalW = Math.max(1, Math.round(w * pdfToDocxScale));
          const finalH = Math.max(1, Math.round(h * pdfToDocxScale));
          const finalLeft = Math.round(left * pdfToDocxScale);
          const finalTop = Math.round(top * pdfToDocxScale);

          const processedBg = await sharp(customBgImgBuffer)
            .resize(finalW, finalH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .ensureAlpha()
            .composite([
              {
                input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
                raw: { width: 1, height: 1, channels: 4 },
                blend: 'dest-in',
                tile: true
              }
            ])
            .png()
            .toBuffer();

          buf = await sharp(buf).composite([{ input: processedBg, top: finalTop, left: finalLeft }]).png().toBuffer();
        } catch (bgOverlayErr) {
          console.error("Failed to overlay custom background image for docx custom frame", bgOverlayErr);
        }
      }

      return Buffer.from(buf);
    }

    let svgBody = `<rect width="${A4_W}" height="${A4_H}" fill="#${cleanBgColor}" />`;

    if (config.frame.type === "gradient") {
      const colors = theme.bgColors || config.frame.gradientColors || ["#2A7B9B", "#57C785", "#EDDD53"];
      let stops = colors.map((c: string, i: number) => `<stop offset="${Math.round((i / (colors.length - 1)) * 100)}%" stop-color="${c}" />`).join('');
      svgBody = `
         <defs>
           <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
             ${stops}
           </linearGradient>
         </defs>
         <rect width="${A4_W}" height="${A4_H}" fill="url(#bg-gradient)" />
       `;
    }

    if (config.frame.outerInset) {
      const oI = config.frame.outerInset * scale;
      const oSW = config.frame.outerStrokeWidth * scale;
      const oCR = config.frame.outerCornerRadius * scale;
      const iI = config.frame.innerInset * scale;
      const iSW = config.frame.innerStrokeWidth * scale;
      const iCR = config.frame.innerCornerRadius * scale;

      const innerOpacity = config.frame.type === "gradient" ? 0.3 : 0.6;
      svgBody += `
        <rect x="${oI}" y="${oI}" width="${A4_W - oI * 2}" height="${A4_H - oI * 2}" stroke="${primaryColor}" stroke-width="${oSW}" rx="${oCR}" fill="none" />
        <rect x="${iI}" y="${iI}" width="${A4_W - iI * 2}" height="${A4_H - iI * 2}" stroke="${primaryColor}" stroke-width="${iSW}" rx="${iCR}" stroke-opacity="${innerOpacity}" fill="none" />
      `;

      if (config.frame.hasCornerCurves) {
        const cp = 30 * scale;
        svgBody += `
          <path d="M ${oI},${oI + cp} Q ${oI},${oI} ${oI + cp},${oI}" stroke="${primaryColor}" stroke-width="${oSW}" fill="none" />
          <path d="M ${A4_W - oI - cp},${oI} Q ${A4_W - oI},${oI} ${A4_W - oI},${oI + cp}" stroke="${primaryColor}" stroke-width="${oSW}" fill="none" />
          <path d="M ${oI},${A4_H - oI - cp} Q ${oI},${A4_H - oI} ${oI + cp},${A4_H - oI}" stroke="${primaryColor}" stroke-width="${oSW}" fill="none" />
          <path d="M ${A4_W - oI - cp},${A4_H - oI} Q ${A4_W - oI},${A4_H - oI} ${A4_W - oI},${A4_H - oI - cp}" stroke="${primaryColor}" stroke-width="${oSW}" fill="none" />
        `;
      }
    }

    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${A4_W}" height="${A4_H}">${svgBody}</svg>`;
    let buf = await sharp(Buffer.from(fullSvg)).png().toBuffer();

    if (WATERMARK_CONFIG.isEnabled) {
      try {
        const coords = getWatermarkCoordinates(595, 842);
        const watermarkPath = path.join(process.cwd(), WATERMARK_CONFIG.fallbackPngPath);
        const logoBuffer = fs.readFileSync(watermarkPath);
        const wLeft = Math.round(coords.x * (A4_W / 595));
        const wTop = Math.round(coords.y * (A4_H / 842));
        const wWidth = Math.round(coords.width * (A4_W / 595));
        const wHeight = Math.round(coords.height * (A4_H / 842));

        const opaqueLogo = await sharp(logoBuffer)
          .resize(wWidth, wHeight)
          .ensureAlpha()
          .composite([
            {
              input: Buffer.from([255, 255, 255, Math.round(WATERMARK_CONFIG.opacity * 255)]),
              raw: { width: 1, height: 1, channels: 4 },
              blend: 'dest-in',
              tile: true
            }
          ])
          .png()
          .toBuffer();

        buf = await sharp(buf).composite([{ input: opaqueLogo, top: wTop, left: wLeft }]).png().toBuffer();
      } catch (fetchErr) {
        console.error("Failed to fetch/process watermark for docx", fetchErr);
      }
    }

    // Composite custom background watermark if present
    const customBgImgBuffer = await resolveBgImageBuffer(theme?.bgImageUrlBase64 || theme?.bgImageUrl || config?.bgConfig?.url);
    if (customBgImgBuffer) {
      try {
        const isCustomBg = !!theme?.bgImageUrl;
        const baseW = isCustomBg ? 300 : (config.bgConfig?.width ?? 595);
        const baseH = isCustomBg ? 300 : (config.bgConfig?.height ?? 842);
        const scaleVal = isCustomBg ? (theme.bgImageScale ?? 1.0) : 1.0;
        const w = baseW * scaleVal;
        const h = baseH * scaleVal;
        const baseLeft = isCustomBg ? 147.5 : (config.bgConfig?.x ?? 0);
        const baseTop = isCustomBg ? 271 : (config.bgConfig?.y ?? 0);
        const xOffset = isCustomBg ? (theme.bgImageXOffset ?? 0) : 0;
        const yOffset = isCustomBg ? (theme.bgImageYOffset ?? 0) : 0;
        const left = baseLeft + xOffset - (baseW * (scaleVal - 1)) / 2;
        const top = baseTop + yOffset - (baseH * (scaleVal - 1)) / 2;
        const opacity = isCustomBg ? (theme.bgImageOpacity ?? 0.15) : (config.bgConfig?.opacity ?? 1.0);

        const pdfToDocxScale = A4_W / 595.28;
        const finalW = Math.max(1, Math.round(w * pdfToDocxScale));
        const finalH = Math.max(1, Math.round(h * pdfToDocxScale));
        const finalLeft = Math.round(left * pdfToDocxScale);
        const finalTop = Math.round(top * pdfToDocxScale);

        const processedBg = await sharp(customBgImgBuffer)
          .resize(finalW, finalH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .ensureAlpha()
          .composite([
            {
              input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
              raw: { width: 1, height: 1, channels: 4 },
              blend: 'dest-in',
              tile: true
            }
          ])
          .png()
          .toBuffer();

        buf = await sharp(buf).composite([{ input: processedBg, top: finalTop, left: finalLeft }]).png().toBuffer();
      } catch (bgOverlayErr) {
        console.error("Failed to overlay custom background image for docx default frame", bgOverlayErr);
      }
    }

    return Buffer.from(buf);
  } catch (err) {
    console.error("Frame generation error", err);
    return null;
  }
}

// ── Main Generator ───────────────────────────────────────────────────

// ── Height estimation (mirrors KonvaPreview auto-scaling) ──────────
// Word adds extra overhead per row (cell padding, default paragraph spacing)
// that Konva/PDF renderers don't have. We apply a 1.4x multiplier to account.
const DOCX_OVERHEAD_FACTOR = 1.4;

function estimateContentHeight(fontSize: number, formData: any, trans: Record<string, string>): number {
  const LINE_SPACING = fontSize * 0.5 + 2;
  const LABEL_WIDTH = 130;
  const COLON_WIDTH = 20;
  const cWidth = 595 - (formData._padding || 45) * 2 - 10;
  const valueWidth = cWidth - LABEL_WIDTH - COLON_WIDTH;
  let cursorY = (formData._paddingY || formData._padding || 45) + 20;

  // Floating image paragraphs (frame bg + photo) still occupy line height in doc flow
  if (formData.mantra) cursorY += fontSize * 2;
  if (formData.title) cursorY += fontSize * 2.5;

  const secs = [
    { fields: formData.personalDetails, label: trans.personal || "Personal Details" },
    { fields: formData.educationDetails, label: trans.educationSec || "Education & Career" },
    { fields: formData.familyDetails, label: trans.family || "Family Background" },
    { fields: formData.contactDetails, label: trans.contact || "Contact Details" },
  ];

  for (const sec of secs) {
    const fields = sec.fields
      ?.map((f: any) => processPDFField(f, sec.fields, formData, trans))
      .filter((f: any) => !f.shouldSkip && f.displayValue && f.displayValue !== "Not Specified") || [];
    if (fields.length === 0) continue;

    cursorY += Math.round(fontSize * 1.4) + LINE_SPACING + 6; // section title
    for (const field of fields) {
      const valText = String(field.displayValue);
      const valW = valText.length * fontSize * 0.6;
      const lines = Math.ceil(valW / valueWidth) || 1;
      const rowHeight = Math.max(fontSize, lines * fontSize * 1.1);
      cursorY += rowHeight + LINE_SPACING;
    }
    cursorY += fontSize * 1.5; // section gap
  }

  // Apply overhead factor to account for Word's extra cell padding & paragraph spacing
  return cursorY * DOCX_OVERHEAD_FACTOR;
}

export async function generateDocxBuffer(opts: {
  formData: any;
  templateId: string;
  theme: any;
}): Promise<Buffer> {
  const { formData: data, theme, templateId } = opts;

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
    console.error("Failed to load dynamic stickers for DOCX generation:", stickerErr);
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

  const config = getTemplateConfig(tId);
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

        const pngBuffer = await sharp(Buffer.from(svgXml), { density: 300 })
          .png()
          .toBuffer();

        theme.rasterizedFrameBase64 = `data:image/png;base64,${pngBuffer.toString("base64")}`;
      } catch (rasterError) {
        console.error("Failed to rasterize base64 SVG frame for Word:", rasterError);
      }
    }
  }
  const primary = theme.primaryColor || config.defaultPrimary;
  const secondary = theme.secondaryColor || config.defaultSecondary;
  const accent = theme.accentColor || config.defaultAccent;
  let bgColor = "ffffff";
  if (theme.bgColors && theme.bgColors.length > 0) {
    bgColor = theme.bgColors[0].replace("#", "");
  } else if ((config.frame as any).bgColor) {
    bgColor = (config.frame as any).bgColor.replace("#", "");
  } else if (theme.selectedPaletteName !== null && theme.selectedPaletteName !== "None") {
    bgColor = getLightBgColor(primary).replace("#", "");
  }

  const currentLang = data.language || "English";
  const t = translations[currentLang] || translations["English"];

  // ── Auto-scale font size to fit single page (mirrors Konva algorithm) ──
  const baseFontSize = theme.fontSize || 11;
  const padding = theme.padding ?? config.defaultPadding ?? 45;
  const paddingY = theme.paddingY !== undefined ? theme.paddingY : (config.defaultYPadding ?? padding);
  const A4_H = 842;
  const MAX_H = A4_H - paddingY;

  // Attach padding to data for height estimation
  const dataWithPadding = { ...data, _padding: padding, _paddingY: paddingY };

  let fSize = baseFontSize;
  let totalHeight = estimateContentHeight(fSize, dataWithPadding, t);

  // Reduce font size until content fits on one page (minimum 7pt)
  if (totalHeight > MAX_H) {
    for (let s = baseFontSize - 0.5; s >= 7; s -= 0.5) {
      const testHeight = estimateContentHeight(s, dataWithPadding, t);
      if (testHeight <= MAX_H) { fSize = s; break; }
      fSize = s;
    }
  }

  // ── Derive all DOCX sizes from the (possibly scaled) fSize ──
  const docxFontSize = Math.round(fSize * 2);
  const docxTitleFontSize = Math.round(fSize * 2 * 2);
  const docxMantraFontSize = Math.round(fSize * 1.2 * 2);
  const docxSectionTitleFontSize = Math.round(fSize * 1.4 * 2);
  const lineSpacingTwips = Math.round((fSize * 0.5 + 2) * 20);
  const sectionGapTwips = Math.round(fSize * 1.5 * 20);
  const mantraAfterTwips = Math.round(fSize * 2 * 20);
  const titleAfterTwips = Math.round(fSize * 2.5 * 20);

  // Column widths matching Konva: Label=130, Colon=20, Value=rest
  const contentWidth = 595 - padding * 2 - 10;
  const labelPct = Math.round((130 / contentWidth) * 100);
  const colonPct = Math.round((20 / contentWidth) * 100);
  const valuePct = 100 - labelPct - colonPct;

  // Page margins: convert padding (points) to twips (1pt = 20 twips)
  const marginXTwips = Math.round(padding * 20);
  const marginYTwips = Math.round(paddingY * 20);

  // ── Build document children ────────────────────────────────────
  const docChildren: (Paragraph | Table)[] = [];

  // Generate Frame Background
  const frameBuffer = await getFrameImageBuffer(config, primary, bgColor, theme);
  if (frameBuffer) {
    const paragraphChildren: any[] = [
      new ImageRun({
        data: frameBuffer,
        type: "png",
        transformation: {
          width: 794,
          height: 1123,
        },
        floating: {
          horizontalPosition: {
            relative: HorizontalPositionRelativeFrom.PAGE,
            align: HorizontalPositionAlign.LEFT,
          },
          verticalPosition: {
            relative: VerticalPositionRelativeFrom.PAGE,
            align: VerticalPositionAlign.TOP,
          },
          wrap: {
            type: TextWrappingType.NONE,
          },
          behindDocument: true,
        },
      })
    ];

    // Add each user-added sticker as a separate selectable floating ImageRun
    if (data.stickers && data.stickers.length > 0) {
      for (const sticker of data.stickers) {
        try {
          const asset = STICKER_ASSETS.find(a => a.id === sticker.type);
          if (!asset) continue;

          let stickerBuffer: Buffer | null = null;
          if (asset.type === 'image') {
            stickerBuffer = await fetchWithCache(asset.url!);
          } else if (asset.type === 'svg') {
            const svgStr = `
              <svg viewBox="${asset.viewBox || "0 0 100 100"}" width="100" height="100">
                <path d="${asset.path || ""}" fill="${primary}" />
              </svg>
            `;
            stickerBuffer = Buffer.from(svgStr);
          }

          if (!stickerBuffer) continue;

          const sX = sticker.scaleX ?? 1;
          const sY = sticker.scaleY ?? 1;

          const sW = Math.round(100 * sX);
          const sH = Math.round(100 * sY);

          if (sW <= 0 || sH <= 0) continue;

          let processedSticker = sharp(stickerBuffer).resize(sW, sH);

          if (sticker.rotation) {
            processedSticker = processedSticker.rotate(sticker.rotation, {
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            });
          }

          const finalStickerBuffer = await processedSticker.png().toBuffer();

          // Horizontal/vertical positions converted to EMUs (1 pt = 12700 EMUs)
          const emuX = Math.round(sticker.x * 12700);
          const emuY = Math.round(sticker.y * 12700);

          paragraphChildren.push(
            new ImageRun({
              data: finalStickerBuffer,
              type: "png",
              transformation: {
                width: sW,
                height: sH,
              },
              floating: {
                horizontalPosition: {
                  relative: HorizontalPositionRelativeFrom.PAGE,
                  offset: emuX,
                },
                verticalPosition: {
                  relative: VerticalPositionRelativeFrom.PAGE,
                  offset: emuY,
                },
                wrap: {
                  type: TextWrappingType.NONE,
                },
                behindDocument: false, // Float above text & frame so it is selectable
                zIndex: 10,
              },
            })
          );
        } catch (stickerErr) {
          console.error("Failed to render sticker in docx", stickerErr);
        }
      }
    }

    docChildren.push(
      new Paragraph({
        children: paragraphChildren,
      })
    );
  }

  // Mantra
  if (data.mantra) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: mantraAfterTwips },
        children: [
          new TextRun({
            text: data.mantra,
            font: "Noto Sans Devanagari",
            size: docxMantraFontSize,
            color: hexColor(primary),
            bold: true,
          }),
        ],
      })
    );
  }

  // Title
  if (data.title) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: titleAfterTwips },
        children: [
          new TextRun({
            text: data.title,
            size: docxTitleFontSize,
            bold: true,
            color: hexColor(primary),
          }),
        ],
      })
    );
  }

  // Profile Photo (floating)
  if (data.photo) {
    const base64Data = data.photo.replace(/^data:image\/\w+;base64,/, "");
    let imageBuffer = Buffer.from(base64Data, "base64");
    let imageType = "png";

    try {
      // Use sharp to round corners based on config
      const width = config.photo.width * 3; // upscale for print quality
      const height = config.photo.height * 3;
      const cornerRadius = (config.photo.cornerRadius || 0) * 3;

      const borderSvg = Buffer.from(
        `<svg width="${width}" height="${height}"><rect x="3" y="3" width="${width - 6}" height="${height - 6}" rx="${Math.max(0, cornerRadius - 3)}" ry="${Math.max(0, cornerRadius - 3)}" fill="none" stroke="${primary}" stroke-width="6"/></svg>`
      );

      if (cornerRadius > 0) {
        const roundedCorners = Buffer.from(
          `<svg><rect x="0" y="0" width="${width}" height="${height}" rx="${cornerRadius}" ry="${cornerRadius}"/></svg>`
        );

        const sharpBuf = await sharp(imageBuffer)
          .resize(width, height, { fit: "cover" })
          .composite([
            { input: roundedCorners, blend: "dest-in" },
            { input: borderSvg }
          ])
          .png()
          .toBuffer();
        imageBuffer = Buffer.from(sharpBuf);
      } else {
        const sharpBuf = await sharp(imageBuffer)
          .resize(width, height, { fit: "cover" })
          .composite([
            { input: borderSvg }
          ])
          .png()
          .toBuffer();
        imageBuffer = Buffer.from(sharpBuf);
      }
    } catch (err) {
      console.error("Failed to process image with sharp", err);
      // Fallback to original image
      const mimeTypeMatch = data.photo.match(/^data:image\/(\w+);base64,/);
      imageType = (mimeTypeMatch ? mimeTypeMatch[1] : "png") === "jpeg" ? "jpg" : "png";
    }

    // In docx, we anchor the photo to the top right of the page margin
    docChildren.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: imageBuffer,
            type: imageType as any,
            transformation: {
              width: config.photo.width,
              height: config.photo.height,
            },
            floating: {
              horizontalPosition: {
                relative: HorizontalPositionRelativeFrom.MARGIN,
                align: HorizontalPositionAlign.RIGHT,
              },
              verticalPosition: {
                relative: VerticalPositionRelativeFrom.MARGIN,
                offset: 0, // anchored near top
              },
              wrap: {
                type: TextWrappingType.SQUARE,
                side: TextWrappingSide.LEFT,
              },
              zIndex: 1,
            },
          }),
        ],
      })
    );
  }

  // ── Sections ───────────────────────────────────────────────────
  const sectionKeys = [
    { key: "personal", fields: data.personalDetails, label: t.personal || "Personal Details" },
    { key: "educationSec", fields: data.educationDetails, label: t.educationSec || "Education & Career" },
    { key: "family", fields: data.familyDetails, label: t.family || "Family Background" },
    { key: "contact", fields: data.contactDetails, label: t.contact || "Contact Details" },
  ];

  for (const sec of sectionKeys) {
    const fields =
      sec.fields
        ?.map((f: any) => processPDFField(f, sec.fields, data, t))
        .filter(
          (f: any) =>
            !f.shouldSkip && f.displayValue && f.displayValue !== "Not Specified"
        ) || [];

    if (fields.length === 0) continue;

    // Pre-resolve and fetch any logo buffers for the fields in this section
    const logoBuffers = new Map<string, Buffer>();
    for (const f of fields) {
      if (f.logoUrl) {
        try {
          let resolvedLogoUrl = f.logoUrl;
          if (f.logoUrl.startsWith("/api/proxy-logo?url=")) {
            resolvedLogoUrl = decodeURIComponent(f.logoUrl.split("?url=")[1]);
          }

          if (resolvedLogoUrl.startsWith("/")) {
            const localPath = path.join(process.cwd(), 'public', resolvedLogoUrl);
            if (fs.existsSync(localPath)) {
              logoBuffers.set(f.id, fs.readFileSync(localPath));
            }
          } else {
            const buf = await fetchWithCache(resolvedLogoUrl);
            logoBuffers.set(f.id, buf);
          }
        } catch (err) {
          console.error(`Failed to fetch logo for field ${f.id}:`, err);
        }
      }
    }

    // Section Title with accent bar - spacing matches Konva's section gap
    docChildren.push(
      new Paragraph({
        spacing: { before: sectionGapTwips, after: lineSpacingTwips },
        children: [
          new TextRun({
            text: "▎ ",
            color: hexColor(primary),
            size: docxSectionTitleFontSize,
          }),
          new TextRun({
            text: sec.label,
            bold: true,
            size: docxSectionTitleFontSize,
            color: hexColor(primary),
          }),
        ],
      })
    );

    // Field rows as a table - spacing matches Konva's LINE_SPACING
    const rowSpacingBefore = Math.round(lineSpacingTwips * 0.3);
    const rowSpacingAfter = Math.round(lineSpacingTwips * 0.7);

    const tableRows = fields.map(
      (f: any) =>
        new TableRow({
          children: [
            // Label cell
            new TableCell({
              width: { size: labelPct, type: WidthType.PERCENTAGE },
              borders: noBorders,
              verticalAlign: VerticalAlign.TOP,
              children: [
                new Paragraph({
                  spacing: { before: rowSpacingBefore, after: rowSpacingAfter },
                  children: [
                    new TextRun({
                      text: f.displayLabel,
                      bold: true,
                      size: docxFontSize,
                      color: hexColor(secondary),
                    }),
                  ],
                }),
              ],
            }),
            // Colon cell
            new TableCell({
              width: { size: colonPct, type: WidthType.PERCENTAGE },
              borders: noBorders,
              verticalAlign: VerticalAlign.TOP,
              children: [
                new Paragraph({
                  spacing: { before: rowSpacingBefore, after: rowSpacingAfter, line: Math.round(fSize * 1.1 * 20) },
                  children: [
                    new TextRun({
                      text: ":",
                      size: docxFontSize,
                      color: hexColor(secondary),
                    }),
                  ],
                }),
              ],
            }),
            // Value cell
            new TableCell({
              width: { size: valuePct, type: WidthType.PERCENTAGE },
              borders: noBorders,
              verticalAlign: VerticalAlign.TOP,
              children: [
                new Paragraph({
                  spacing: { before: rowSpacingBefore, after: rowSpacingAfter, line: Math.round(fSize * 1.1 * 20) },
                  children: [
                    ...(logoBuffers.has(f.id) ? [
                      new ImageRun({
                        data: logoBuffers.get(f.id)!,
                        type: "png",
                        transformation: {
                          width: 14,
                          height: 14,
                        },
                      }),
                      new TextRun({
                        text: "  ",
                      }),
                    ] : []),
                    new TextRun({
                      text: String(f.displayValue),
                      size: docxFontSize,
                      color: hexColor(secondary),
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
    );

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: tableRows,
      })
    );
  }

  // ── Create Document ────────────────────────────────────────────
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: docxFontSize,
          },
          paragraph: {
            spacing: { before: 0, after: 0, line: 240 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: marginYTwips,
              bottom: marginYTwips,
              left: marginXTwips,
              right: marginXTwips,
            },
          },
        },
        children: docChildren,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
