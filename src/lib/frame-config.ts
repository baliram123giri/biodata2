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
  };
  frame: FrameConfig;
  thumbnailUrl?: string;
  bgType?: string;
  bgGradientColors?: string[];
}

// ── Registry ───────────────────────────────────────────────────────

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {};

// ── Utilities ──────────────────────────────────────────────────────

export function getFrameImageUrl(config: FrameImageConfig, hexColor: string): string {
  const color = hexColor.replace("#", "");
  return config.urlTemplate.replace("{color}", color);
}

export function getTemplateConfig(templateId: string): TemplateConfig {
  if (TEMPLATE_CONFIGS[templateId]) {
    return TEMPLATE_CONFIGS[templateId];
  }
  const keys = Object.keys(TEMPLATE_CONFIGS);
  if (keys.length > 0) {
    return TEMPLATE_CONFIGS[keys[0]];
  }
  // Ultimate robust static fallback template to prevent runtime crashes if empty
  return {
    id: "royal",
    name: "Royal Gold",
    defaultPrimary: "#800000",
    defaultSecondary: "#333333",
    defaultAccent: "#D4AF37",
    defaultPadding: 45,
    photo: { x: 390, y: 100, width: 140, height: 175, cornerRadius: 8 },
    frame: {
      type: "svg",
      bgColor: "#ffffff",
      outerInset: 10,
      outerStrokeWidth: 2,
      outerCornerRadius: 8,
      innerInset: 16,
      innerStrokeWidth: 1,
      innerCornerRadius: 6,
      hasCornerCurves: true
    }
  };
}

export function registerDynamicTemplates(templates: TemplateConfig[]) {
  templates.forEach((tpl) => {
    TEMPLATE_CONFIGS[tpl.id] = tpl;
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
      outerCornerRadius: dbTpl.frameOuterCornerRadius ?? 8,
      innerInset: dbTpl.frameInnerInset ?? 16,
      innerStrokeWidth: dbTpl.frameInnerStrokeWidth ?? 1,
      innerCornerRadius: dbTpl.frameInnerCornerRadius ?? 6,
      hasCornerCurves: dbTpl.frameHasCornerCurves ?? true,
    };
  } else if (dbTpl.frameType === "gradient") {
    frame = {
      type: "gradient",
      bgColor: dbTpl.frameBgColor || "#ffffff",
      gradientColors: dbTpl.frameGradientColors || ["#4F46E5", "#06B6D4"],
      outerInset: dbTpl.frameOuterInset ?? 10,
      outerStrokeWidth: dbTpl.frameOuterStrokeWidth ?? 2,
      outerCornerRadius: dbTpl.frameOuterCornerRadius ?? 8,
      innerInset: dbTpl.frameInnerInset ?? 16,
      innerStrokeWidth: dbTpl.frameInnerStrokeWidth ?? 1,
      innerCornerRadius: dbTpl.frameInnerCornerRadius ?? 6,
    };
  } else {
    frame = {
      type: "custom",
      componentId: dbTpl.frameComponentId || "new-generation-arch",
      bgColor: dbTpl.frameBgColor || "#ffffff",
    };
  }

  return {
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
      cornerRadius: dbTpl.photoCornerRadius,
    },
    frame,
    thumbnailUrl: dbTpl.thumbnailUrl || undefined,
    bgType: dbTpl.frameBgType || "solid",
    bgGradientColors: dbTpl.frameBgGradientColors || [],
  };
}
