/**
 * Unified Frame Configuration Registry
 * 
 * This file aggregates all template configurations. 
 * To add a new template, create a file in ./templates/ and import it here.
 */



// ── Types ──────────────────────────────────────────────────────────

export interface FrameImageConfig {
  type: "image";
  urlTemplate: string;
  bgColor: string;
}

export interface FrameSvgConfig {
  type: "svg";
  bgColor: string;
  outerInset: number;
  outerStrokeWidth: number;
  outerCornerRadius: number;
  innerInset: number;
  innerStrokeWidth: number;
  innerCornerRadius: number;
  hasCornerCurves: boolean;
}

export interface FrameGradientConfig {
  type: "gradient";
  bgColor: string;
  gradientColors: string[];
  outerInset: number;
  outerStrokeWidth: number;
  outerCornerRadius: number;
  innerInset: number;
  innerStrokeWidth: number;
  innerCornerRadius: number;
}

export interface FrameCustomConfig {
  type: "custom";
  /** Unique ID for the custom rendering logic in Konva/PDF */
  componentId: string;
  bgColor: string;
}

export type FrameConfig = FrameImageConfig | FrameSvgConfig | FrameGradientConfig | FrameCustomConfig;

export interface BgConfig {
  url?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  fontFamily?: string;
  fontWeight?: string;
  fontSize?: number;
  alignment?: string;
  sectionOffsets?: string;
  sectionStyles?: string;
  imageFrameOffset?: any;
  frameImageX?: any;
  frameImageY?: any;
  frameImageWidth?: any;
  frameImageHeight?: any;
  enableSvgTint?: boolean;
}

export interface TemplateConfig {
  id: string;
  name: string;
  description?: string;
  defaultPrimary: string;
  defaultSecondary: string;
  defaultAccent: string;
  defaultPadding: number;
  defaultYPadding?: number;
  defaultPaddingTop?: number;
  defaultPaddingRight?: number;
  defaultPaddingLeft?: number;
  photo: {
    x: number;
    y: number;
    width: number;
    height: number;
    cornerRadius: number;
    showBorder?: boolean;
  };
  frame: FrameConfig;
  thumbnailUrl?: string;
  bgType?: string;
  bgGradientColors?: string[];
  bgConfig?: BgConfig;
  language?: string;
  detailsLayout?: string;
  titleShape?: string;
  mantraSignPlacement?: string;
  mantraSignVertical?: string;
  rawInput?: any;
  religion?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontSize?: number;
  alignment?: string;
  // Pricing
  isPremium?: boolean;
  isDefault?: boolean;
  price?: number | null;
  discountPrice?: number | null;
  currency?: string;
  // Format-specific Pricing
  pdfPrice?: number | null;
  pdfDiscountPrice?: number | null;
  jpgPrice?: number | null;
  jpgDiscountPrice?: number | null;
  pngPrice?: number | null;
  pngDiscountPrice?: number | null;
  comboPrice?: number | null;
  comboDiscountPrice?: number | null;
}

// ── Registry ───────────────────────────────────────────────────────


export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {};

// ── Utilities ──────────────────────────────────────────────────────

function sanitizeTemplateConfig(config: TemplateConfig): TemplateConfig {
  if (!config) return config;

  const frame = config.frame ? { ...config.frame } : undefined;
  if (frame) {
    if (frame.type === "svg" || frame.type === "gradient") {
      frame.outerCornerRadius = 0;
      frame.innerCornerRadius = 0;
    }
  }

  return {
    ...config,
    photo: config.photo ? {
      ...config.photo,
      cornerRadius: config.photo.cornerRadius ?? 8,
    } : { x: 390, y: 100, width: 140, height: 175, cornerRadius: 8 },
    frame: frame as any,
  };
}

