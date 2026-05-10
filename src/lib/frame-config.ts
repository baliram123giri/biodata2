/**
 * Frame configuration registry for Konva canvas preview.
 *
 * Each template declares how its frame should be rendered:
 *   - "image" frames → loaded from a Cloudinary URL with dynamic color tinting
 *   - "svg"   frames → drawn with Konva shapes (borders, corners, etc.)
 *
 * The config also stores template-specific layout tokens like photo position
 * and default padding, so the preview matches the PDF output exactly.
 */

// ── Types ──────────────────────────────────────────────────────────

export interface FrameImageConfig {
  type: "image";
  /** Cloudinary URL template. `{color}` is replaced with the hex color (no #) */
  urlTemplate: string;
  /** Background fill behind the image (for transparent PNGs) */
  bgColor: string;
}

export interface FrameSvgConfig {
  type: "svg";
  /** Background fill for the page */
  bgColor: string;
  /** Outer border inset (px from edge) */
  outerInset: number;
  outerStrokeWidth: number;
  outerCornerRadius: number;
  /** Inner border inset */
  innerInset: number;
  innerStrokeWidth: number;
  innerCornerRadius: number;
  /** Whether to draw decorative corner curves */
  hasCornerCurves: boolean;
}

export type FrameConfig = FrameImageConfig | FrameSvgConfig;

export interface TemplateConfig {
  id: string;
  name: string;
  /** Default primary color when "None" palette is selected */
  defaultPrimary: string;
  defaultSecondary: string;
  defaultAccent: string;
  defaultPadding: number;
  /** Photo frame position & size */
  photo: {
    x: number;
    y: number;
    width: number;
    height: number;
    cornerRadius: number;
  };
  /** Frame rendering config */
  frame: FrameConfig;
}

// ── Registry ───────────────────────────────────────────────────────

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  royal: {
    id: "royal",
    name: "Royal Gold",
    defaultPrimary: "#800000",
    defaultSecondary: "#333333",
    defaultAccent: "#D4AF37",
    defaultPadding: 45,
    photo: { x: 420, y: 110, width: 119, height: 149, cornerRadius: 10 },
    frame: {
      type: "svg",
      bgColor: "#fffaf7",
      outerInset: 15,
      outerStrokeWidth: 3,
      outerCornerRadius: 12,
      innerInset: 28,
      innerStrokeWidth: 1.5,
      innerCornerRadius: 8,
      hasCornerCurves: true,
    },
  },

  "ivory-elegance": {
    id: "ivory-elegance",
    name: "Ivory Elegance",
    defaultPrimary: "#7A5C2F",
    defaultSecondary: "#333333",
    defaultAccent: "#B8860B",
    defaultPadding: 50,
    photo: { x: 425, y: 112, width: 106, height: 141, cornerRadius: 10 },
    frame: {
      type: "image",
      urlTemplate:
        "https://res.cloudinary.com/dhlyinfwd/image/upload/f_auto,q_auto,e_tint:100:rgb:{color}/v1778071856/biodata/templetes/classic/qeas9gkg1bdzxg4vjztg.png",
      bgColor: "#FFFFF5",
    },
  },
};

/**
 * Resolves the full frame image URL by injecting the current color.
 */
export function getFrameImageUrl(config: FrameImageConfig, hexColor: string): string {
  const color = hexColor.replace("#", "");
  return config.urlTemplate.replace("{color}", color);
}

/**
 * Retrieves the template config, falling back to "royal" if unknown.
 */
export function getTemplateConfig(templateId: string): TemplateConfig {
  return TEMPLATE_CONFIGS[templateId] || TEMPLATE_CONFIGS["royal"];
}
