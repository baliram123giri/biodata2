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
      cornerRadius: 0,
    } : { x: 390, y: 100, width: 140, height: 175, cornerRadius: 0 },
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
    photo: {
      x: dbTpl.photoX,
      y: dbTpl.photoY,
      width: dbTpl.photoWidth,
      height: dbTpl.photoHeight,
      cornerRadius: 0,
      showBorder: dbTpl.photoShowBorder !== false, // default true when null/undefined
    },
    frame,
    thumbnailUrl: dbTpl.thumbnailUrl || undefined,
    bgType: dbTpl.frameBgType || "solid",
    bgGradientColors: dbTpl.frameBgGradientColors || [],
    bgConfig,
    language: dbTpl.language || "English",
    detailsLayout: dbTpl.detailsLayout || "classic",
    titleShape: dbTpl.titleShape || "simple",
  });
}