export function getFrameImageUrl(config: FrameImageConfig, _hexColor?: string): string {
  // Return the frame URL without any dynamic color tinting.
  // Legacy templates stored with e_tint:100:rgb:{color} in the URL need that
  // transformation segment stripped so the URL is valid and the image loads.
  let url = config.urlTemplate;

  if (url.includes("{color}")) {
    // Remove the entire tint transformation segment and clean up double slashes
    url = url
      .replace(/f_auto,q_100,e_tint:\d+:rgb:\{color\}\//g, "f_auto,q_100/")
      .replace(/e_tint:\d+:rgb:\{color\}\//g, "")
      // Clean up any double-slash that results from removing the segment
      .replace(/\/\/+/g, "/")
      .replace("https:/", "https://");
  }

  return url;
}

export function getTemplateConfig(templateId: string): TemplateConfig {
  let tpl: TemplateConfig;
  if (TEMPLATE_CONFIGS[templateId]) {
    tpl = TEMPLATE_CONFIGS[templateId];
  } else {
    const keys = Object.keys(TEMPLATE_CONFIGS);
    if (keys.length > 0) {
      tpl = TEMPLATE_CONFIGS[keys[0]];
    } else {
      tpl = {
        id: "royal",
        name: "Royal Gold",
        defaultPrimary: "#800000",
        defaultSecondary: "#333333",
        defaultAccent: "#D4AF37",
        defaultPadding: 45,
        photo: { x: 390, y: 100, width: 140, height: 175, cornerRadius: 0 },
        frame: {
          type: "svg",
          bgColor: "#ffffff",
          outerInset: 10,
          outerStrokeWidth: 2,
          outerCornerRadius: 0,
          innerInset: 16,
          innerStrokeWidth: 1,
          innerCornerRadius: 0,
          hasCornerCurves: true
        }
      };
    }
  }
  return sanitizeTemplateConfig(tpl);
}

export function registerDynamicTemplates(templates: TemplateConfig[]) {
  templates.forEach((tpl) => {
    TEMPLATE_CONFIGS[tpl.id] = sanitizeTemplateConfig(tpl);
  });
}

export function mapDbTemplateToConfig(dbTpl: any): TemplateConfig {
  let frame: FrameConfig;
  
  if (dbTpl.frameType === "image") {
    frame = {
      type: "image",
      urlTemplate: dbTpl.frameUrlTemplate || "",
      bgColor: dbTpl.frameBgColor || "#ffffff",
    };
  } else if (dbTpl.frameType === "svg") {
    frame = {
      type: "svg",
      bgColor: dbTpl.frameBgColor || "#ffffff",
      outerInset: dbTpl.frameOuterInset ?? 10,
      outerStrokeWidth: dbTpl.frameOuterStrokeWidth ?? 2,
      outerCornerRadius: 0,
      innerInset: dbTpl.frameInnerInset ?? 16,
      innerStrokeWidth: dbTpl.frameInnerStrokeWidth ?? 1,
      innerCornerRadius: 0,
      hasCornerCurves: dbTpl.frameHasCornerCurves ?? true,
    };
  } else if (dbTpl.frameType === "gradient") {
    frame = {
      type: "gradient",
      bgColor: dbTpl.frameBgColor || "#ffffff",
      gradientColors: dbTpl.frameGradientColors || ["#4F46E5", "#06B6D4"],
      outerInset: dbTpl.frameOuterInset ?? 10,
      outerStrokeWidth: dbTpl.frameOuterStrokeWidth ?? 2,
      outerCornerRadius: 0,
      innerInset: dbTpl.frameInnerInset ?? 16,
      innerStrokeWidth: dbTpl.frameInnerStrokeWidth ?? 1,
      innerCornerRadius: 0,
    };
  } else {
    frame = {
      type: "custom",
      componentId: dbTpl.frameComponentId || "new-generation-arch",
      bgColor: dbTpl.frameBgColor || "#ffffff",
    };
  }

  // Safely parse bgConfig JSON from database
  let bgConfig: BgConfig | undefined = undefined;
  if (dbTpl.bgConfig) {
    try {
      const parsed = typeof dbTpl.bgConfig === "string" ? JSON.parse(dbTpl.bgConfig) : dbTpl.bgConfig;
      if (parsed) {
        bgConfig = {
          url: parsed.url || undefined,
          x: typeof parsed.x === "number" ? parsed.x : 0,
          y: typeof parsed.y === "number" ? parsed.y : 0,
          width: typeof parsed.width === "number" ? parsed.width : 595,
          height: typeof parsed.height === "number" ? parsed.height : 842,
          opacity: typeof parsed.opacity === "number" ? parsed.opacity : 1.0,
          fontFamily: parsed.fontFamily || undefined,
          fontWeight: parsed.fontWeight || undefined,
          fontSize: typeof parsed.fontSize === "number" ? parsed.fontSize : undefined,
          alignment: parsed.alignment || undefined,
          sectionOffsets: parsed.sectionOffsets || "{}",
          sectionStyles: parsed.sectionStyles || "{}",
          imageFrameOffset: parsed.imageFrameOffset || "0",
          frameImageX: parsed.frameImageX,
          frameImageY: parsed.frameImageY,
          frameImageWidth: parsed.frameImageWidth,
          frameImageHeight: parsed.frameImageHeight,
          enableSvgTint: parsed.enableSvgTint,
        };
      }
    } catch (e) {
      console.error("Error parsing bgConfig:", e);
    }
  }

  return sanitizeTemplateConfig({
    id: dbTpl.id,
    name: dbTpl.name,
    description: dbTpl.description || "",
    defaultPrimary: dbTpl.defaultPrimary,
    defaultSecondary: dbTpl.defaultSecondary,
    defaultAccent: dbTpl.defaultAccent,
    defaultPadding: dbTpl.defaultPadding,
    defaultYPadding: dbTpl.defaultYPadding ?? undefined,
    defaultPaddingTop: dbTpl.defaultPaddingTop ?? undefined,
    defaultPaddingRight: dbTpl.defaultPaddingRight ?? undefined,
    defaultPaddingLeft: dbTpl.defaultPaddingLeft ?? undefined,
    photo: {
      x: dbTpl.photoX,
      y: dbTpl.photoY,
      width: dbTpl.photoWidth,
      height: dbTpl.photoHeight,
      cornerRadius: dbTpl.photoCornerRadius ?? 8,
      showBorder: dbTpl.photoShowBorder !== false,
    },
    frame,
    thumbnailUrl: dbTpl.thumbnailUrl || undefined,
    bgType: dbTpl.frameBgType || "solid",
    bgGradientColors: dbTpl.frameBgGradientColors || [],
    bgConfig,
    language: dbTpl.language || "English",
    detailsLayout: dbTpl.detailsLayout || "classic",
    titleShape: dbTpl.titleShape || "simple",
    mantraSignPlacement: dbTpl.mantraSignPlacement || "both",
    mantraSignVertical: (dbTpl as any).mantraSignVertical || "top",
    rawInput: dbTpl.rawInput || undefined,
    religion: (dbTpl as any).religion || "Hindu",
    // Pricing
    isPremium: dbTpl.isPremium === true,
    isDefault: dbTpl.isDefault === true,
    price: dbTpl.price ?? null,
    discountPrice: dbTpl.discountPrice ?? null,
    currency: dbTpl.currency || "INR",
    pdfPrice: (dbTpl as any).pdfPrice ?? null,
    pdfDiscountPrice: (dbTpl as any).pdfDiscountPrice ?? null,
    jpgPrice: (dbTpl as any).jpgPrice ?? null,
    jpgDiscountPrice: (dbTpl as any).jpgDiscountPrice ?? null,
    pngPrice: (dbTpl as any).pngPrice ?? null,
    pngDiscountPrice: (dbTpl as any).pngDiscountPrice ?? null,
    comboPrice: (dbTpl as any).comboPrice ?? null,
    comboDiscountPrice: (dbTpl as any).comboDiscountPrice ?? null,
    fontSize: dbTpl.defaultFontSize ?? undefined,
  });
}

export function tintSvg(
  svgText: string,
  originalPrimary: string,
  newPrimary: string,
  originalAccent: string,
  newAccent: string
): string {
  let tinted = svgText;

  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // 1. Scan for hex colors in the SVG text to auto-detect target colors if missing/incorrect
  const hexRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
  const matches = svgText.match(hexRegex) || [];
  const counts: Record<string, number> = {};
  for (const match of matches) {
    const normalized = match.toLowerCase();
    counts[normalized] = (counts[normalized] || 0) + 1;
  }

  const isGrayscale = (hex: string) => {
    const color = hex.replace('#', '');
    let r = 0, g = 0, b = 0;
    if (color.length === 3) {
      r = parseInt(color[0] + color[0], 16);
      g = parseInt(color[1] + color[1], 16);
      b = parseInt(color[2] + color[2], 16);
    } else if (color.length === 6) {
      r = parseInt(color.slice(0, 2), 16);
      g = parseInt(color.slice(2, 4), 16);
      b = parseInt(color.slice(4, 6), 16);
    }
    return r === g && g === b;
  };

  const sortedColors = Object.keys(counts)
    .filter(c => !isGrayscale(c))
    .sort((a, b) => counts[b] - counts[a]);

  let targetPrimary = originalPrimary;
  let targetAccent = originalAccent;

  if (sortedColors.length > 0) {
    // If originalPrimary is empty or not present in the SVG, auto-detect it
    const hasOriginalPrimary = originalPrimary && svgText.toLowerCase().includes(originalPrimary.toLowerCase());
    if (!hasOriginalPrimary) {
      targetPrimary = sortedColors[0];
    }
  }
  if (sortedColors.length > 1) {
    // If originalAccent is empty or not present in the SVG, auto-detect it
    const hasOriginalAccent = originalAccent && svgText.toLowerCase().includes(originalAccent.toLowerCase());
    if (!hasOriginalAccent) {
      targetAccent = sortedColors[1];
    }
  }

  // 2. Perform replacements for Primary
  if (targetPrimary && newPrimary) {
    const pColor = targetPrimary.startsWith('#') ? targetPrimary : `#${targetPrimary}`;
    const newPColor = newPrimary.startsWith('#') ? newPrimary : `#${newPrimary}`;
    tinted = tinted.replace(new RegExp(escapeRegExp(pColor), 'gi'), newPColor);
    
    const pColorNoHash = pColor.replace('#', '');
    const newPColorNoHash = newPColor.replace('#', '');
    tinted = tinted.replace(new RegExp(escapeRegExp(pColorNoHash), 'gi'), newPColorNoHash);
  }

  // 3. Perform replacements for Accent
  if (targetAccent && newAccent) {
    const aColor = targetAccent.startsWith('#') ? targetAccent : `#${targetAccent}`;
    const newAColor = newAccent.startsWith('#') ? newAccent : `#${newAccent}`;
    tinted = tinted.replace(new RegExp(escapeRegExp(aColor), 'gi'), newAColor);

    const aColorNoHash = aColor.replace('#', '');
    const newAColorNoHash = newAColor.replace('#', '');
    tinted = tinted.replace(new RegExp(escapeRegExp(aColorNoHash), 'gi'), newAColorNoHash);
  }

  return tinted;
}
