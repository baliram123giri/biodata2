"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Stage, Layer, Rect, Text, Line, Image as KonvaImage, Group, Path } from "react-konva";
import { useBiodataStore, type Sticker } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { STICKER_ASSETS } from "@/lib/sticker-assets";
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
import Konva from "konva";

// ── Props ──────────────────────────────────────────────────────────
interface KonvaPreviewProps {
  liveFormData?: BiodataFormValues;
  templateId?: string;
  scale?: number;
  isDesigner?: boolean;
}

const A4_W = 595;
const A4_H = 842;

// ════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════

function PhotoImage({ src, x, y, width, height, cornerRadius }: { src: string; x: number; y: number; width: number; height: number; cornerRadius: number; }) {
  const [image] = useImage(src, "anonymous");
  return image ? <KonvaImage image={image} x={x} y={y} width={width} height={height} cornerRadius={cornerRadius} /> : null;
}

function LogoImage({ src, x, y, size }: { src: string; x: number; y: number; size: number }) {
  const [image] = useImage(src, "anonymous");
  return image ? <KonvaImage image={image} x={x} y={y} width={size} height={size} /> : null;
}

function ImageFrame({ config, primaryColor, hasPhoto, photoConfig }: { config: FrameImageConfig; primaryColor: string; hasPhoto: boolean; photoConfig: TemplateConfig["photo"]; }) {
  const frameUrl = getFrameImageUrl(config, primaryColor);
  const [image] = useImage(frameUrl, "anonymous");
  return (
    <Group>
      <Rect width={A4_W} height={A4_H} fill={config.bgColor || "#ffffff"} />
      {image && <KonvaImage image={image} width={A4_W} height={A4_H} />}
      {hasPhoto && photoConfig && (
        <Rect x={photoConfig.x - 2} y={photoConfig.y - 2} width={photoConfig.width + 4} height={photoConfig.height + 4} fill={primaryColor} cornerRadius={photoConfig.cornerRadius} />
      )}
    </Group>
  );
}

