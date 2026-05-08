"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Stage, Layer, Rect, Text, Line, Image as KonvaImage, Group } from "react-konva";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { translations } from "@/lib/translations";
import { processPDFField } from "@/lib/pdf-data-utils";
import { loadKonvaFonts, getKonvaFontFamily } from "@/lib/konva-fonts";
import {
  getTemplateConfig,
  getFrameImageUrl,
  type FrameSvgConfig,
  type FrameImageConfig,
  type TemplateConfig,
} from "@/lib/frame-config";
import type { BiodataFormValues } from "@/types/biodata";
import useImage from "use-image";

// ── Props ──────────────────────────────────────────────────────────
interface KonvaPreviewProps {
  /** Live form data from useWatch() — when provided, overrides the store */
  liveFormData?: BiodataFormValues;
  /** Template ID — when provided, overrides the store */
  templateId?: string;
}

// ── A4 at 72 DPI (matches @react-pdf/renderer) ────────────────────
const A4_W = 595;
const A4_H = 842;

// ════════════════════════════════════════════════════════════════════
// HELPER: measure text for wrapping estimation
// ════════════════════════════════════════════════════════════════════
function measureText(
  text: string,
  fontSize: number,
  fontFamily: string,
  fontStyle: string = "normal"
): number {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.length * fontSize * 0.6;
  ctx.font = `${fontStyle} ${fontSize}px "${fontFamily}"`;
  return ctx.measureText(text).width;
}

// ════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS: images
// ════════════════════════════════════════════════════════════════════

function PhotoImage({
  src, x, y, width, height, cornerRadius,
}: {
  src: string; x: number; y: number; width: number; height: number; cornerRadius: number;
}) {
  const [image] = useImage(src, "anonymous");
  if (!image) return null;
  return (
    <KonvaImage image={image} x={x} y={y} width={width} height={height} cornerRadius={cornerRadius} />
  );
}

function LogoImage({ src, x, y, size }: { src: string; x: number; y: number; size: number }) {
  const [image] = useImage(src, "anonymous");
  if (!image) return null;
  return <KonvaImage image={image} x={x} y={y} width={size} height={size} />;
}

// ════════════════════════════════════════════════════════════════════
// DYNAMIC FRAME: image-based (Cloudinary with color tinting)
// ════════════════════════════════════════════════════════════════════

function ImageFrame({
  config,
  primaryColor,
  hasPhoto,
  photoConfig,
}: {
  config: FrameImageConfig;
  primaryColor: string;
  hasPhoto: boolean;
  photoConfig: TemplateConfig["photo"];
}) {
  const url = getFrameImageUrl(config, primaryColor);
  const [image] = useImage(url, "anonymous");

  return (
    <Group>
      {/* Background behind image (for transparent PNGs) */}
      <Rect x={0} y={0} width={A4_W} height={A4_H} fill={config.bgColor} />

      {/* Frame image — fills full A4 */}
      {image && (
        <KonvaImage image={image} x={0} y={0} width={A4_W} height={A4_H} />
      )}

      {/* Photo frame placeholder */}
      {hasPhoto && (
        <Rect
          x={photoConfig.x}
          y={photoConfig.y}
          width={photoConfig.width + 1}
          height={photoConfig.height + 1}
          stroke={primaryColor}
          strokeWidth={2}
          fill="#fff"
          cornerRadius={photoConfig.cornerRadius}
        />
      )}
    </Group>
  );
}

// ════════════════════════════════════════════════════════════════════
// DYNAMIC FRAME: SVG-drawn (Konva shapes)
// ════════════════════════════════════════════════════════════════════

