"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Pencil, Globe, User, Briefcase, Users, Phone, Palette, AlignLeft, AlignCenter, AlignRight, AlignStartVertical as AlignTop, AlignCenterVertical as AlignMiddle, AlignEndVertical as AlignBottom, Layers } from "lucide-react";
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

import { NewGenerationKonva } from "@/lib/templates/classic/new-generation/KonvaRenderer";

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

function StickerImage({ src }: { src: string }) {
  const [image] = useImage(src, "anonymous");
  return image ? <KonvaImage image={image} width={100} height={100} /> : null;
}

function CustomKonvaFrame({ componentId, primaryColor }: { componentId: string; primaryColor: string }) {
  if (componentId === "new-generation-arch") {
    return <NewGenerationKonva primaryColor={primaryColor} />;
  }
  return null;
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
  onClick: (e: any) => void;
}) {
  const { updateSticker, addSticker } = useBiodataStore();
  const asset = STICKER_ASSETS.find(a => a.id === sticker.type);
  const groupRef = useRef<Konva.Group>(null);

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
      draggable={isDesigner}
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

function SvgFrame({ config, primaryColor }: { config: FrameSvgConfig; primaryColor: string; }) {
  return (
    <Group>
      <Rect width={A4_W} height={A4_H} fill={config.bgColor || "#ffffff"} />
      <Rect x={config.outerInset} y={config.outerInset} width={A4_W - config.outerInset * 2} height={A4_H - config.outerInset * 2} stroke={primaryColor} strokeWidth={config.outerStrokeWidth} cornerRadius={config.outerCornerRadius} />
      <Rect x={config.innerInset} y={config.innerInset} width={A4_W - config.innerInset * 2} height={A4_H - config.innerInset * 2} stroke={primaryColor} strokeWidth={config.innerStrokeWidth} cornerRadius={config.innerCornerRadius} opacity={0.6} />
    </Group>
  );
}

function GradientFrame({ config, primaryColor, bgColors }: { config: FrameGradientConfig; primaryColor: string; bgColors: string[]; }) {
  return (
    <Group>
      <Rect 
        width={A4_W} 
        height={A4_H} 
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: A4_W, y: 0 }}
        fillLinearGradientColorStops={
          (bgColors || config.gradientColors).flatMap((color, i, arr) => [i / (arr.length - 1), color])
        }
      />
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
}

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export function KonvaPreview({ liveFormData, templateId, scale: propScale, isDesigner = false }: KonvaPreviewProps) {
  const { formData: storeFormData, selectedTemplate: storeTemplate, removeSticker, updateSticker } = useBiodataStore();
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
            setSelectedStickers([]);
          }
        }}
        style={{ cursor: isDesigner ? 'grab' : 'default' }}
      >
        <Layer listening={false}>
          <Rect x={4} y={4} width={A4_W} height={A4_H} fill="#000000" opacity={0.1} cornerRadius={2} />
          {templateConfig.frame.type === "image" ? (
            <ImageFrame config={templateConfig.frame} primaryColor={primaryColor} hasPhoto={hasPhoto} photoConfig={photoConfig} />
          ) : templateConfig.frame.type === "gradient" ? (
            <GradientFrame config={templateConfig.frame as FrameGradientConfig} primaryColor={primaryColor} bgColors={theme.bgColors} />
          ) : templateConfig.frame.type === "custom" ? (
            <>
              <Rect width={A4_W} height={A4_H} fill={templateConfig.frame.bgColor} />
              <CustomKonvaFrame componentId={templateConfig.frame.componentId} primaryColor={primaryColor} />
            </>
          ) : (
            <SvgFrame config={templateConfig.frame as FrameSvgConfig} primaryColor={primaryColor} />
          )}
          <Text x={A4_W / 2} y={A4_H - 30} text="www.biodatamaker.online" fontSize={8} fontFamily="Inter" fill="#cccccc" align="center" offsetX={50} />
        </Layer>
        <Layer>
          <Group clipX={0} clipY={0} clipWidth={A4_W} clipHeight={A4_H}>
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
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']}
              anchorSize={8}
              anchorCornerRadius={4}
              anchorStroke="#D4AF37"
              anchorFill="#ffffff"
              borderStroke="#D4AF37"
              keepRatio={false}
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

          {/* Selection Info */}
          {selectedStickers.length > 0 && (
            <div className="px-3 py-1.5 bg-primary/90 text-white text-[10px] font-bold rounded-full shadow-lg self-start pointer-events-auto flex items-center gap-2">
              <Layers className="w-3 h-3" />
              {selectedStickers.length} {selectedStickers.length === 1 ? 'Object' : 'Objects'} Selected
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
