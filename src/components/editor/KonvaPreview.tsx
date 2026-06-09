"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Pencil, Globe, User, Briefcase, Users, Phone, Palette, AlignLeft, AlignCenter, AlignRight, AlignStartVertical as AlignTop, AlignCenterVertical as AlignMiddle, AlignEndVertical as AlignBottom, Layers, ArrowUp, ArrowDown } from "lucide-react";
import { Stage, Layer, Rect, Text, Line, Image as KonvaImage, Group, Path, Transformer, Circle } from "react-konva";
import { useBiodataStore, type Sticker } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useShallow } from "zustand/react/shallow";
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
  type BgConfig,
} from "@/lib/frame-config";
import type { BiodataFormValues } from "@/types/biodata";
import useImage from "use-image";
import Konva from "konva";
import { useColorizedFrameImage } from "@/hooks/useColorizedFrameImage";

if (typeof window !== "undefined") {
  // Force high-DPI crystal clear canvas rendering on all monitors and devices
  Konva.pixelRatio = Math.max(window.devicePixelRatio || 1, 2);
}

import { cn, getClientImageUrl } from "@/lib/utils";


import { getLightBgColor } from "@/lib/color-utils";
import { WATERMARK_CONFIG, getWatermarkCoordinates } from "@/lib/watermark-utils";

const colorDarkCache: Record<string, boolean> = {};

function isColorDark(color: string): boolean {
  if (!color) return false;
  const normalizedColor = color.trim().toLowerCase();
  if (colorDarkCache[normalizedColor] !== undefined) {
    return colorDarkCache[normalizedColor];
  }

  const hex = normalizedColor.replace("#", "");
  let isDark = false;

  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    isDark = (r * 299 + g * 587 + b * 114) / 1000 < 128;
  } else if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    isDark = (r * 299 + g * 587 + b * 114) / 1000 < 128;
  } else if (normalizedColor.startsWith("rgb")) {
    const match = normalizedColor.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0]);
      const g = parseInt(match[1]);
      const b = parseInt(match[2]);
      isDark = (r * 299 + g * 587 + b * 114) / 1000 < 128;
    }
  }

  colorDarkCache[normalizedColor] = isDark;
  return isDark;
}

function isBackgroundDark(
  templateConfig: any,
  themeBgColors: string[],
  themeSelectedPalette: string | null,
  primaryColor: string
): boolean {

  if (themeSelectedPalette !== null && themeBgColors && themeBgColors.length > 0) {
    const darkCount = themeBgColors.filter(isColorDark).length;
    return darkCount >= themeBgColors.length / 2;
  }

  const bgType = templateConfig?.bgType || "solid";
  const bgGradientColors = templateConfig?.bgGradientColors || [];
  if ((bgType === "linear" || bgType === "radial") && bgGradientColors.length > 0) {
    const darkCount = bgGradientColors.filter(isColorDark).length;
    return darkCount >= bgGradientColors.length / 2;
  }

  if (templateConfig?.frame?.type === "gradient") {
    const gradColors = templateConfig.frame.gradientColors || [];
    if (gradColors.length > 0) {
      const darkCount = gradColors.filter(isColorDark).length;
      return darkCount >= gradColors.length / 2;
    }
  }

  const solidColor = templateConfig?.frame?.bgColor || "#ffffff";
  return isColorDark(solidColor);
}

// ── Props ──────────────────────────────────────────────────────────
interface KonvaPreviewProps {
  liveFormData?: BiodataFormValues & { stickers?: Sticker[]; layout?: any };
  templateId?: string;
  isDesigner?: boolean;
}

const A4_W = 595;
const A4_H = 842;

// ════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════