function SvgFrame({
  config,
  primaryColor,
  accentColor,
  hasPhoto,
  photoConfig,
}: {
  config: FrameSvgConfig;
  primaryColor: string;
  accentColor: string;
  hasPhoto: boolean;
  photoConfig: TemplateConfig["photo"];
}) {
  const oi = config.outerInset;
  const ii = config.innerInset;

  return (
    <Group>
      {/* Background */}
      <Rect x={0} y={0} width={A4_W} height={A4_H} fill={config.bgColor} />

      {/* Outer Border */}
      <Rect
        x={oi}
        y={oi}
        width={A4_W - oi * 2}
        height={A4_H - oi * 2}
        stroke={primaryColor}
        strokeWidth={config.outerStrokeWidth}
        cornerRadius={config.outerCornerRadius}
      />

      {/* Inner Border */}
      <Rect
        x={ii}
        y={ii}
        width={A4_W - ii * 2}
        height={A4_H - ii * 2}
        stroke={accentColor}
        strokeWidth={config.innerStrokeWidth}
        cornerRadius={config.innerCornerRadius}
      />

      {/* Decorative corner curves */}
      {config.hasCornerCurves && (
        <>
          {/* Top Left */}
          <Line
            points={[oi + 20, oi + 75, oi + 20, oi + 40, oi + 40, oi + 20, oi + 75, oi + 20]}
            stroke={primaryColor}
            strokeWidth={4}
            tension={0.5}
            lineCap="round"
          />
          {/* Top Right */}
          <Line
            points={[
              A4_W - oi - 20, oi + 75,
              A4_W - oi - 20, oi + 40,
              A4_W - oi - 40, oi + 20,
              A4_W - oi - 75, oi + 20,
            ]}
            stroke={primaryColor}
            strokeWidth={4}
            tension={0.5}
            lineCap="round"
          />
          {/* Bottom Left */}
          <Line
            points={[
              oi + 20, A4_H - oi - 75,
              oi + 20, A4_H - oi - 40,
              oi + 40, A4_H - oi - 20,
              oi + 75, A4_H - oi - 20,
            ]}
            stroke={primaryColor}
            strokeWidth={4}
            tension={0.5}
            lineCap="round"
          />
          {/* Bottom Right */}
          <Line
            points={[
              A4_W - oi - 20, A4_H - oi - 75,
              A4_W - oi - 20, A4_H - oi - 40,
              A4_W - oi - 40, A4_H - oi - 20,
              A4_W - oi - 75, A4_H - oi - 20,
            ]}
            stroke={primaryColor}
            strokeWidth={4}
            tension={0.5}
            lineCap="round"
          />
        </>
      )}

      {/* Photo frame placeholder */}
      {hasPhoto && (
        <Rect
          x={photoConfig.x}
          y={photoConfig.y}
          width={photoConfig.width + 1}
          height={photoConfig.height + 1}
          stroke={primaryColor}
          strokeWidth={2}
          fill="#fff"
          cornerRadius={photoConfig.cornerRadius}
        />
      )}
    </Group>
  );
}

// ════════════════════════════════════════════════════════════════════
// DYNAMIC FRAME DISPATCHER
// ════════════════════════════════════════════════════════════════════