function StickerItem({ 
  sticker, 
  color, 
  isDesigner, 
  isSelected, 
  onClick 
}: { 
  sticker: Sticker; 
  color: string; 
  isDesigner: boolean; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const { updateSticker } = useBiodataStore();
  const asset = STICKER_ASSETS.find(a => a.id === sticker.type);
  if (!asset) return null;

  return (
    <Group 
      x={sticker.x} 
      y={sticker.y} 
      draggable={isDesigner}
      onDragEnd={(e) => {
        updateSticker(sticker.id, { x: e.target.x(), y: e.target.y() });
      }}
      onClick={onClick}
      onTap={onClick}
    >
      {isSelected && (
        <Rect
          width={100 * sticker.scale}
          height={100 * sticker.scale}
          stroke="#D4AF37"
          strokeWidth={2}
          dash={[5, 5]}
        />
      )}
      <Path
        data={asset.path}
        scaleX={sticker.scale}
        scaleY={sticker.scale}
        fill={color}
        onMouseEnter={(e) => {
          if (isDesigner) {
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = 'move';
          }
        }}
        onMouseLeave={(e) => {
          if (isDesigner) {
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = 'grab';
          }
        }}
      />
    </Group>
  );
}

function SvgFrame({ config, primaryColor }: { config: FrameSvgConfig; primaryColor: string; }) {
  return (
    <Group>
      <Rect width={A4_W} height={A4_H} fill={config.bgColor || "#ffffff"} />
      <Rect x={config.outerInset} y={config.outerInset} width={A4_W - config.outerInset * 2} height={A4_H - config.outerInset * 2} stroke={primaryColor} strokeWidth={config.outerStrokeWidth} cornerRadius={config.outerCornerRadius} />
      <Rect x={config.innerInset} y={config.innerInset} width={A4_W - config.innerInset * 2} height={A4_H - config.innerInset * 2} stroke={primaryColor} strokeWidth={config.innerStrokeWidth} cornerRadius={config.innerCornerRadius} opacity={0.6} />
    </Group>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export function KonvaPreview({ liveFormData, templateId, scale: propScale, isDesigner = false }: KonvaPreviewProps) {
  const { formData: storeFormData, selectedTemplate: storeTemplate, removeSticker } = useBiodataStore();
  const theme = useThemeStore();
  const formData = liveFormData || storeFormData;
  const selectedTemplate = templateId || storeTemplate;
  const templateConfig = getTemplateConfig(selectedTemplate);

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [stageSize, setStageSize] = useState({ width: A4_W, height: A4_H });
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(propScale || 1);
  const [fontsReady, setFontsReady] = useState(false);
  const [fontTick, setFontTick] = useState(0);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedSticker) {
        removeSticker(selectedSticker);
        setSelectedSticker(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedSticker, removeSticker]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const { width, height } = el.getBoundingClientRect();
      setStageSize({ width, height });
      if (!isDesigner || (stagePos.x === 0 && stagePos.y === 0)) {
        const initialScale = Math.min(width / (A4_W + 40), height / (A4_H + 40));
        if (!propScale) setScale(initialScale);
        setStagePos({ x: (width - A4_W * (propScale || initialScale)) / 2, y: (height - A4_H * (propScale || initialScale)) / 2 });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isDesigner, propScale, stagePos.x, stagePos.y]);

  useEffect(() => { if (propScale !== undefined) setScale(propScale); }, [propScale]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    if (!isDesigner) return;
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const speed = 0.05;
    const newScale = e.evt.deltaY > 0 ? oldScale * (1 - speed) : oldScale * (1 + speed);
    const clampedScale = Math.min(Math.max(newScale, 0.2), 3);
    setScale(clampedScale);
    setStagePos({ x: pointer.x - mousePointTo.x * clampedScale, y: pointer.y - mousePointTo.y * clampedScale });
  };

  const primaryColor = theme.selectedPaletteName === null ? templateConfig.defaultPrimary : theme.primaryColor;
  const secondaryColor = theme.selectedPaletteName === null ? templateConfig.defaultSecondary : theme.secondaryColor;
  const accentColor = theme.selectedPaletteName === null ? templateConfig.defaultAccent : theme.accentColor;
  const baseFontSize = theme.fontSize || 11;
  const padding = theme.padding !== undefined ? theme.padding : templateConfig.defaultPadding;
  const fontFamily = getKonvaFontFamily(theme.fontFamily);

  useEffect(() => {
    loadKonvaFonts([fontFamily, "Noto Sans Devanagari"]).then(() => {
      setFontsReady(true);
      setFontTick(t => t + 1);
    });
  }, [fontFamily]);

  const currentLang = formData.language || "English";
  const t = translations[currentLang] || translations["English"];

  const renderSectionData = useCallback((title: string, fields: any[]) => {
    if (!fields || fields.length === 0) return null;
    const hasValues = fields.some((f: any) => f.value && f.type !== "hidden");
    if (!hasValues) return null;
    const processedFields = fields.map(f => processPDFField(f, fields, formData, t)).filter(f => !f.shouldSkip && f.displayValue && f.displayValue !== "Not Specified");
    return { title, fields: processedFields };
  }, [formData, t]);

  const sections = useMemo(() => [
    renderSectionData(t.personal || "Personal Details", formData.personalDetails),
    renderSectionData(t.family || "Family Details", formData.familyDetails),
    renderSectionData(t.education || "Education & Work", formData.educationDetails),
    renderSectionData(t.contact || "Contact Details", formData.contactDetails),
  ].filter(Boolean), [renderSectionData, formData, t]);

  const layout = useMemo(() => {
    const calculateForSize = (fSize: number) => {
      let cursorY = padding + 20; // Extra room for Mantra
      
      // 1. Calculate Mantra & Title Height
      if (formData.mantra) cursorY += fSize * 2;
      if (formData.title) cursorY += fSize * 2.5;

      const LABEL_WIDTH = 130;
      const COLON_WIDTH = 20;
      const LINE_SPACING = fSize * 0.5;
      const contentWidth = A4_W - padding * 2 - 10;
      const valueWidth = contentWidth - LABEL_WIDTH - COLON_WIDTH;
      const sectionLayouts: any[] = [];
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const measure = (text: string, size: number) => {
        if (!ctx) return text.length * size * 0.6;
        ctx.font = `bold ${size}px "${fontFamily}"`;
        return ctx.measureText(text).width;
      };

      for (const sec of sections as any[]) {
        const titleY = cursorY;
        cursorY += Math.round(fSize * 1.4) + LINE_SPACING;
        const fieldLayouts: any[] = [];
        for (const field of sec.fields) {
          const valText = String(field.displayValue);
          const valW = measure(valText, fSize);
          const lines = Math.ceil(valW / valueWidth) || 1;
          const rowHeight = Math.max(fSize, lines * fSize * 1.1);
          fieldLayouts.push({ id: field.id, label: field.displayLabel, value: valText, logoUrl: field.logoUrl, y: cursorY });
          cursorY += rowHeight + LINE_SPACING;
        }
        sectionLayouts.push({ titleText: sec.title, titleY, fields: fieldLayouts });
        cursorY += fSize * 1.5;
      }
      return { sectionLayouts, totalHeight: cursorY };
    };
    const MAX_H = A4_H - padding;
    let bestSize = baseFontSize;
    let finalLayout = calculateForSize(bestSize);
    if (finalLayout.totalHeight > MAX_H) {
      for (let s = baseFontSize - 0.5; s >= 7; s -= 0.5) {
        const test = calculateForSize(s);
        if (test.totalHeight <= MAX_H) { bestSize = s; finalLayout = test; break; }
        bestSize = s; finalLayout = test;
      }
    }
    return { ...finalLayout, fSize: bestSize };
  }, [sections, padding, baseFontSize, fontFamily, fontTick, formData.mantra, formData.title]);

  const hasPhoto = !!formData.photo;
  const photoConfig = templateConfig.photo;

  return (
    <div ref={containerRef} className="w-full h-full bg-[#f5f0eb] relative overflow-hidden">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
        draggable={isDesigner}
        onWheel={handleWheel}
        onDragStart={e => {
          if (e.target === e.currentTarget) {
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = 'grabbing';
          }
        }}
        onDragEnd={e => {
          if (e.target === e.currentTarget) {
            setStagePos({ x: e.target.x(), y: e.target.y() });
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = 'grab';
          }
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedSticker(null);
          }
        }}
        style={{ cursor: isDesigner ? 'grab' : 'default' }}
      >
        <Layer listening={false}>
          <Rect x={4} y={4} width={A4_W} height={A4_H} fill="#000000" opacity={0.1} cornerRadius={2} />
          {templateConfig.frame.type === "image" ? (
            <ImageFrame config={templateConfig.frame} primaryColor={primaryColor} hasPhoto={hasPhoto} photoConfig={photoConfig} />
          ) : (
            <SvgFrame config={templateConfig.frame as FrameSvgConfig} primaryColor={primaryColor} />
          )}
          <Text x={A4_W / 2} y={A4_H - 30} text="www.biodatamaker.online" fontSize={8} fontFamily="Inter" fill="#cccccc" align="center" offsetX={50} />
        </Layer>
        <Layer>
          {fontsReady && (
            <Group>
              {/* Mantra Rendering */}
              {formData.mantra && (
                <Text
                  x={A4_W / 2}
                  y={padding + 10}
                  text={formData.mantra}
                  fontSize={layout.fSize * 1.2}
                  fontFamily={fontFamily}
                  fontStyle="bold"
                  fill={primaryColor}
                  align="center"
                  width={A4_W}
                  offsetX={A4_W / 2}
                />
              )}

              {/* Title Rendering */}
              {formData.title && (
                <Text
                  x={A4_W / 2}
                  y={padding + 10 + (formData.mantra ? layout.fSize * 2 : 0)}
                  text={formData.title}
                  fontSize={layout.fSize * 2}
                  fontFamily={fontFamily}
                  fontStyle="bold"
                  fill={primaryColor}
                  align="center"
                  width={A4_W}
                  offsetX={A4_W / 2}
                />
              )}

              {layout.sectionLayouts.map((sec: any) => (
                <Group key={sec.titleText}>
                  <Line points={[padding, sec.titleY + 15, padding + 5, sec.titleY + 15]} stroke={accentColor || primaryColor} strokeWidth={3} lineCap="round" />
                  <Text x={padding + 10} y={sec.titleY + 2} text={sec.titleText} fontSize={Math.round(layout.fSize * 1.4)} fontFamily={fontFamily} fontStyle="bold" fill={primaryColor} />
                  {sec.fields.map((field: any) => (
                    <Group key={field.id}>
                      <Text x={padding + 10} y={field.y} width={130} text={field.label} fontSize={layout.fSize} fontFamily={fontFamily} fontStyle="bold" fill={secondaryColor} />
                      <Text x={padding + 140} y={field.y} text=":" fontSize={layout.fSize} fontFamily={fontFamily} fill={secondaryColor} />
                      <Text x={padding + 155} y={field.y} width={A4_W - padding * 2 - 165} text={field.value} fontSize={layout.fSize} fontFamily={fontFamily} fill="#333333" lineHeight={1.1} />
                      {field.logoUrl && <LogoImage src={field.logoUrl} x={padding - 5} y={field.y} size={layout.fSize} />}
                    </Group>
                  ))}
                </Group>
              ))}
            </Group>
          )}

          {hasPhoto && photoConfig && (
            <PhotoImage src={formData.photo!} x={photoConfig.x} y={photoConfig.y} width={photoConfig.width} height={photoConfig.height} cornerRadius={photoConfig.cornerRadius} />
          )}

          {/* Stickers Rendering */}
          {formData.stickers?.map((sticker) => (
            <StickerItem 
              key={sticker.id} 
              sticker={sticker} 
              color={primaryColor} 
              isDesigner={isDesigner} 
              isSelected={selectedSticker === sticker.id}
              onClick={() => setSelectedSticker(sticker.id)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
