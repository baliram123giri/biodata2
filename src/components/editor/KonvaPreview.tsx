"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Pencil, Globe, User, Briefcase, Users, Phone, Palette, AlignLeft, AlignCenter, AlignRight, AlignStartVertical as AlignTop, AlignCenterVertical as AlignMiddle, AlignEndVertical as AlignBottom, Layers, ArrowUp, ArrowDown } from "lucide-react";
import { Stage, Layer, Rect, Text, Line, Image as KonvaImage, Group, Path, Transformer, Circle } from "react-konva";
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
  type FrameGradientConfig,
  type TemplateConfig,
} from "@/lib/frame-config";
import type { BiodataFormValues } from "@/types/biodata";
import useImage from "use-image";
import Konva from "konva";

if (typeof window !== "undefined") {
  // Force high-DPI crystal clear canvas rendering on all monitors and devices
  Konva.pixelRatio = Math.max(window.devicePixelRatio || 1, 2);
}

import { getLightBgColor } from "@/lib/color-utils";
import { WATERMARK_CONFIG, getWatermarkCoordinates } from "@/lib/watermark-utils";

// ── Props ──────────────────────────────────────────────────────────
interface KonvaPreviewProps {
  liveFormData?: BiodataFormValues & { stickers?: Sticker[]; layout?: any };
  templateId?: string;
  scale?: number;
  isDesigner?: boolean;
  resetKey?: number;
}

const A4_W = 595;
const A4_H = 842;

// ════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════

const PhotoImage = React.memo(function PhotoImage({ src, x, y, width, height, cornerRadius, borderColor }: { src: string; x: number; y: number; width: number; height: number; cornerRadius: number; borderColor: string; }) {
  const [image] = useImage(src, "anonymous");
  if (!image) return null;
  return (
    <Group>
      <KonvaImage image={image} x={x} y={y} width={width} height={height} cornerRadius={cornerRadius} />
      {borderColor && (
        <Rect
          x={x}
          y={y}
          width={width}
          height={height}
          cornerRadius={cornerRadius}
          stroke={borderColor}
          strokeWidth={2}
          listening={false}
        />
      )}
    </Group>
  );
});

const LogoImage = React.memo(function LogoImage({ src, x, y, size }: { src: string; x: number; y: number; size: number }) {
  // Add cache-busting to bypass browser CORS cache conflicts between img and canvas tags
  const cacheBustedSrc = src.includes("?") ? `${src}&canvas=true` : `${src}?canvas=true`;
  const [image] = useImage(cacheBustedSrc, "anonymous");
  return image ? <KonvaImage image={image} x={x} y={y} width={size} height={size} /> : null;
});

const StickerImage = React.memo(function StickerImage({ src }: { src: string }) {
  const [image] = useImage(src, "anonymous");
  return image ? <KonvaImage image={image} width={100} height={100} /> : null;
});

const CustomKonvaFrame = React.memo(function CustomKonvaFrame({ componentId, primaryColor }: { componentId: string; primaryColor: string }) {
  return null;
});

const GlobalWatermark = React.memo(function GlobalWatermark({ visible = false }: { visible?: boolean }) {
  const [watermarkImg] = useImage(WATERMARK_CONFIG.url, "anonymous");
  if (!watermarkImg || !WATERMARK_CONFIG.isEnabled) return null;
  
  const coords = getWatermarkCoordinates(A4_W, A4_H);
  
  return (
    <KonvaImage
      id="watermark"
      image={watermarkImg}
      x={A4_W / 2}
      y={A4_H / 2}
      width={coords.width}
      height={coords.height}
      offsetX={coords.width / 2}
      offsetY={coords.height / 2}
      rotation={WATERMARK_CONFIG.rotation || 0}
      opacity={WATERMARK_CONFIG.opacity}
      visible={visible}
    />
  );
});

const BgWatermarkImage = React.memo(function BgWatermarkImage({ 
  bgConfig 
}: { 
  bgConfig?: TemplateConfig["bgConfig"] 
}) {
  const [image] = useImage(bgConfig?.url || "", "anonymous");
  if (!bgConfig?.url || !image) return null;
  
  return (
    <KonvaImage
      image={image}
      x={bgConfig.x}
      y={bgConfig.y}
      width={bgConfig.width}
      height={bgConfig.height}
      opacity={bgConfig.opacity}
      listening={false}
    />
  );
});

