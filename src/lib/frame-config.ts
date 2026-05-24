/**
 * Unified Frame Configuration Registry
 * 
 * This file aggregates all template configurations. 
 * To add a new template, create a file in ./templates/ and import it here.
 */

import { royal } from "./templates/classic/royal";
import { ivoryElegance } from "./templates/classic/ivory-elegance";
import { modernGradient } from "./templates/classic/modern-gradient";
import { newGeneration } from "./templates/classic/new-generation/config";
import { ornateGrandeur } from "./templates/classic/ornate-grandeur/config";
import { greenShapes } from "./templates/classic/green-shapes/config";

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

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  royal,
  "ivory-elegance": ivoryElegance,
  "modern-gradient": modernGradient,
  "new-generation": newGeneration,
  "ornate-grandeur": ornateGrandeur,
  "green-shapes": greenShapes,
};

// ── Utilities ──────────────────────────────────────────────────────

export function getFrameImageUrl(config: FrameImageConfig, hexColor: string): string {
  const color = hexColor.replace("#", "");
  return config.urlTemplate.replace("{color}", color);
}

export function getTemplateConfig(templateId: string): TemplateConfig {
  return TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS["royal"];
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