// PhotoImage is a forwardRef component so the parent can attach a Konva Transformer to it
const PhotoImage = React.forwardRef<Konva.Group, {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius: number;
  borderColor: string;
  borderSize?: number;
  scale?: number;
  rotation?: number;
  isDesigner?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onDragEnd?: (newX: number, newY: number) => void;
  onTransformEnd?: (x: number, y: number, scaleX: number, scaleY: number, rotation: number) => void;
}>(function PhotoImage({
  src,
  x,
  y,
  width,
  height,
  cornerRadius,
  borderColor,
  borderSize = 2,
  scale = 1,
  rotation = 0,
  isDesigner = false,
  isSelected = false,
  onSelect,
  onDragEnd,
  onTransformEnd,
}, ref) {
  const resolvedSrc = getClientImageUrl(src);
  const [image] = useImage(resolvedSrc, resolvedSrc.startsWith("data:") ? undefined : "anonymous");
  if (!image) return null;
  console.log(image.width, "image.width")
  // object-fit: contain — fill the container without cropping
  const imgWidth = image.width;
  const imgHeight = image.height;
  const containerRatio = width / height;
  const imageRatio = imgWidth / imgHeight;

  // Force database coordinates for photo width, height, and border
  const drawWidth = width;
  const drawHeight = height;

  let crop = undefined;
  if (image) {
    crop = { x: 0, y: 0, width: imgWidth, height: imgHeight };
    if (containerRatio > imageRatio) {
      const newHeight = imgWidth / containerRatio;
      crop.y = (imgHeight - newHeight) / 2;
      crop.height = newHeight;
    } else {
      const newWidth = imgHeight * containerRatio;
      crop.x = (imgWidth - newWidth) / 2;
      crop.width = newWidth;
    }
  }

  // Center within container
  const offsetX = drawWidth / 2;
  const offsetY = drawHeight / 2;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return (
    <Group
      ref={ref}
      name="photo-group"
      x={centerX}
      y={centerY}
      offsetX={offsetX}
      offsetY={offsetY}
      width={drawWidth}
      height={drawHeight}
      rotation={rotation}
      draggable={isDesigner}
      onClick={(e) => {
        if (isDesigner) {
          e.cancelBubble = true;
          onSelect?.();
        }
      }}
      onTap={(e) => {
        if (isDesigner) {
          e.cancelBubble = true;
          onSelect?.();
        }
      }}
      onDragStart={(e) => {
        if (isDesigner) {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = "grabbing";
        }
      }}
      onDragEnd={(e) => {
        if (isDesigner) {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = "move";
          onDragEnd?.(e.target.x(), e.target.y());
        }
      }}
      onTransformEnd={() => {
        const node = (ref as React.RefObject<Konva.Group>)?.current;
        if (!node) return;
        onTransformEnd?.(
          node.x(),
          node.y(),
          node.scaleX(),
          node.scaleY(),
          node.rotation(),
        );
        // Reset scale on node since we store it in theme
        node.scaleX(1);
        node.scaleY(1);
      }}
      onMouseEnter={(e) => {
        if (isDesigner) {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = isSelected ? "move" : "pointer";
        }
      }}
      onMouseLeave={(e) => {
        if (isDesigner) {
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = "default";
        }
      }}
    >
      <KonvaImage
        image={image}
        x={0}
        y={0}
        width={drawWidth}
        height={drawHeight}
        crop={crop}
        cornerRadius={cornerRadius}
      />
      {borderColor && borderSize > 0 && (
        <Rect
          x={-borderSize / 2}
          y={-borderSize / 2}
          width={drawWidth + borderSize}
          height={drawHeight + borderSize}
          cornerRadius={cornerRadius + borderSize / 2}
          stroke={borderColor}
          strokeWidth={borderSize}
          listening={false}
        />
      )}
    </Group>
  );
});

const LogoImage = React.memo(function LogoImage({ src, x, y, size }: { src: string; x: number; y: number; size: number }) {
  const resolvedSrc = getClientImageUrl(src);
  const [image] = useImage(resolvedSrc, resolvedSrc.startsWith("data:") ? undefined : "anonymous");
  return image ? <KonvaImage image={image} x={x} y={y} width={size} height={size} /> : null;
});