const PageBackground = React.memo(function PageBackground({ 
  templateConfig, 
  themeBgColors, 
  themeSelectedPalette,
  primaryColor
}: { 
  templateConfig: TemplateConfig; 
  themeBgColors: string[]; 
  themeSelectedPalette: string | null;
  primaryColor: string;
}) {
  // 1. If a theme palette is selected and has a custom background gradient (length > 1), respect the palette background settings
  if (themeSelectedPalette !== null && themeBgColors && themeBgColors.length > 1) {
    return (
      <Rect 
        width={A4_W} 
        height={A4_H} 
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: A4_H }}
        fillLinearGradientColorStops={
          themeBgColors.flatMap((color, i, arr) => [i / (arr.length - 1), color])
        }
      />
    );
  }

  // 2. Otherwise, check if the template itself has a gradient background (linear or radial)
  const bgType = templateConfig.bgType || "solid";
  const bgGradientColors = templateConfig.bgGradientColors || [];
  
  if ((bgType === "linear" || bgType === "radial") && bgGradientColors.length > 1) {
    if (bgType === "linear") {
      return (
        <Rect 
          width={A4_W} 
          height={A4_H} 
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 0, y: A4_H }}
          fillLinearGradientColorStops={
            bgGradientColors.flatMap((color, i, arr) => [i / (arr.length - 1), color])
          }
        />
      );
    } else {
      return (
        <Rect 
          width={A4_W} 
          height={A4_H} 
          fillRadialGradientStartPoint={{ x: A4_W / 2, y: A4_H / 2 }}
          fillRadialGradientStartRadius={0}
          fillRadialGradientEndPoint={{ x: A4_W / 2, y: A4_H / 2 }}
          fillRadialGradientEndRadius={Math.max(A4_W, A4_H) / 2}
          fillRadialGradientColorStops={
            bgGradientColors.flatMap((color, i, arr) => [i / (arr.length - 1), color])
          }
        />
      );
    }
  }

  // Static template gradient frame fallback
  if (templateConfig.frame.type === "gradient") {
    const gradColors = (templateConfig.frame as FrameGradientConfig).gradientColors || [];
    if (gradColors.length > 1) {
      return (
        <Rect 
          width={A4_W} 
          height={A4_H} 
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: A4_W, y: 0 }}
          fillLinearGradientColorStops={
            gradColors.flatMap((color, i, arr) => [i / (arr.length - 1), color])
          }
        />
      );
    }
  }

  // 3. If neither the theme nor the template has a gradient background, apply the theme solid fallback if selected
  if (themeSelectedPalette !== null) {
    const lightBg = getLightBgColor(primaryColor);
    return <Rect width={A4_W} height={A4_H} fill={lightBg} />;
  }

  // 4. Default template solid background fallback
  const solidColor = (templateConfig.frame as any).bgColor || "#ffffff";
  return <Rect width={A4_W} height={A4_H} fill={solidColor} />;
});

