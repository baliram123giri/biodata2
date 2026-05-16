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
  defaultPrimary: string;
  defaultSecondary: string;
  defaultAccent: string;
  defaultPadding: number;
  photo: {
    x: number;
    y: number;
    width: number;
    height: number;
    cornerRadius: number;
  };
  frame: FrameConfig;
}

// ── Registry ───────────────────────────────────────────────────────

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  royal,
  "ivory-elegance": ivoryElegance,
  "modern-gradient": modernGradient,
  "new-generation": newGeneration,
};

// ── Utilities ──────────────────────────────────────────────────────

export function getFrameImageUrl(config: FrameImageConfig, hexColor: string): string {
  const color = hexColor.replace("#", "");
  return config.urlTemplate.replace("{color}", color);
}

export function getTemplateConfig(templateId: string): TemplateConfig {
  return TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS["royal"];
}
