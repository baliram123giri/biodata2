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

// ── Helpers ──────────────────────────────────────────────────────────

const networkCache = new Map<string, Buffer>();

async function fetchWithCache(url: string): Promise<Buffer> {
  if (networkCache.has(url)) {
    return networkCache.get(url)!;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  networkCache.set(url, buffer);
  return buffer;
}

/** Convert hex color like "#800000" to "800000" (docx expects no hash) */
function hexColor(hex: string): string {
  return hex.replace(/^#/, "");
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
      const url = getFrameImageUrl(config.frame as any, primaryColor);
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return await fetchWithCache(url);
      } else {
        const filePath = path.join(process.cwd(), 'public', url);
        if (fs.existsSync(filePath)) {
           return fs.readFileSync(filePath);
        }
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

      if (componentId === "new-generation-arch") {
        try {
          const ganeshaBuffer = await fetchWithCache("https://res.cloudinary.com/dhlyinfwd/image/upload/v1778844624/biodata/Stickers/God%20Signs/ganesh.png");
          const wLeft = Math.round((595 - 380) * (A4_W / 595));
          const wTop = Math.round(250 * (A4_H / 842));
          const wWidth = Math.round(300 * (A4_W / 595));
          const wHeight = Math.round(300 * (A4_H / 842));

          const opaqueGanesha = await sharp(ganeshaBuffer)
            .resize(wWidth, wHeight)
            .ensureAlpha()
            .composite([{
              input: Buffer.from([255, 255, 255, Math.round(0.07 * 255)]),
              raw: { width: 1, height: 1, channels: 4 },
              blend: 'dest-in',
              tile: true
            }])
            .png()
            .toBuffer();

          compositeOps.push({
            input: opaqueGanesha,
            top: wTop,
            left: wLeft,
          });
        } catch (fetchErr) {
          console.error("Failed to fetch/process ganesh watermark for docx", fetchErr);
        }
      }

      let sharpImg = sharp(Buffer.from(fullSvg));
      if (compositeOps.length > 0) {
        sharpImg = sharpImg.composite(compositeOps);
      }
      const buf = await sharpImg.png().toBuffer();
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
      
      svgBody += `
        <rect x="${oI}" y="${oI}" width="${A4_W - oI * 2}" height="${A4_H - oI * 2}" stroke="${primaryColor}" stroke-width="${oSW}" rx="${oCR}" fill="none" />
        <rect x="${iI}" y="${iI}" width="${A4_W - iI * 2}" height="${A4_H - iI * 2}" stroke="${primaryColor}" stroke-width="${iSW}" rx="${iCR}" fill="none" />
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
    const buf = await sharp(Buffer.from(fullSvg)).png().toBuffer();
    return Buffer.from(buf);
  } catch (err) {
    console.error("Frame generation error", err);
    return null;
  }
}

// ── Main Generator ───────────────────────────────────────────────────

export async function generateDocxBuffer(opts: {
  formData: any;
  templateId: string;
  theme: any;
}): Promise<Buffer> {
  const { formData: data, theme, templateId } = opts;

  const config = getTemplateConfig(templateId || "royal");
  const primary = theme.selectedPaletteName === null ? config.defaultPrimary : (theme.primaryColor || "#800000");
  const secondary = theme.selectedPaletteName === null ? config.defaultSecondary : (theme.secondaryColor || "#333333");
  const bgColor = theme.selectedPaletteName === null 
    ? ((config.frame as any).bgColor || "ffffff") 
    : getLightBgColor(primary).replace("#", "");
  
  const currentLang = data.language || "English";
  const t = translations[currentLang] || translations["English"];

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
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: data.mantra,
            font: "Noto Sans Devanagari",
            size: 24,
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
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: data.title,
            size: 36,
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

      if (cornerRadius > 0) {
        const roundedCorners = Buffer.from(
          `<svg><rect x="0" y="0" width="${width}" height="${height}" rx="${cornerRadius}" ry="${cornerRadius}"/></svg>`
        );

        const sharpBuf = await sharp(imageBuffer)
          .resize(width, height, { fit: "cover" })
          .composite([{ input: roundedCorners, blend: "dest-in" }])
          .png()
          .toBuffer();
        imageBuffer = Buffer.from(sharpBuf);
      } else {
        const sharpBuf = await sharp(imageBuffer)
          .resize(width, height, { fit: "cover" })
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

    // Section Title with accent bar
    docChildren.push(
      new Paragraph({
        spacing: { before: 300, after: 150 },
        children: [
          new TextRun({
            text: "▎ ",
            color: hexColor(primary),
            size: 24,
          }),
          new TextRun({
            text: sec.label,
            bold: true,
            size: 24,
            color: hexColor(primary),
          }),
        ],
      })
    );

    // Field rows as a table for alignment
    const tableRows = fields.map(
      (f: any) =>
        new TableRow({
          children: [
            // Label cell
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              borders: noBorders,
              verticalAlign: VerticalAlign.TOP,
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({
                      text: f.displayLabel,
                      bold: true,
                      size: 20,
                      color: hexColor(secondary),
                    }),
                  ],
                }),
              ],
            }),
            // Colon cell
            new TableCell({
              width: { size: 5, type: WidthType.PERCENTAGE },
              borders: noBorders,
              verticalAlign: VerticalAlign.TOP,
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({
                      text: ":",
                      size: 20,
                      color: hexColor(secondary),
                    }),
                  ],
                }),
              ],
            }),
            // Value cell
            new TableCell({
              width: { size: 60, type: WidthType.PERCENTAGE },
              borders: noBorders,
              verticalAlign: VerticalAlign.TOP,
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({
                      text: String(f.displayValue),
                      size: 20,
                      color: "333333",
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

    // Table row height config doesn't exist perfectly, but spacing does the job
  }

  // ── Create Document ────────────────────────────────────────────
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 20,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
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