const ImageFrame = React.memo(function ImageFrame({ config, primaryColor, hasPhoto, photoConfig }: { config: FrameImageConfig; primaryColor: string; hasPhoto: boolean; photoConfig: TemplateConfig["photo"]; }) {
  const frameUrl = getFrameImageUrl(config, primaryColor);
  const [image] = useImage(frameUrl, "anonymous");
  return (
    <Group>
      {image && <KonvaImage image={image} width={A4_W} height={A4_H} />}
      {hasPhoto && photoConfig && photoConfig.showBorder !== false && (
        <Rect x={photoConfig.x - 2} y={photoConfig.y - 2} width={photoConfig.width + 4} height={photoConfig.height + 4} fill={primaryColor} cornerRadius={photoConfig.cornerRadius} />
      )}
    </Group>
  );
});

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
  onClick: (e: any) => void;
}) {
  const { updateSticker, addSticker } = useBiodataStore();
  const asset = STICKER_ASSETS.find(a => a.id === sticker.type);
  const groupRef = useRef<Konva.Group>(null);
  
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  if (!asset) return null;



  return (
    <Group 
      ref={groupRef}
      name={sticker.id}
      x={sticker.x} 
      y={sticker.y} 
      scaleX={sticker.scaleX}
      scaleY={sticker.scaleY}
      rotation={sticker.rotation || 0}
      width={100}
      height={100}
      draggable={isDesigner && (!isMobile || isSelected)}
      onDragStart={(e) => {
        if (isDesigner) {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = 'grabbing';
          
          // Duplicate sticker if Alt key is pressed
          if (e.evt.altKey) {
            addSticker({
              type: sticker.type,
              x: sticker.x,
              y: sticker.y,
              scaleX: sticker.scaleX,
              scaleY: sticker.scaleY,
              rotation: sticker.rotation,
            });
          }
        }
      }}
      onDragEnd={(e) => {
        updateSticker(sticker.id, { x: e.target.x(), y: e.target.y() });
        if (isDesigner) {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = 'move';
        }
      }}
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
      onTransformEnd={() => {
        const node = groupRef.current;
        if (!node) return;
        updateSticker(sticker.id, {
          x: node.x(),
          y: node.y(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation(),
        });
      }}
      onClick={onClick}
      onTap={onClick}
    >
      {asset.type === 'image' ? (
        <StickerImage src={asset.url!} />
      ) : (
        <Path
          data={asset.path!}
          fill={color}
        />
      )}
    </Group>
  );
}

const SvgFrame = React.memo(function SvgFrame({ config, primaryColor }: { config: FrameSvgConfig; primaryColor: string; }) {
  return (
    <Group>
      <Rect x={config.outerInset} y={config.outerInset} width={A4_W - config.outerInset * 2} height={A4_H - config.outerInset * 2} stroke={primaryColor} strokeWidth={config.outerStrokeWidth} cornerRadius={config.outerCornerRadius} />
      <Rect x={config.innerInset} y={config.innerInset} width={A4_W - config.innerInset * 2} height={A4_H - config.innerInset * 2} stroke={primaryColor} strokeWidth={config.innerStrokeWidth} cornerRadius={config.innerCornerRadius} opacity={0.6} />
    </Group>
  );
});

const GradientFrame = React.memo(function GradientFrame({ config, primaryColor }: { config: FrameGradientConfig; primaryColor: string; }) {
  return (
    <Group>
      <Rect 
        x={config.outerInset} 
        y={config.outerInset} 
        width={A4_W - config.outerInset * 2} 
        height={A4_H - config.outerInset * 2} 
        stroke={primaryColor} 
        strokeWidth={config.outerStrokeWidth} 
        cornerRadius={config.outerCornerRadius} 
      />
      <Rect 
        x={config.innerInset} 
        y={config.innerInset} 
        width={A4_W - config.innerInset * 2} 
        height={A4_H - config.innerInset * 2} 
        stroke={primaryColor} 
        strokeWidth={config.innerStrokeWidth} 
        cornerRadius={config.innerCornerRadius} 
        opacity={0.3}
      />
    </Group>
  );
});

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export function KonvaPreview({ liveFormData, templateId, scale: propScale, isDesigner = false, resetKey = 0 }: KonvaPreviewProps) {
  const { formData: storeFormData, selectedTemplate: storeTemplate, customTemplates, removeSticker, updateSticker } = useBiodataStore();
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
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const transformerRef = useRef<Konva.Transformer>(null);
  const lastDistRef = useRef<number | null>(null);
  const lastCenterRef = useRef<{ x: number; y: number } | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (selectedStickers.length > 0 && transformerRef.current && isDesigner) {
      const stage = transformerRef.current.getStage();
      const nodes = selectedStickers.map(id => stage?.findOne('.' + id)).filter(Boolean) as Konva.Node[];
      if (nodes.length > 0) {
        transformerRef.current.nodes(nodes);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else {
      transformerRef.current?.nodes([]);
    }
  }, [selectedStickers, isDesigner]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDesigner) return;
      
      // Delete selected
      if ((e.key === "Delete" || e.key === "Backspace") && selectedStickers.length > 0) {
        selectedStickers.forEach(id => removeSticker(id));
        setSelectedStickers([]);
      }

      // Select All (Ctrl+A)
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const allIds = formData.stickers?.map(s => s.id) || [];
        setSelectedStickers(allIds);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedStickers, removeSticker, isDesigner, formData.stickers]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const { width, height } = el.getBoundingClientRect();
      setStageSize({ width, height });
      if (!isDesigner || (stagePos.x === 0 && stagePos.y === 0)) {
        const initialScale = Math.min(width / A4_W, height / A4_H);
        if (!propScale) setScale(initialScale);
        setStagePos({ x: (width - A4_W * (propScale || initialScale)) / 2, y: (height - A4_H * (propScale || initialScale)) / 2 });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isDesigner, propScale]);

  useEffect(() => {
    if (propScale !== undefined) {
      setScale(propScale);
      const el = containerRef.current;
      if (el) {
        const { width, height } = el.getBoundingClientRect();
        setStagePos({
          x: (width - A4_W * propScale) / 2,
          y: (height - A4_H * propScale) / 2
        });
      }
    }
    // resetKey changes every time fit-to-screen is clicked, forcing
    // this effect to re-run even if propScale didn't change
  }, [propScale, resetKey]);

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

  useEffect(() => {
    let active = true;
    let container: HTMLDivElement | null = null;
    
    // Custom touch listener handlers
    let onTouchStartNative: any;
    let onTouchMoveNative: any;
    let onTouchEndNative: any;

    const setupTouchListeners = () => {
      const stage = stageRef.current;
      if (!stage) {
        if (active) setTimeout(setupTouchListeners, 50);
        return;
      }
      
      container = stage.container() as HTMLDivElement;
      if (!container) {
        if (active) setTimeout(setupTouchListeners, 50);
        return;
      }

      onTouchStartNative = (e: TouchEvent) => {
        const touches = e.touches;
        if (touches.length === 2) {
          e.preventDefault();
          const p1 = { x: touches[0].clientX, y: touches[0].clientY };
          const p2 = { x: touches[1].clientX, y: touches[1].clientY };
          const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
          lastDistRef.current = dist;
          
          const rect = container!.getBoundingClientRect();
          const centerX = ((p1.x + p2.x) / 2) - rect.left;
          const centerY = ((p1.y + p2.y) / 2) - rect.top;
          lastCenterRef.current = { x: centerX, y: centerY };
        }
      };

      onTouchMoveNative = (e: TouchEvent) => {
        const touches = e.touches;
        if (touches.length === 2 && lastDistRef.current !== null && lastCenterRef.current !== null) {
          e.preventDefault();
          const p1 = { x: touches[0].clientX, y: touches[0].clientY };
          const p2 = { x: touches[1].clientX, y: touches[1].clientY };
          const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
          
          const oldScale = stage.scaleX();
          const rect = container!.getBoundingClientRect();
          const centerX = ((p1.x + p2.x) / 2) - rect.left;
          const centerY = ((p1.y + p2.y) / 2) - rect.top;
          
          const ratio = dist / lastDistRef.current;
          const newScale = oldScale * ratio;
          const clampedScale = Math.min(Math.max(newScale, 0.4), 2.0);
          
          const stageX = stage.x();
          const stageY = stage.y();
          
          const mousePointTo = {
            x: (lastCenterRef.current.x - stageX) / oldScale,
            y: (lastCenterRef.current.y - stageY) / oldScale,
          };
          
          setScale(clampedScale);
          setStagePos({
            x: centerX - mousePointTo.x * clampedScale,
            y: centerY - mousePointTo.y * clampedScale,
          });
          
          lastDistRef.current = dist;
          lastCenterRef.current = { x: centerX, y: centerY };
        }
      };

      onTouchEndNative = () => {
        lastDistRef.current = null;
        lastCenterRef.current = null;
      };

      container.addEventListener("touchstart", onTouchStartNative, { passive: false });
      container.addEventListener("touchmove", onTouchMoveNative, { passive: false });
      container.addEventListener("touchend", onTouchEndNative, { passive: true });
    };

    setupTouchListeners();

    return () => {
      active = false;
      if (container) {
        container.removeEventListener("touchstart", onTouchStartNative);
        container.removeEventListener("touchmove", onTouchMoveNative);
        container.removeEventListener("touchend", onTouchEndNative);
      }
    };
  }, []);

  // ── JPG Export via Custom Event ──────────────────────────────────
  useEffect(() => {
    const handleExportJpg = () => {
      const stage = stageRef.current;
      if (!stage) return;

      // Save current transform
      const savedScale = stage.scaleX();
      const savedX = stage.x();
      const savedY = stage.y();

      // Reset to origin at 1:1 so the full A4 canvas is captured
      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 });
      stage.size({ width: A4_W, height: A4_H });

      // Programmatically hide the watermark node for the export capture
      const watermarkNode = stage.findOne("#watermark");
      if (watermarkNode) {
        watermarkNode.hide();
      }

      stage.batchDraw();

      const dataUrl = stage.toDataURL({
        mimeType: "image/jpeg",
        quality: 1.0, // Maximum lossless quality
        pixelRatio: 3, // 3x pixel ratio for extremely high resolution and crispness
      });

      // Keep it hidden to maintain clean editor view
      if (watermarkNode) {
        watermarkNode.hide();
      }

      // Restore previous transform
      stage.scale({ x: savedScale, y: savedScale });
      stage.position({ x: savedX, y: savedY });
      stage.size({ width: stageSize.width, height: stageSize.height });
      stage.batchDraw();

      window.dispatchEvent(new CustomEvent("biodata:jpg-ready", { detail: dataUrl }));
    };

    window.addEventListener("biodata:export-jpg", handleExportJpg);
    return () => window.removeEventListener("biodata:export-jpg", handleExportJpg);
  }, [stageSize]);

  // ── PNG Export via Custom Event ──────────────────────────────────
  useEffect(() => {
    const handleExportPng = () => {
      const stage = stageRef.current;
      if (!stage) return;

      // Save current transform
      const savedScale = stage.scaleX();
      const savedX = stage.x();
      const savedY = stage.y();

      // Reset to origin at 1:1 so the full A4 canvas is captured
      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 });
      stage.size({ width: A4_W, height: A4_H });

      // Programmatically hide the watermark node for the export capture
      const watermarkNode = stage.findOne("#watermark");
      if (watermarkNode) {
        watermarkNode.hide();
      }

      stage.batchDraw();

      const dataUrl = stage.toDataURL({
        mimeType: "image/png",
        pixelRatio: 3, // 3x pixel ratio for extremely high resolution and crispness
      });

      // Restore previous transform
      stage.scale({ x: savedScale, y: savedScale });
      stage.position({ x: savedX, y: savedY });
      stage.size({ width: stageSize.width, height: stageSize.height });
      stage.batchDraw();

      window.dispatchEvent(new CustomEvent("biodata:png-ready", { detail: dataUrl }));
    };

    window.addEventListener("biodata:export-png", handleExportPng);
    return () => window.removeEventListener("biodata:export-png", handleExportPng);
  }, [stageSize]);

  const primaryColor = theme.primaryColor;
  const secondaryColor = theme.secondaryColor;
  const accentColor = theme.accentColor;
  const baseFontSize = theme.fontSize || 11;
  const padding = theme.padding !== undefined ? theme.padding : templateConfig.defaultPadding;
  const paddingY = theme.paddingY !== undefined ? theme.paddingY : (templateConfig.defaultYPadding !== undefined ? templateConfig.defaultYPadding : padding);
  const fontFamily = getKonvaFontFamily(theme.fontFamily);

  const sectionOffsets = useMemo(() => {
    try { return JSON.parse(templateConfig.bgConfig?.sectionOffsets || "{}"); } catch { return {}; }
  }, [templateConfig.bgConfig?.sectionOffsets]);

  const sectionStyles = useMemo(() => {
    try { return JSON.parse(templateConfig.bgConfig?.sectionStyles || "{}"); } catch { return {}; }
  }, [templateConfig.bgConfig?.sectionStyles]);

  useEffect(() => {
    loadKonvaFonts([fontFamily, "Noto Sans Devanagari"]).then(() => {
      setFontsReady(true);
      setFontTick(t => t + 1);
    });
  }, [fontFamily]);

  const currentLang = formData.language || "English";
  const t = translations[currentLang] || translations["English"];

  const renderSectionData = useCallback((key: string, title: string, fields: any[]) => {
    if (!fields || fields.length === 0) return null;
    const hasValues = fields.some((f: any) => f.value && f.type !== "hidden");
    if (!hasValues) return null;
    const processedFields = fields.map(f => processPDFField(f, fields, formData, t)).filter(f => !f.shouldSkip && f.displayValue && f.displayValue !== "Not Specified");
    return { key, title, fields: processedFields };
  }, [formData, t]);

  const sections = useMemo(() => [
    renderSectionData("personal", t.personal || "Personal Details", formData.personalDetails),
    renderSectionData("educationSec", t.educationSec || "Education & Career", formData.educationDetails),
    renderSectionData("family", t.family || "Family Details", formData.familyDetails),
    renderSectionData("contact", t.contact || "Contact Details", formData.contactDetails),
  ].filter(Boolean) as any[], [renderSectionData, formData, t]);

  const hasPhoto = !!formData.photo;
  const photoConfig = templateConfig.photo;

  const detailsLayout = templateConfig.detailsLayout || "classic";
  const titleShape = templateConfig.titleShape || "simple";

  const layout = useMemo(() => {
    const calculateForSize = (fSize: number) => {
      let cursorY = paddingY + 20; // Extra room for Mantra
      
      // 1. Calculate Mantra & Title Height
      if (formData.mantra) cursorY += fSize * 2;
      if (formData.title) cursorY += fSize * 2.8;

      const LABEL_WIDTH = 130;
      const COLON_WIDTH = 20;
      const LINE_SPACING = fSize * 0.5 + 2;
      const contentWidth = A4_W - padding * 2 - 10;
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
        cursorY += Math.round(fSize * 1.4) + LINE_SPACING + 12; // Extra padding for beautiful headings
        const fieldLayouts: any[] = [];
        
        let i = 0;
        while (i < sec.fields.length) {
          const field = sec.fields[i];
          const valText = String(field.displayValue);
          
          let rowWidth = contentWidth;
          if (hasPhoto && photoConfig && cursorY >= photoConfig.y - 15 && cursorY <= photoConfig.y + photoConfig.height + 15) {
             rowWidth = photoConfig.x - padding - 20; // Prevent photo overlap
          }
          
          // Decide if we should render this field as two-column side-by-side grid
          const nextField = sec.fields[i + 1];
          const isTwoCol = detailsLayout === "two-column";
          
          // Pair fields if we are in two-column mode, both values are short, and we are not in the photo Y range
          const canPair = isTwoCol && nextField && 
                          (valText.length < 16 && String(field.displayLabel).length < 13) && 
                          (String(nextField.displayValue).length < 16 && String(nextField.displayLabel).length < 13) &&
                          !(hasPhoto && photoConfig && cursorY >= photoConfig.y - 15 && cursorY <= photoConfig.y + photoConfig.height + 15);
                          
          if (canPair) {
            const halfW = (rowWidth - 12) / 2;
            const labelW = Math.round(halfW * 0.45);
            const valueW = halfW - labelW - 10;
            
            fieldLayouts.push({
              id: field.id,
              label: field.displayLabel,
              value: valText,
              logoUrl: field.logoUrl,
              y: cursorY,
              availableWidth: valueW,
              isHalf: true,
              colIndex: 0,
              halfW,
              labelW,
            });
            
            fieldLayouts.push({
              id: nextField.id,
              label: nextField.displayLabel,
              value: String(nextField.displayValue),
              logoUrl: nextField.logoUrl,
              y: cursorY,
              availableWidth: valueW,
              isHalf: true,
              colIndex: 1,
              halfW,
              labelW,
            });
            
            cursorY += fSize * 1.35 + LINE_SPACING;
            i += 2;
          } else {
            let valueW = rowWidth - LABEL_WIDTH - COLON_WIDTH;
            if (field.logoUrl) {
              valueW -= (fSize + 4);
            }
            
            const valW = measure(valText, fSize);
            const lines = Math.ceil(valW / valueW) || 1;
            const rowHeight = Math.max(fSize, lines * fSize * 1.1);
            fieldLayouts.push({
              id: field.id,
              label: field.displayLabel,
              value: valText,
              logoUrl: field.logoUrl,
              y: cursorY,
              availableWidth: valueW,
              isHalf: false,
            });
            cursorY += rowHeight + LINE_SPACING;
            i += 1;
          }
        }
        
        sectionLayouts.push({ key: sec.key, titleText: sec.title, titleY, fields: fieldLayouts });
        cursorY += fSize * 1.5;
      }
      return { sectionLayouts, totalHeight: cursorY };
    };
    const MAX_H = A4_H - paddingY;
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
  }, [sections, padding, paddingY, baseFontSize, fontFamily, fontTick, formData.mantra, formData.title, hasPhoto, photoConfig, detailsLayout]);

  const handleAlign = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (selectedStickers.length < 2) return;
    
    const nodes = selectedStickers.map(id => stageRef.current?.findOne('.' + id)).filter(Boolean) as Konva.Node[];
    if (nodes.length < 2) return;

    // Get collective bounding box
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(node => {
      const box = node.getClientRect();
      minX = Math.min(minX, box.x);
      maxX = Math.max(maxX, box.x + box.width);
      minY = Math.min(minY, box.y);
      maxY = Math.max(maxY, box.y + box.height);
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    nodes.forEach(node => {
      const id = node.name();
      const box = node.getClientRect();
      let newX = node.x();
      let newY = node.y();

      switch (type) {
        case 'left': newX = node.x() + (minX - box.x); break;
        case 'center': newX = node.x() + (centerX - (box.x + box.width / 2)); break;
        case 'right': newX = node.x() + (maxX - (box.x + box.width)); break;
        case 'top': newY = node.y() + (minY - box.y); break;
        case 'middle': newY = node.y() + (centerY - (box.y + box.height / 2)); break;
        case 'bottom': newY = node.y() + (maxY - (box.y + box.height)); break;
      }

      updateSticker(id, { x: newX, y: newY });
    });
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative overflow-hidden"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: "24px 24px",
      }}
    >
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
            setSelectedStickers([]);
          }
        }}
        style={{ cursor: isDesigner ? 'grab' : 'default' }}
      >
        <Layer listening={false}>
          <PageBackground
            templateConfig={templateConfig}
            themeBgColors={theme.bgColors}
            themeSelectedPalette={theme.selectedPaletteName}
            primaryColor={primaryColor}
          />
          <BgWatermarkImage bgConfig={templateConfig.bgConfig} />
          {templateConfig.frame.type === "image" ? (
            <ImageFrame config={templateConfig.frame} primaryColor={primaryColor} hasPhoto={hasPhoto} photoConfig={photoConfig} />
          ) : templateConfig.frame.type === "gradient" ? (
            <GradientFrame config={templateConfig.frame as FrameGradientConfig} primaryColor={primaryColor} />
          ) : templateConfig.frame.type === "custom" ? (
            <CustomKonvaFrame componentId={templateConfig.frame.componentId} primaryColor={primaryColor} />
          ) : (
            <SvgFrame config={templateConfig.frame as FrameSvgConfig} primaryColor={primaryColor} />
          )}
          
          {/* Global Watermark (hidden on preview canvas, shown only during image downloads) */}
          <GlobalWatermark visible={false} />
          
          <Text x={0} y={A4_H - 30} width={A4_W} text="www.biodata99.com" fontSize={8} fontFamily="Inter" fill="#cccccc" align="center" />
        </Layer>
        <Layer>
          <Group clipX={0} clipY={0} clipWidth={A4_W} clipHeight={A4_H}>
            {(() => {
              const headerOffset = sectionOffsets["header"] || { x: 0, y: 0 };
              return (
                <Group x={headerOffset.x} y={headerOffset.y}>
                  {/* Mantra Rendering */}
                  {formData.mantra && (
                    <Text
                      x={A4_W / 2}
                      y={paddingY + 10}
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
                  {formData.title && (() => {
                    const titleY = paddingY + 10 + (formData.mantra ? layout.fSize * 2 : 0);
                    const titleHeight = layout.fSize * 2;
                    
                    if (titleShape === "ribbon") {
                      const ribbonW = 320;
                      const ribbonH = layout.fSize * 2.8;
                      const ribbonX = (A4_W - ribbonW) / 2;
                      const ribbonY = titleY - 4;
                      const tailW = 30;
                      const tailH = ribbonH;
                      
                      return (
                        <Group>
                          {/* Ribbon Left Tail (polygon) */}
                          <Line
                            points={[
                              ribbonX - tailW + 10, ribbonY + 8,
                              ribbonX, ribbonY + 2,
                              ribbonX, ribbonY + tailH - 2,
                              ribbonX - tailW + 10, ribbonY + tailH + 4,
                              ribbonX - tailW + 2, ribbonY + (tailH / 2) + 5
                            ]}
                            fill={primaryColor}
                            opacity={0.8}
                            closed
                          />
                          {/* Ribbon Right Tail (polygon) */}
                          <Line
                            points={[
                              ribbonX + ribbonW + tailW - 10, ribbonY + 8,
                              ribbonX + ribbonW, ribbonY + 2,
                              ribbonX + ribbonW, ribbonY + tailH - 2,
                              ribbonX + ribbonW + tailW - 10, ribbonY + tailH + 4,
                              ribbonX + ribbonW + tailW - 2, ribbonY + (tailH / 2) + 5
                            ]}
                            fill={primaryColor}
                            opacity={0.8}
                            closed
                          />
                          {/* Ribbon Main Banner */}
                          <Rect
                            x={ribbonX}
                            y={ribbonY}
                            width={ribbonW}
                            height={ribbonH}
                            fill={primaryColor}
                            cornerRadius={6}
                            stroke={accentColor || primaryColor}
                            strokeWidth={2}
                            shadowColor="#000000"
                            shadowBlur={4}
                            shadowOffset={{ x: 0, y: 2 }}
                            shadowOpacity={0.15}
                          />
                          <Text
                            x={ribbonX}
                            y={ribbonY + (ribbonH - titleHeight) / 2}
                            text={formData.title}
                            fontSize={layout.fSize * 1.8}
                            fontFamily={fontFamily}
                            fontStyle="bold"
                            fill="#ffffff"
                            align="center"
                            width={ribbonW}
                          />
                        </Group>
                      );
                    } else if (titleShape === "arch") {
                      return (
                        <Group>
                          {/* Traditional Temple Dome Arch */}
                          <Path
                            data={`M ${A4_W / 2 - 120},${titleY - 8} C ${A4_W / 2 - 80},${titleY - 24} ${A4_W / 2 - 30},${titleY - 30} ${A4_W / 2},${titleY - 30} C ${A4_W / 2 + 30},${titleY - 30} ${A4_W / 2 + 80},${titleY - 24} ${A4_W / 2 + 120},${titleY - 8}`}
                            stroke={accentColor || primaryColor}
                            strokeWidth={2.5}
                            lineCap="round"
                          />
                          <Path
                            data={`M ${A4_W / 2 - 100},${titleY - 4} C ${A4_W / 2 - 70},${titleY - 18} ${A4_W / 2 - 25},${titleY - 24} ${A4_W / 2},${titleY - 24} C ${A4_W / 2 + 25},${titleY - 24} ${A4_W / 2 + 70},${titleY - 18} ${A4_W / 2 + 100},${titleY - 4}`}
                            stroke={primaryColor}
                            strokeWidth={1}
                            opacity={0.6}
                            lineCap="round"
                          />
                          <Text
                            x={A4_W / 2}
                            y={titleY}
                            text={formData.title}
                            fontSize={layout.fSize * 2}
                            fontFamily={fontFamily}
                            fontStyle="bold"
                            fill={primaryColor}
                            align="center"
                            width={A4_W}
                            offsetX={A4_W / 2}
                          />
                        </Group>
                      );
                    } else if (titleShape === "ornament") {
                      return (
                        <Group>
                          {/* Elegant Decorative Side Mandalas */}
                          <Path
                            data="M 15 0 C 23.2 0 30 6.8 30 15 C 30 23.2 23.2 30 15 30 C 6.8 30 0 23.2 0 15 C 0 6.8 6.8 0 15 0 Z M 15 5 C 9.5 5 5 9.5 5 15 C 5 20.5 9.5 25 15 25 C 20.5 25 25 20.5 25 15 C 25 9.5 20.5 5 15 5 Z"
                            fill={accentColor || primaryColor}
                            x={A4_W / 2 - 170}
                            y={titleY - 2}
                            scale={{ x: 0.8, y: 0.8 }}
                          />
                          <Path
                            data="M 15 0 C 23.2 0 30 6.8 30 15 C 30 23.2 23.2 30 15 30 C 6.8 30 0 23.2 0 15 C 0 6.8 6.8 0 15 0 Z M 15 5 C 9.5 5 5 9.5 5 15 C 5 20.5 9.5 25 15 25 C 20.5 25 25 20.5 25 15 C 25 9.5 20.5 5 15 5 Z"
                            fill={accentColor || primaryColor}
                            x={A4_W / 2 + 140}
                            y={titleY - 2}
                            scale={{ x: 0.8, y: 0.8 }}
                          />
                          {/* Title Text */}
                          <Text
                            x={A4_W / 2}
                            y={titleY}
                            text={formData.title}
                            fontSize={layout.fSize * 2}
                            fontFamily={fontFamily}
                            fontStyle="bold"
                            fill={primaryColor}
                            align="center"
                            width={A4_W}
                            offsetX={A4_W / 2}
                          />
                          {/* Ornamental Underline */}
                          <Line
                            points={[A4_W / 2 - 90, titleY + titleHeight + 4, A4_W / 2 + 90, titleY + titleHeight + 4]}
                            stroke={accentColor || primaryColor}
                            strokeWidth={1.5}
                          />
                          <Line
                            points={[A4_W / 2 - 5, titleY + titleHeight + 4, A4_W / 2, titleY + titleHeight + 1.5, A4_W / 2 + 5, titleY + titleHeight + 4, A4_W / 2, titleY + titleHeight + 6.5]}
                            fill={accentColor || primaryColor}
                            closed
                          />
                        </Group>
                      );
                    } else {
                      // Standard Simple Text
                      return (
                        <Text
                          x={A4_W / 2}
                          y={titleY}
                          text={formData.title}
                          fontSize={layout.fSize * 2}
                          fontFamily={fontFamily}
                          fontStyle="bold"
                          fill={primaryColor}
                          align="center"
                          width={A4_W}
                          offsetX={A4_W / 2}
                        />
                      );
                    }
                  })()}
                </Group>
              );
            })()}

            {layout.sectionLayouts.map((sec: any, secIdx: number) => {
              const secKey = sec.key || `sec-${secIdx}`;
              const offset = sectionOffsets[secKey] || sectionOffsets[`sec-${secIdx}`] || { x: 0, y: 0 };
              const style = sectionStyles[secKey] || sectionStyles[`sec-${secIdx}`] || {};
              const titleColor = style.titleColor || primaryColor;
              const fieldColor = style.fieldColor || secondaryColor;
              const fSize = style.fontSize ? Number(style.fontSize) : layout.fSize;
              const fontStyle = style.fontStyle || "bold";
              const textTransform = style.textTransform || "none";
              const applyTransform = (text: string) => {
                if (textTransform === "uppercase") return text.toUpperCase();
                if (textTransform === "lowercase") return text.toLowerCase();
                if (textTransform === "capitalize") return text.replace(/\b\w/g, c => c.toUpperCase());
                return text;
              };

              return (
                <Group key={secKey} x={offset.x} y={offset.y}>
                  {/* Modern Boxed Card Background Rendering */}
                  {detailsLayout === "modern-boxed" && (() => {
                    const lastField = sec.fields[sec.fields.length - 1];
                    const boxHeight = lastField ? (lastField.y + fSize * 1.45 - sec.titleY + 12) : 50;
                    return (
                      <Rect
                        x={padding - 8}
                        y={sec.titleY - 8}
                        width={A4_W - padding * 2 + 16}
                        height={boxHeight}
                        fill={titleColor + "06"} // Light title color tint (opacity ~3%)
                        stroke={titleColor + "1a"} // Soft title color stroke (opacity ~10%)
                        strokeWidth={1.2}
                        cornerRadius={10}
                      />
                    );
                  })()}

                  {/* Section Header */}
                  <Line points={[padding, sec.titleY + 15, padding + 5, sec.titleY + 15]} stroke={accentColor || titleColor} strokeWidth={3} lineCap="round" />
                  <Text x={padding + 10} y={sec.titleY + 2} text={applyTransform(sec.titleText)} fontSize={Math.round(fSize * 1.4)} fontFamily={fontFamily} fontStyle={fontStyle} fill={titleColor} />
                  
                  {/* Section Fields */}
                  {sec.fields.map((field: any) => {
                    const colX = field.isHalf 
                      ? (field.colIndex === 0 
                          ? (padding + 10) 
                          : (padding + 10 + field.halfW + 10))
                      : (padding + 10);
                    const lblW = field.isHalf ? field.labelW : 130;
                    const valX = colX + lblW + 15;
                    const colonX = colX + lblW + 5;
                    
                    return (
                      <Group key={field.id}>
                        <Text x={colX} y={field.y} width={lblW} text={applyTransform(field.label)} fontSize={fSize} fontFamily={fontFamily} fontStyle={fontStyle} fill={fieldColor} />
                        <Text x={colonX} y={field.y} text=":" fontSize={fSize} fontFamily={fontFamily} fill={fieldColor} />
                        {field.logoUrl ? (
                          <>
                            <LogoImage src={field.logoUrl} x={valX} y={field.y + (fSize * 0.05)} size={fSize} />
                            <Text
                              x={valX + fSize + 4}
                              y={field.y}
                              width={field.availableWidth}
                              text={applyTransform(field.value)}
                              fontSize={fSize}
                              fontFamily={fontFamily}
                              fill={fieldColor}
                              lineHeight={1.1}
                            />
                          </>
                        ) : (
                          <Text
                            x={valX}
                            y={field.y}
                            width={field.availableWidth}
                            text={applyTransform(field.value)}
                            fontSize={fSize}
                            fontFamily={fontFamily}
                            fill={fieldColor}
                            lineHeight={1.1}
                          />
                        )}

                        {/* Elegant Divider underline */}
                        {detailsLayout === "elegant-divided" && (!field.isHalf || field.colIndex === 1) && (
                          <Line
                            points={[
                              colX, field.y + fSize * 1.35 + 2,
                              colX + (field.isHalf ? field.halfW : (A4_W - padding * 2 - 20)), field.y + fSize * 1.35 + 2
                            ]}
                            stroke={fieldColor + "15"} // Ultra-soft opacity
                            strokeWidth={0.8}
                            dash={[2, 2]}
                          />
                        )}
                      </Group>
                    );
                  })}
                </Group>
              );
            })}



            {hasPhoto && photoConfig && (
              <PhotoImage
                src={formData.photo!}
                x={photoConfig.x}
                y={photoConfig.y}
                width={photoConfig.width}
                height={photoConfig.height}
                cornerRadius={photoConfig.cornerRadius}
                borderColor={photoConfig.showBorder !== false ? primaryColor : ""}
              />
            )}

            {/* Stickers Rendering */}
            {formData.stickers?.map((sticker) => (
              <StickerItem 
                key={sticker.id} 
                sticker={sticker} 
                color={primaryColor} 
                isDesigner={isDesigner} 
                isSelected={selectedStickers.includes(sticker.id)}
                onClick={(e) => {
                  if (isDesigner) {
                    e.cancelBubble = true;
                    const isShift = e.evt.shiftKey || e.evt.metaKey;
                    if (isShift) {
                      setSelectedStickers(prev => 
                        prev.includes(sticker.id) 
                          ? prev.filter(id => id !== sticker.id) 
                          : [...prev, sticker.id]
                      );
                    } else {
                      setSelectedStickers([sticker.id]);
                    }
                  }
                }}
              />
            ))}
          </Group>

          {isDesigner && selectedStickers.length > 0 && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Minimum size
                if (newBox.width < 20 || newBox.height < 20) {
                  return oldBox;
                }
                return newBox;
              }}
              rotateEnabled={true}
              enabledAnchors={
                isMobile 
                  ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] 
                  : ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']
              }
              anchorSize={isMobile ? 12 : 8}
              anchorCornerRadius={4}
              anchorStroke="#D4AF37"
              anchorFill="#ffffff"
              borderStroke="#D4AF37"
              keepRatio={true}
            />
          )}
        </Layer>
      </Stage>
      {isDesigner && (
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
          {/* Alignment Toolbar */}
          {selectedStickers.length >= 2 && (
            <div className="flex bg-white/90 backdrop-blur-sm border border-primary/20 rounded-full shadow-2xl p-1 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-300">
              <AlignButton icon={<AlignLeft className="w-4 h-4" />} onClick={() => handleAlign('left')} label="Align Left" />
              <AlignButton icon={<AlignCenter className="w-4 h-4" />} onClick={() => handleAlign('center')} label="Align Center" />
              <AlignButton icon={<AlignRight className="w-4 h-4" />} onClick={() => handleAlign('right')} label="Align Right" />
              <div className="w-px h-4 bg-primary/10 mx-1 self-center" />
              <AlignButton icon={<AlignTop className="w-4 h-4" />} onClick={() => handleAlign('top')} label="Align Top" />
              <AlignButton icon={<AlignMiddle className="w-4 h-4" />} onClick={() => handleAlign('middle')} label="Align Middle" />
              <AlignButton icon={<AlignBottom className="w-4 h-4" />} onClick={() => handleAlign('bottom')} label="Align Bottom" />
            </div>
          )}

          {/* Selection Info & Simple Delete Option */}
          {selectedStickers.length > 0 && (
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="px-3 py-1.5 bg-primary/95 text-white text-[10px] font-bold rounded-full shadow-lg flex items-center gap-2">
                <Layers className="w-3 h-3" />
                {selectedStickers.length} Selected
              </div>
              <button
                onClick={() => {
                  selectedStickers.forEach(id => removeSticker(id));
                  setSelectedStickers([]);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-full shadow-lg flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AlignButton({ icon, onClick, label }: { icon: React.ReactNode, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
      title={label}
    >
      {icon}
    </button>
  );
}