function DynamicFrame({
  templateConfig,
  primaryColor,
  accentColor,
  hasPhoto,
}: {
  templateConfig: TemplateConfig;
  primaryColor: string;
  accentColor: string;
  hasPhoto: boolean;
}) {
  const { frame, photo } = templateConfig;

  if (frame.type === "image") {
    return (
      <ImageFrame
        config={frame}
        primaryColor={primaryColor}
        hasPhoto={hasPhoto}
        photoConfig={photo}
      />
    );
  }

  return (
    <SvgFrame
      config={frame}
      primaryColor={primaryColor}
      accentColor={accentColor}
      hasPhoto={hasPhoto}
      photoConfig={photo}
    />
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════

export function KonvaPreview({ liveFormData, templateId }: KonvaPreviewProps) {
  const { formData: storeFormData, selectedTemplate: storeTemplate } = useBiodataStore();
  const theme = useThemeStore();

  // Prefer live props over store data for instant updates
  const formData = (liveFormData || storeFormData) as BiodataFormValues;
  const selectedTemplate = templateId || storeTemplate;

  // ── Resolve template config ─────────────────────────────────────
  const templateConfig = getTemplateConfig(selectedTemplate);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [fontsReady, setFontsReady] = useState(false);
  const [fontTick, setFontTick] = useState(0);

  // ── Design tokens (palette-aware with template defaults) ────────
  const primaryColor =
    theme.selectedPaletteName === null
      ? templateConfig.defaultPrimary
      : theme.primaryColor;
  const secondaryColor =
    theme.selectedPaletteName === null
      ? templateConfig.defaultSecondary
      : theme.secondaryColor;
  const accentColor =
    theme.selectedPaletteName === null
      ? templateConfig.defaultAccent
      : theme.accentColor;
  const baseFontSize = theme.fontSize || 11;
  const padding =
    theme.padding !== undefined
      ? theme.padding
      : templateConfig.defaultPadding;

  const fontFamily = getKonvaFontFamily(theme.fontFamily);

  // ── Load fonts ───────────────────────────────────────────────────
  useEffect(() => {
    const families = [fontFamily, "Noto Sans Devanagari"];
    loadKonvaFonts(families).then(() => {
      setFontsReady(true);
      setFontTick((t) => t + 1);
    });
  }, [fontFamily]);

  // ── Responsive scaling ──────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setScale(width / A4_W);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Translation ─────────────────────────────────────────────────
  const currentLang = formData.language || "English";
  const t = translations[currentLang] || translations["English"];

  // ── Build field rows ────────────────────────────────────────────
  const renderSectionData = useCallback(
    (title: string, fields: any[]) => {
      if (!fields || fields.length === 0) return null;
      const hasValues = fields.some((f: any) => f.value && f.type !== "hidden");
      if (!hasValues) return null;

      const processedFields = fields
        .map((field: any) => {
          const { displayLabel, displayValue, logoUrl, shouldSkip } =
            processPDFField(field, fields, formData, t);
          if (shouldSkip) return null;
          return { id: field.id, displayLabel, displayValue, logoUrl };
        })
        .filter(Boolean);

      if (processedFields.length === 0) return null;
      return { title, fields: processedFields };
    },
    [formData, t]
  );

  const sections = useMemo(() => {
    return [
      renderSectionData(t.personal || "Personal Details", formData.personalDetails),
      renderSectionData(t.educationSec || "Education & Career", formData.educationDetails),
      renderSectionData(t.family || "Family Background", formData.familyDetails),
      renderSectionData(t.contact || "Contact Details", formData.contactDetails),
    ].filter(Boolean) as {
      title: string;
      fields: {
        id: string;
        displayLabel: string;
        displayValue: string;
        logoUrl?: string;
      }[];
    }[];
  }, [renderSectionData, formData, t]);

  // ── Compute Y positions (layout engine) ─────────────────────────
  const layout = useMemo(() => {
    let cursorY = padding;

    // Header: mantra + title
    const headerItems: {
      type: "mantra" | "title";
      text: string;
      y: number;
      fontSize: number;
      fontFamily: string;
    }[] = [];

    if (formData.mantra) {
      headerItems.push({
        type: "mantra",
        text: formData.mantra,
        y: cursorY,
        fontSize: 14,
        fontFamily: "Noto Sans Devanagari",
      });
      cursorY += 22;
    }
    if (formData.title) {
      headerItems.push({
        type: "title",
        text: formData.title.toUpperCase(),
        y: cursorY,
        fontSize: Math.round(baseFontSize * 2.2),
        fontFamily: fontFamily,
      });
      cursorY += Math.round(baseFontSize * 2.2) + 14;
    }
    cursorY += 20; // header bottom margin

    // Sections
    const LABEL_WIDTH = 130;
    const COLON_WIDTH = 15;
    const contentWidth = A4_W - padding * 2 - 10;
    const valueWidth = contentWidth - LABEL_WIDTH - COLON_WIDTH;

    type SectionLayout = {
      titleText: string;
      titleY: number;
      fields: {
        id: string;
        label: string;
        value: string;
        logoUrl?: string;
        y: number;
      }[];
    };

    const sectionLayouts: SectionLayout[] = [];

    for (const sec of sections) {
      const titleY = cursorY;
      cursorY += Math.round(baseFontSize * 1.4) + 14;

      const fieldLayouts: SectionLayout["fields"] = [];

      for (const field of sec.fields) {
        const fieldY = cursorY;
        const valueTextWidth = fontsReady
          ? measureText(field.displayValue, baseFontSize, fontFamily)
          : field.displayValue.length * baseFontSize * 0.55;
        const lineCount = Math.max(1, Math.ceil(valueTextWidth / valueWidth));
        const rowHeight = Math.max(baseFontSize * 1.5 * lineCount, baseFontSize * 1.5);

        fieldLayouts.push({
          id: field.id,
          label: field.displayLabel,
          value: field.displayValue,
          logoUrl: field.logoUrl,
          y: fieldY,
        });

        cursorY += rowHeight + 4;
      }

      sectionLayouts.push({ titleText: sec.title, titleY, fields: fieldLayouts });
      cursorY += 10;
    }

    return { headerItems, sectionLayouts };
  }, [sections, formData, baseFontSize, fontFamily, padding, fontsReady, fontTick]);

  // ── Photo config from template ──────────────────────────────────
  const photoConfig = templateConfig.photo;

  // ── Render ──────────────────────────────────────────────────────
  const scaledHeight = A4_H * scale;

  return (
    <div
      ref={containerRef}
      className="w-full relative bg-white"
      style={{ aspectRatio: `${A4_W} / ${A4_H}` }}
    >
      <Stage
        width={A4_W * scale}
        height={scaledHeight}
        scaleX={scale}
        scaleY={scale}
        style={{ transformOrigin: "top left" }}
        listening={false}
      >
        <Layer>
          {/* ── Dynamic Frame ─────────────────────────────── */}
          <DynamicFrame
            templateConfig={templateConfig}
            primaryColor={primaryColor}
            accentColor={accentColor}
            hasPhoto={!!formData.photo}
          />

          {/* ── Header ────────────────────────────────────── */}
          {layout.headerItems.map((item) => (
            <Text
              key={item.type}
              x={padding + 40}
              y={item.y}
              width={A4_W - padding * 2 - 80}
              align="center"
              text={item.text}
              fontSize={item.fontSize}
              fontFamily={item.fontFamily}
              fontStyle="bold"
              fill={primaryColor}
              letterSpacing={item.type === "title" ? 2 : 0}
            />
          ))}

          {/* ── Photo ─────────────────────────────────────── */}
          {formData.photo && (
            <PhotoImage
              src={formData.photo}
              x={photoConfig.x}
              y={photoConfig.y}
              width={photoConfig.width}
              height={photoConfig.height}
              cornerRadius={photoConfig.cornerRadius}
            />
          )}

          {/* ── Sections ──────────────────────────────────── */}
          {layout.sectionLayouts.map((sec, si) => (
            <Group key={si}>
              {/* Section title left border */}
              <Line
                points={[
                  padding,
                  sec.titleY,
                  padding,
                  sec.titleY + Math.round(baseFontSize * 1.4) + 4,
                ]}
                stroke={primaryColor}
                strokeWidth={4}
                lineCap="round"
              />
              {/* Section title text */}
              <Text
                x={padding + 10}
                y={sec.titleY + 2}
                text={sec.titleText}
                fontSize={Math.round(baseFontSize * 1.4)}
                fontFamily={fontFamily}
                fontStyle="bold"
                fill={primaryColor}
              />

              {/* Field rows */}
              {sec.fields.map((field) => (
                <Group key={field.id}>
                  {/* Label */}
                  <Text
                    x={padding + 10}
                    y={field.y}
                    width={130}
                    text={field.label}
                    fontSize={baseFontSize}
                    fontFamily={fontFamily}
                    fontStyle="bold"
                    fill={secondaryColor}
                  />
                  {/* Colon */}
                  <Text
                    x={padding + 140}
                    y={field.y}
                    text=":"
                    fontSize={baseFontSize}
                    fontFamily={fontFamily}
                    fill={secondaryColor}
                  />
                  {/* Logo (if any) */}
                  {field.logoUrl && (
                    <LogoImage
                      src={field.logoUrl}
                      x={padding + 158}
                      y={field.y}
                      size={14}
                    />
                  )}
                  {/* Value */}
                  <Text
                    x={padding + (field.logoUrl ? 176 : 158)}
                    y={field.y}
                    width={A4_W - padding * 2 - (field.logoUrl ? 186 : 168)}
                    text={field.logoUrl ? `(${field.value})` : field.value}
                    fontSize={baseFontSize}
                    fontFamily={fontFamily}
                    fill="#000"
                    wrap="word"
                  />
                </Group>
              ))}
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