const StickerImage = React.memo(function StickerImage({ src }: { src: string }) {
  const resolvedSrc = getClientImageUrl(src);
  const [image] = useImage(resolvedSrc, resolvedSrc.startsWith("data:") ? undefined : "anonymous");
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

const GraphicBgImage = React.memo(function GraphicBgImage({
  bgConfig,
  isCustom = false
}: {
  bgConfig?: TemplateConfig["bgConfig"];
  isCustom?: boolean;
}) {
  const bgUrl = bgConfig?.url || "";
  const resolvedUrl = getClientImageUrl(bgUrl);
  const [image] = useImage(resolvedUrl, resolvedUrl.startsWith("data:") ? undefined : "anonymous");
  if (!bgConfig || !bgUrl || !image) return null;

  let x = bgConfig.x;
  let y = bgConfig.y;
  let width = bgConfig.width;
  let height = bgConfig.height;

  if (isCustom && image.width > 0 && image.height > 0) {
    const maxW = bgConfig.width;
    const maxH = bgConfig.height;
    const ratio = Math.min(maxW / image.width, maxH / image.height);
    width = image.width * ratio;
    height = image.height * ratio;
    x = bgConfig.x + (maxW - width) / 2;
    y = bgConfig.y + (maxH - height) / 2;
  }

  return (
    <KonvaImage
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
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

const ImageFrame = React.memo(function ImageFrame({
  config,
  primaryColor,
  accentColor,
  defaultPrimary,
  defaultAccent,
  enableSvgTint = true,
  bgConfig
}: {
  config: FrameImageConfig;
  primaryColor: string;
  accentColor: string;
  defaultPrimary: string;
  defaultAccent: string;
  enableSvgTint?: boolean;
  bgConfig?: BgConfig;
}) {
  const frameUrl = getFrameImageUrl(config, primaryColor);
  const resolvedFrameUrl = getClientImageUrl(frameUrl);
  const image = useColorizedFrameImage(
    resolvedFrameUrl,
    defaultPrimary,
    enableSvgTint ? primaryColor : "",
    defaultAccent,
    enableSvgTint ? accentColor : ""
  );

  const x = bgConfig?.frameImageX !== undefined ? parseFloat(bgConfig.frameImageX) || 0 : 0;
  const y = bgConfig?.frameImageY !== undefined ? parseFloat(bgConfig.frameImageY) || 0 : 0;
  const w = bgConfig?.frameImageWidth !== undefined ? parseFloat(bgConfig.frameImageWidth) || A4_W : A4_W;
  const h = bgConfig?.frameImageHeight !== undefined ? parseFloat(bgConfig.frameImageHeight) || A4_H : A4_H;

  return (
    <Group>
      {image && <KonvaImage image={image} x={x} y={y} width={w} height={h} />}
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
  let asset = STICKER_ASSETS.find(a => a.id === sticker.type);
  if (!asset && sticker.type) {
    asset = { id: sticker.type, type: 'image', url: sticker.type, name: 'Custom', path: '', viewBox: '' };
  }

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
export const KonvaPreview = React.memo(function KonvaPreview({ liveFormData, templateId, isDesigner = false }: KonvaPreviewProps) {
  const { formData: storeFormData, selectedTemplate: storeTemplate, customTemplates, removeSticker, updateSticker } = useBiodataStore(useShallow(s => ({
    formData: s.formData,
    selectedTemplate: s.selectedTemplate,
    customTemplates: s.customTemplates,
    removeSticker: s.removeSticker,
    updateSticker: s.updateSticker,
  })));
  const theme = useThemeStore(useShallow(s => ({
    bgColors: s.bgColors,
    selectedPaletteName: s.selectedPaletteName,
    photoScale: s.photoScale,
    photoXOffset: s.photoXOffset,
    photoYOffset: s.photoYOffset,
    photoCornerRadius: s.photoCornerRadius,
    photoBorderSize: s.photoBorderSize,
    bgImageUrl: s.bgImageUrl,
    bgImageScale: s.bgImageScale,
    bgImageXOffset: s.bgImageXOffset,
    bgImageYOffset: s.bgImageYOffset,
    bgImageOpacity: s.bgImageOpacity,
    primaryColor: s.primaryColor,
    secondaryColor: s.secondaryColor,
    accentColor: s.accentColor,
    fontSize: s.fontSize,
    padding: s.padding,
    paddingLeft: s.paddingLeft,
    paddingRight: s.paddingRight,
    paddingTop: s.paddingTop,
    paddingBottom: s.paddingBottom,
    paddingY: s.paddingY,
    fontFamily: s.fontFamily,
    photoRotation: s.photoRotation,
    setPhotoXOffset: s.setPhotoXOffset,
    setPhotoYOffset: s.setPhotoYOffset,
    setPhotoScale: s.setPhotoScale,
    setPhotoRotation: s.setPhotoRotation,
  })));
  const formData = liveFormData ? { ...liveFormData, stickers: storeFormData.stickers } : storeFormData;
  const selectedTemplate = templateId || storeTemplate;
  const templateConfig = getTemplateConfig(selectedTemplate);

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [stageSize, setStageSize] = useState({ width: A4_W, height: A4_H });
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const hasInitializedPanRef = useRef(false);
  const [scale, setScale] = useState(1);
  const [fontsReady, setFontsReady] = useState(false);
  const [fontTick, setFontTick] = useState(0);
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [isPhotoSelected, setIsPhotoSelected] = useState(false);
  const mantraSticker = formData.stickers?.find(s => s.isMantra);
  const transformerRef = useRef<Konva.Transformer>(null);
  const photoTransformerRef = useRef<Konva.Transformer>(null);
  const photoGroupRef = useRef<Konva.Group>(null);
  const previewWatermarkRef = useRef<any>(null);
  const lastDistRef = useRef<number | null>(null);
  const lastCenterRef = useRef<{ x: number; y: number } | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Wire sticker transformer
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

  // Wire photo transformer
  useEffect(() => {
    if (isPhotoSelected && photoTransformerRef.current && photoGroupRef.current && isDesigner) {
      photoTransformerRef.current.nodes([photoGroupRef.current]);
      photoTransformerRef.current.getLayer()?.batchDraw();
    } else {
      photoTransformerRef.current?.nodes([]);
    }
  }, [isPhotoSelected, isDesigner]);

  // Deselect photo when clicking empty stage area
  const handleStageClick = useCallback((e: any) => {
    if (e.target === e.target.getStage() || e.target.name() === 'bg-rect') {
      setIsPhotoSelected(false);
      setSelectedStickers([]);
    }
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("biodata:selection-changed", { detail: selectedStickers }));
  }, [selectedStickers]);

  useEffect(() => {
    const handleDeleteSelected = () => {
      selectedStickers.forEach(id => removeSticker(id));
      setSelectedStickers([]);
    };
    window.addEventListener("biodata:delete-selected", handleDeleteSelected);
    return () => window.removeEventListener("biodata:delete-selected", handleDeleteSelected);
  }, [selectedStickers, removeSticker]);

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

  // ── Internal mount-only fit to screen ───────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setStageSize({ width, height });
    const initialScale = Math.min(width / A4_W, height / A4_H);
    setScale(initialScale);
    setStagePos({ x: (width - A4_W * initialScale) / 2, y: (height - A4_H * initialScale) / 2 });
    hasInitializedPanRef.current = true;
  }, []);

  // ── ResizeObserver: keep stage size synced when sidebar opens/closes ───
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setStageSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Zoom/Fit event listeners ─────────────────────────────────────
  useEffect(() => {
    if (!isDesigner) return;
    const ZOOM_STEP = 0.1;
    const fitToScreen = () => {
      const el = containerRef.current;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      const fitScale = Math.max(0.3, Math.min(Math.min(width / A4_W, height / A4_H), 1.2));
      setScale(fitScale);
      setStagePos({ x: (width - A4_W * fitScale) / 2, y: (height - A4_H * fitScale) / 2 });
      window.dispatchEvent(new CustomEvent("biodata:scale-changed", { detail: fitScale }));
    };
    const zoomIn = () => {
      setScale(prev => {
        const next = Math.min(prev + ZOOM_STEP, 2);
        window.dispatchEvent(new CustomEvent("biodata:scale-changed", { detail: next }));
        return next;
      });
    };
    const zoomOut = () => {
      setScale(prev => {
        const next = Math.max(prev - ZOOM_STEP, 0.3);
        window.dispatchEvent(new CustomEvent("biodata:scale-changed", { detail: next }));
        return next;
      });
    };
    window.addEventListener("biodata:fit-screen", fitToScreen);
    window.addEventListener("biodata:zoom-in", zoomIn);
    window.addEventListener("biodata:zoom-out", zoomOut);
    return () => {
      window.removeEventListener("biodata:fit-screen", fitToScreen);
      window.removeEventListener("biodata:zoom-in", zoomIn);
      window.removeEventListener("biodata:zoom-out", zoomOut);
    };
  }, [isDesigner]);

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

      // Programmatically hide the watermark nodes for the export capture
      const watermarkNode = stage.findOne("#watermark");
      if (watermarkNode) {
        watermarkNode.hide();
      }
      if (previewWatermarkRef.current) {
        previewWatermarkRef.current.hide();
      }

      stage.draw();

      const dataUrl = stage.toDataURL({
        mimeType: "image/jpeg",
        quality: 1.0, // Maximum lossless quality
        pixelRatio: 3, // 3x pixel ratio for extremely high resolution and crispness
      });

      // Keep it hidden to maintain clean editor view
      if (watermarkNode) {
        watermarkNode.hide();
      }
      if (previewWatermarkRef.current) {
        previewWatermarkRef.current.show();
      }

      // Restore previous transform
      stage.scale({ x: savedScale, y: savedScale });
      stage.position({ x: savedX, y: savedY });
      stage.size({ width: stageSize.width, height: stageSize.height });
      stage.draw();

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

      // Programmatically hide the watermark nodes for the export capture
      const watermarkNode = stage.findOne("#watermark");
      if (watermarkNode) {
        watermarkNode.hide();
      }
      if (previewWatermarkRef.current) {
        previewWatermarkRef.current.hide();
      }

      stage.draw();

      const dataUrl = stage.toDataURL({
        mimeType: "image/png",
        pixelRatio: 3, // 3x pixel ratio for extremely high resolution and crispness
      });

      if (previewWatermarkRef.current) {
        previewWatermarkRef.current.show();
      }

      // Restore previous transform
      stage.scale({ x: savedScale, y: savedScale });
      stage.position({ x: savedX, y: savedY });
      stage.size({ width: stageSize.width, height: stageSize.height });
      stage.draw();

      window.dispatchEvent(new CustomEvent("biodata:png-ready", { detail: dataUrl }));
    };

    window.addEventListener("biodata:export-png", handleExportPng);
    return () => window.removeEventListener("biodata:export-png", handleExportPng);
  }, [stageSize]);

  const primaryColor = theme.primaryColor;
  const secondaryColor = theme.secondaryColor;
  const accentColor = theme.accentColor;
  const baseFontSize = theme.fontSize || 9;
  const paddingLeft = theme.paddingLeft !== undefined ? theme.paddingLeft : (theme.padding !== undefined ? theme.padding : templateConfig.defaultPadding);
  const paddingRight = theme.paddingRight !== undefined ? theme.paddingRight : (theme.padding !== undefined ? theme.padding : templateConfig.defaultPadding);
  const paddingTop = theme.paddingTop !== undefined ? theme.paddingTop : (theme.paddingY !== undefined ? theme.paddingY : (templateConfig.defaultYPadding !== undefined ? templateConfig.defaultYPadding : paddingLeft));
  const paddingBottom = theme.paddingBottom !== undefined ? theme.paddingBottom : (theme.paddingY !== undefined ? theme.paddingY : paddingLeft);
  const padding = paddingLeft;
  const paddingY = paddingTop;
  const fontFamily = getKonvaFontFamily(theme.fontFamily);
  const isDarkBg = useMemo(() => {
    return isBackgroundDark(templateConfig, theme.bgColors, theme.selectedPaletteName, primaryColor);
  }, [templateConfig, theme.bgColors, theme.selectedPaletteName, primaryColor]);

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
  const photoConfig = useMemo(() => {
    if (!templateConfig.photo) return undefined;
    const base = templateConfig.photo;
    const origPad = templateConfig.defaultPadding || 45;
    const diffX = paddingRight - origPad;
    const scale = theme.photoScale !== undefined ? theme.photoScale / 100 : 1;
    const scaledWidth = base.width * scale;
    const scaledHeight = base.height * scale;

    const cx = (base.x - diffX) + base.width / 2;
    const cy = base.y + base.height / 2;

    const xOffset = theme.photoXOffset || 0;
    const yOffset = theme.photoYOffset || 0;

    return {
      ...base,
      x: cx - scaledWidth / 2 + xOffset,
      y: cy - scaledHeight / 2 + yOffset,
      width: scaledWidth,
      height: scaledHeight,
      cornerRadius: theme.photoCornerRadius !== undefined ? theme.photoCornerRadius : base.cornerRadius,
      showBorder: theme.photoBorderSize !== undefined ? theme.photoBorderSize > 0 : base.showBorder,
      borderSize: theme.photoBorderSize !== undefined ? theme.photoBorderSize : 2,
      scale: 1
    };
  }, [templateConfig.photo, theme.photoCornerRadius, theme.photoBorderSize, paddingRight, theme.photoScale, theme.photoXOffset, theme.photoYOffset]);

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
      const contentWidth = A4_W - paddingLeft - paddingRight - 10;
      const standardHalfW = (contentWidth - 12) / 2;
      const standardLabelW = Math.round(standardHalfW * 0.45);
      const sectionLayouts: any[] = [];
      const measure = (text: string, size: number) => {
        // Use a deterministic character-based multiplier to guarantee 100% identical line-wrap 
        // calculations and row coordinates between the client-side canvas and server-side PDF generator.
        return text.length * size * 0.6;
      };

      for (const sec of sections as any[]) {
        const titleY = cursorY;
        cursorY += Math.round(fSize * 1.4) + LINE_SPACING + 16; // Extra padding for beautiful headings
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
          const halfW = (rowWidth - 12) / 2;
          const labelW = Math.round(halfW * 0.45);
          const valueW = halfW - labelW - 10;

          // Pair fields if we are in two-column mode, both values are short, and we are not in the photo Y range
          const canPair = isTwoCol && nextField &&
            (valText.length < 16 && String(field.displayLabel).length < 13) &&
            (String(nextField.displayValue).length < 16 && String(nextField.displayLabel).length < 13) &&
            !(hasPhoto && photoConfig && cursorY >= photoConfig.y - 15 && cursorY <= photoConfig.y + photoConfig.height + 15);

          if (canPair) {

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
            const unpairedLabelW = isTwoCol ? standardLabelW : LABEL_WIDTH;
            let valueW = rowWidth - unpairedLabelW - COLON_WIDTH;
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
              labelW: unpairedLabelW,
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
    let bestSize = baseFontSize;
    let finalLayout = calculateForSize(bestSize);
    return { ...finalLayout, fSize: bestSize };
  }, [sections, padding, paddingY, baseFontSize, fontFamily, fontTick, formData.mantra, formData.title, hasPhoto, photoConfig, detailsLayout]);

  const mantraGeometry = useMemo(() => {
    if (!mantraSticker) return null;

    // RTL/Arabic/Urdu glyphs render narrower than Latin — use a tighter multiplier
    const lang = formData.language || "English";
    const isRTL = lang === "اردو";
    const mantraCharW = isRTL ? 0.32 : 0.5;
    const titleCharW  = isRTL ? 0.38 : 0.55;

    // Use the wider of mantra text or title text so stickers clear both lines
    const mantraWidth = formData.mantra ? formData.mantra.length * (layout.fSize * 1.2 * mantraCharW) : 0;
    const titleWidth  = formData.title  ? formData.title.length  * (layout.fSize * 2   * titleCharW)  : 0;
    const textWidth   = Math.max(mantraWidth, titleWidth);

    const align = sectionStyles["header"]?.textAlign || "center";
    const gap = 10;
    const imgW = 45; // 100 * 0.45

    if (align === "left") {
      return {
        leftX:  paddingLeft,
        rightX: paddingLeft + textWidth + gap * 2 + imgW,
      };
    } else if (align === "right") {
      return {
        leftX:  A4_W - paddingRight - textWidth - gap * 2 - imgW,
        rightX: A4_W - paddingRight,
      };
    } else {
      const halfW = textWidth / 2;
      return {
        leftX:  A4_W / 2 - halfW - gap - imgW,
        rightX: A4_W / 2 + halfW + gap + imgW,
      };
    }
  }, [formData.mantra, formData.title, formData.language, mantraSticker, layout.fSize, sectionStyles, paddingLeft, paddingRight]);

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
        onClick={handleStageClick}
        style={{ cursor: isDesigner ? 'grab' : 'default' }}
      >
        <Layer listening={false}>
          <PageBackground
            templateConfig={templateConfig}
            themeBgColors={theme.bgColors}
            themeSelectedPalette={theme.selectedPaletteName}
            primaryColor={primaryColor}
          />
          {templateConfig.frame.type === "image" ? (
            <ImageFrame
              config={templateConfig.frame}
              primaryColor={primaryColor}
              accentColor={accentColor}
              defaultPrimary=""
              defaultAccent=""
              enableSvgTint={templateConfig.bgConfig?.enableSvgTint !== false}
              bgConfig={templateConfig.bgConfig}
            />
          ) : templateConfig.frame.type === "gradient" ? (
            <GradientFrame config={templateConfig.frame as FrameGradientConfig} primaryColor={primaryColor} />
          ) : templateConfig.frame.type === "custom" ? (
            <CustomKonvaFrame componentId={templateConfig.frame.componentId} primaryColor={primaryColor} />
          ) : (
            <SvgFrame config={templateConfig.frame as FrameSvgConfig} primaryColor={primaryColor} />
          )}
          {(() => {
            const isCustomBg = !!theme.bgImageUrl;
            const baseW = isCustomBg ? 300 : (templateConfig.bgConfig?.width ?? 595);
            const baseH = isCustomBg ? 300 : (templateConfig.bgConfig?.height ?? 842);

            const scale = theme.bgImageScale ?? 1.0;
            const width = baseW * scale;
            const height = baseH * scale;

            const baseLeft = isCustomBg ? 147.5 : (templateConfig.bgConfig?.x ?? 0);
            const baseTop = isCustomBg ? 271 : (templateConfig.bgConfig?.y ?? 0);

            const xOffset = theme.bgImageXOffset ?? 0;
            const yOffset = theme.bgImageYOffset ?? 0;

            const x = baseLeft + xOffset - (baseW * (scale - 1)) / 2;
            const y = baseTop + yOffset - (baseH * (scale - 1)) / 2;

            return (
              <GraphicBgImage
                bgConfig={{
                  url: theme.bgImageUrl || templateConfig.bgConfig?.url,
                  x,
                  y,
                  width,
                  height,
                  opacity: theme.bgImageUrl ? theme.bgImageOpacity : (templateConfig.bgConfig?.opacity ?? 0.15),
                }}
                isCustom={isCustomBg}
              />
            );
          })()}

          {/* Global Watermark (hidden on preview canvas, shown only during image downloads) */}
          <GlobalWatermark visible={false} />

          {/* Diagonal Preview Watermark overlay group */}
          <Group ref={previewWatermarkRef} id="preview-watermark-group" listening={false}>
            {/* Top diagonal watermark */}
            <Text
              text="PREVIEW • NOT FOR DOWNLOAD"
              fontSize={28}
              fontFamily="Inter"
              fontStyle="bold"
              fill={isDarkBg ? "#ffffff" : "#000000"}
              opacity={0.08}
              x={A4_W / 2}
              y={A4_H * 0.28}
              offsetX={300}
              offsetY={15}
              width={600}
              align="center"
              rotation={-30}
            />
            {/* Middle diagonal watermark */}
            <Text
              text="PREVIEW • NOT FOR DOWNLOAD"
              fontSize={38}
              fontFamily="Inter"
              fontStyle="bold"
              fill={isDarkBg ? "#ffffff" : "#000000"}
              opacity={0.08}
              x={A4_W / 2}
              y={A4_H / 2}
              offsetX={300}
              offsetY={20}
              width={600}
              align="center"
              rotation={-30}
            />
            {/* Bottom diagonal watermark */}
            <Text
              text="PREVIEW • NOT FOR DOWNLOAD"
              fontSize={28}
              fontFamily="Inter"
              fontStyle="bold"
              fill={isDarkBg ? "#ffffff" : "#000000"}
              opacity={0.08}
              x={A4_W / 2}
              y={A4_H * 0.72}
              offsetX={300}
              offsetY={15}
              width={600}
              align="center"
              rotation={-30}
            />
          </Group>

          <Text x={0} y={A4_H - paddingBottom + 10} width={A4_W} text="www.biodata99.com" fontSize={8} fontFamily="Inter" fill={isDarkBg ? "#ffffff" : "#cccccc"} opacity={isDarkBg ? 0.35 : 1} align="center" />
        </Layer>
        <Layer>
          <Group clipX={0} clipY={0} clipWidth={A4_W} clipHeight={A4_H}>
            {(() => {
              const headerOffset = sectionOffsets["header"] || { x: 0, y: 0 };
              return (
                <Group x={headerOffset.x} y={headerOffset.y}>
                  {/* Mantra Rendering */}
                  <Group y={paddingY + 10}>
                    {formData.mantra && (() => {
                      const hasMantraSticker = !!mantraSticker;
                      const gap = 10;
                      const imgW = 45;
                      const textX = paddingLeft + (hasMantraSticker ? (imgW + gap) : 0);
                      const textWidth = A4_W - paddingLeft - paddingRight - (hasMantraSticker ? (imgW + gap) * 2 : 0);
                      return (
                        <Text
                          x={textX}
                          y={0}
                          text={formData.mantra}
                          fontSize={layout.fSize * 1.2}
                          fontFamily={fontFamily}
                          fontStyle="bold"
                          fill={primaryColor}
                          align={sectionStyles["header"]?.textAlign || "center"}
                          width={textWidth}
                        />
                      );
                    })()}
                    {mantraSticker && mantraGeometry && (() => {
                      const placement = templateConfig.mantraSignPlacement || "both";
                      const vertical = templateConfig.mantraSignVertical || "top";
                      const signY = vertical === "middle"
                        ? (A4_H / 2) - (paddingY + 10) - 22
                        : -6;

                      // top-center: single sign centered above the mantra row
                      if (placement === "top-center") {
                        return (
                          <StickerItem
                            sticker={{ ...mantraSticker, id: "mantra-sign-top", x: (A4_W - 45) / 2, y: signY - 50, scaleX: 0.45, scaleY: 0.45 }}
                            color={primaryColor}
                            isDesigner={false}
                            isSelected={false}
                            onClick={() => { }}
                          />
                        );
                      }

                      const showLeft = placement === "both" || placement === "left";
                      const showRight = placement === "both" || placement === "right";
                      return (
                        <>
                          {showLeft && (
                            <StickerItem
                              sticker={{ ...mantraSticker, id: "mantra-sign-left", x: mantraGeometry.leftX, y: signY, scaleX: 0.45, scaleY: 0.45 }}
                              color={primaryColor}
                              isDesigner={false}
                              isSelected={false}
                              onClick={() => { }}
                            />
                          )}
                          {showRight && (
                            <StickerItem
                              sticker={{ ...mantraSticker, id: "mantra-sign-right", x: mantraGeometry.rightX, y: signY, scaleX: -0.45, scaleY: 0.45 }}
                              color={primaryColor}
                              isDesigner={false}
                              isSelected={false}
                              onClick={() => { }}
                            />
                          )}
                        </>
                      );
                    })()}
                  </Group>

                  {/* Title Rendering */}
                  {formData.title && (() => {
                    const titleY = paddingY + 10 + (formData.mantra ? layout.fSize * 2 : 0);
                    const titleHeight = layout.fSize * 2;
                    const align = sectionStyles["header"]?.textAlign || "center";

                    if (titleShape === "ribbon") {
                      const titleVal = formData.title || (currentLang === "हिंदी" ? "बायोडाटा" : "BIODATA");
                      const ribbonW = Math.min(
                        Math.max(titleVal.length * layout.fSize * 1.05 + 60, 180),
                        A4_W - paddingLeft - paddingRight
                      );
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
                            x={paddingLeft}
                            y={titleY}
                            text={formData.title}
                            fontSize={layout.fSize * 2}
                            fontFamily={fontFamily}
                            fontStyle="bold"
                            fill={primaryColor}
                            align="center"
                            width={A4_W - paddingLeft - paddingRight}
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
                            x={paddingLeft}
                            y={titleY}
                            text={formData.title}
                            fontSize={layout.fSize * 2}
                            fontFamily={fontFamily}
                            fontStyle="bold"
                            fill={primaryColor}
                            align="center"
                            width={A4_W - paddingLeft - paddingRight}
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
                          x={paddingLeft}
                          y={titleY}
                          text={formData.title}
                          fontSize={layout.fSize * 2}
                          fontFamily={fontFamily}
                          fontStyle="bold"
                          fill={primaryColor}
                          align={align}
                          width={A4_W - paddingLeft - paddingRight}
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
              const fSize = layout.fSize;
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
                        width={A4_W - paddingLeft - paddingRight + 16}
                        height={boxHeight}
                        fill={titleColor + "06"} // Light title color tint (opacity ~3%)
                        stroke={titleColor + "1a"} // Soft title color stroke (opacity ~10%)
                        strokeWidth={1.2}
                        cornerRadius={10}
                      />
                    );
                  })()}

                  {/* Section Header */}
                  {(() => {
                    const align = style.textAlign || "left";
                    let linePoints;
                    const barY = sec.titleY + Math.round(fSize * 1.4) + 8;
                    if (align === "center") {
                      const mid = A4_W / 2;
                      linePoints = [mid - 10, barY, mid + 10, barY];
                    } else if (align === "right") {
                      const end = A4_W - paddingRight;
                      linePoints = [end - 20, barY, end, barY];
                    } else {
                      linePoints = [paddingLeft, barY, paddingLeft + 20, barY];
                    }
                    return (
                      <Line
                        points={linePoints}
                        stroke={accentColor || titleColor}
                        strokeWidth={3}
                        lineCap="round"
                      />
                    );
                  })()}
                  <Text
                    x={paddingLeft}
                    y={sec.titleY + 2}
                    width={A4_W - paddingLeft - paddingRight}
                    text={applyTransform(sec.titleText)}
                    fontSize={Math.round(fSize * 1.4)}
                    fontFamily={fontFamily}
                    fontStyle={fontStyle}
                    fill={titleColor}
                    align={style.textAlign || "left"}
                  />

                  {/* Section Fields */}
                  {sec.fields.map((field: any) => {
                    const colX = field.isHalf
                      ? (field.colIndex === 0
                        ? (padding + 10)
                        : (padding + 10 + field.halfW + 10))
                      : (padding + 10);
                    const lblW = field.labelW ?? (field.isHalf ? field.labelW : 130);
                    const valX = colX + lblW + 15;
                    const colonX = colX + lblW + 5;

                    const align = style.textAlign || "left";

                    if (align === "center" || align === "right") {
                      const fullText = `${applyTransform(field.label)}: ${applyTransform(field.value)}`;
                      return (
                        <Group key={field.id}>
                          <Text
                            x={colX}
                            y={field.y}
                            width={field.isHalf ? field.halfW : A4_W - paddingLeft - paddingRight - 20}
                            text={fullText}
                            fontSize={fSize}
                            fontFamily={fontFamily}
                            fontStyle={fontStyle}
                            fill={fieldColor}
                            align={align}
                            lineHeight={1.1}
                          />
                        </Group>
                      );
                    }

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
                              colX + (field.isHalf ? field.halfW : (A4_W - paddingLeft - paddingRight - 20)), field.y + fSize * 1.35 + 2
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
                ref={photoGroupRef}
                src={formData.photo!}
                x={photoConfig.x}
                y={photoConfig.y}
                width={photoConfig.width}
                height={photoConfig.height}
                cornerRadius={photoConfig.cornerRadius}
                borderColor={photoConfig.showBorder !== false ? primaryColor : ""}
                borderSize={photoConfig.borderSize}
                scale={photoConfig.scale}
                rotation={theme.photoRotation || 0}
                isDesigner={isDesigner}
                isSelected={isPhotoSelected}
                onSelect={() => {
                  setIsPhotoSelected(true);
                  setSelectedStickers([]);
                }}
                onDragEnd={(newX, newY) => {
                  // newX/newY are the group center coords; convert back to offset
                  const baseX = photoConfig.x + photoConfig.width / 2;
                  const baseY = photoConfig.y + photoConfig.height / 2;
                  const xOff = theme.photoXOffset || 0;
                  const yOff = theme.photoYOffset || 0;
                  theme.setPhotoXOffset(xOff + (newX - (baseX)));
                  theme.setPhotoYOffset(yOff + (newY - (baseY)));
                }}
                onTransformEnd={(nx, ny, sx, sy, rot) => {
                  const baseX = photoConfig.x + photoConfig.width / 2;
                  const baseY = photoConfig.y + photoConfig.height / 2;
                  const xOff = theme.photoXOffset || 0;
                  const yOff = theme.photoYOffset || 0;
                  theme.setPhotoXOffset(xOff + (nx - baseX));
                  theme.setPhotoYOffset(yOff + (ny - baseY));
                  // Scale drives photoScale (average of sx/sy relative to current)
                  const currentScale = (theme.photoScale ?? 100) / 100;
                  const newScale = Math.round(currentScale * ((sx + sy) / 2) * 100);
                  theme.setPhotoScale(Math.max(20, Math.min(300, newScale)));
                  theme.setPhotoRotation(rot);
                }}
              />
            )}

            {/* Stickers Rendering */}
            {formData.stickers?.filter(s => !s.isMantra).map((sticker) => (
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
              centeredScaling={true}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) return oldBox;
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

          {/* Photo Transformer — same styling as sticker transformer */}
          {isDesigner && isPhotoSelected && (
            <Transformer
              ref={photoTransformerRef}
              centeredScaling={true}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 30 || newBox.height < 30) return oldBox;
                return newBox;
              }}
              rotateEnabled={true}
              keepRatio={false}
              enabledAnchors={
                isMobile
                  ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
                  : ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']
              }
              anchorSize={isMobile ? 14 : 10}
              anchorCornerRadius={5}
              anchorStroke="#6366f1"
              anchorFill="#ffffff"
              borderStroke="#6366f1"
              borderDash={[6, 3]}
              rotateAnchorOffset={20}
            />
          )}
        </Layer>
      </Stage>
      {isDesigner && (
        <div className="absolute top-4 left-4 lg:left-auto lg:right-4 flex flex-col gap-2 pointer-events-none items-start lg:items-end">
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
});

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
