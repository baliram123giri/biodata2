"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Stage, Layer, Rect, Text, Line, Image as KonvaImage, Group, Path, Transformer } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { translations } from "@/lib/translations";
import { getLightBgColor } from "@/lib/color-utils";
import { loadKonvaFonts, getKonvaFontFamily } from "@/lib/konva-fonts";
import { ZoomIn, ZoomOut, Maximize, Download, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { useColorizedFrameImage } from "@/hooks/useColorizedFrameImage";
import { getClientImageUrl } from "@/lib/utils";

if (typeof window !== "undefined") {
  Konva.pixelRatio = Math.max(window.devicePixelRatio || 1, 2);
}

const A4_W = 595;
const A4_H = 842;

interface KonvaTemplateDesignerProps {
  formState: any;
  onChange: (updatedFields: any) => void;
  previewPhotoFile?: string | null;
  template?: any;
  designerRef?: React.RefObject<any>;
  sections?: any[];
  mantra?: string;
  title?: string;
  mantraSignUrl?: string | null;
}

// ── Subcomponents for Designer ─────────────────────────────────────

const PhotoImage = React.memo(function PhotoImage({
  src,
  x,
  y,
  width,
  height,
  cornerRadius,
  borderColor,
}: {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  cornerRadius: number;
  borderColor: string;
}) {
  const resolvedSrc = getClientImageUrl(src);
  const [image] = useImage(resolvedSrc, resolvedSrc.startsWith("data:") ? undefined : "anonymous");

  let crop = undefined;
  if (image) {
    const imgWidth = image.width;
    const imgHeight = image.height;
    const containerRatio = width / height;
    const imageRatio = imgWidth / imgHeight;

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

  return (
    <Group>
      {image ? (
        <KonvaImage
          image={image}
          x={x}
          y={y}
          width={width}
          height={height}
          crop={crop}
          cornerRadius={cornerRadius}
        />
      ) : (
        <>
          {/* Silhouette placeholder inside photo area */}
          <Rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill="rgba(201, 168, 76, 0.08)"
            cornerRadius={cornerRadius}
          />
          {/* Head */}
          <Path
            data={`M ${x + width / 2} ${y + height * 0.4} A ${width * 0.2} ${width * 0.2} 0 1 0 ${x + width / 2} ${y + height * 0.4001}`}
            fill="none"
            stroke={borderColor || "#800000"}
            strokeWidth={2.5}
            opacity={0.4}
          />
          {/* Shoulders */}
          <Path
            data={`M ${x + width * 0.2} ${y + height * 0.9} C ${x + width * 0.2} ${y + height * 0.65}, ${x + width * 0.8} ${y + height * 0.65}, ${x + width * 0.8} ${y + height * 0.9}`}
            fill="none"
            stroke={borderColor || "#800000"}
            strokeWidth={2.5}
            opacity={0.4}
          />
        </>
      )}
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

export function KonvaTemplateDesigner({
  formState,
  onChange,
  previewPhotoFile,
  template,
  designerRef,
  sections: propSections,
  mantra,
  title,
  mantraSignUrl,
}: KonvaTemplateDesignerProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<Konva.Group>(null);
  const bgRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  const [stageSize, setStageSize] = useState({ width: A4_W, height: A4_H });
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [fontsReady, setFontsReady] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedId = selectedIds.length === 1 ? selectedIds[0] : null;
  const setSelectedId = (id: string | null) => {
    setSelectedIds(id ? [id] : []);
  };
  const [isStageDraggable, setIsStageDraggable] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.code === "Space") {
        setIsSpacePressed(true);
        const stage = stageRef.current;
        if (stage) stage.container().style.cursor = 'grab';
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        const stage = stageRef.current;
        if (stage) stage.container().style.cursor = 'default';
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (designerRef) {
      (designerRef as any).current = {
        selectElement: (id: string) => {
          setSelectedIds([id]);
        },
        captureThumbnail: async () => {
          const prevSelected = [...selectedIds];
          setSelectedIds([]); // Clear selection to hide bounding boxes
          
          // Wait a tick for React to re-render without selection highlights
          await new Promise((resolve) => setTimeout(resolve, 80));
          
          const stage = stageRef.current;
          if (!stage) return null;
          
          // Hide transformer node if any is active
          const transformer = transformerRef.current;
          let oldNodes: Konva.Node[] = [];
          if (transformer) {
            oldNodes = transformer.nodes();
            transformer.nodes([]);
            transformer.getLayer()?.batchDraw();
          }
          
          // Save original state
          const oldScaleX = stage.scaleX();
          const oldScaleY = stage.scaleY();
          const oldX = stage.x();
          const oldY = stage.y();
          const oldWidth = stage.width();
          const oldHeight = stage.height();

          // Temporarily set to A4 absolute dimensions for precise thumbnail capture
          stage.scaleX(1);
          stage.scaleY(1);
          stage.x(0);
          stage.y(0);
          stage.width(A4_W);
          stage.height(A4_H);
          stage.draw();

          const dataUrl = stage.toDataURL({
            pixelRatio: 2, // high quality
            mimeType: "image/png"
          });

          // Restore original state
          stage.scaleX(oldScaleX);
          stage.scaleY(oldScaleY);
          stage.x(oldX);
          stage.y(oldY);
          stage.width(oldWidth);
          stage.height(oldHeight);
          stage.draw();
          
          // Restore selections
          setSelectedIds(prevSelected);
          if (transformer && oldNodes.length > 0) {
            transformer.nodes(oldNodes);
            transformer.getLayer()?.batchDraw();
          }
          
          return dataUrl;
        }
      };
    }
    return () => {
      if (designerRef) {
        (designerRef as any).current = null;
      }
    };
  }, [designerRef, selectedIds]);

  // Per-section drag offsets: { [sectionKey]: { x, y } }
  const sectionOffsets: Record<string, { x: number; y: number }> = useMemo(() => {
    try { return JSON.parse(formState.sectionOffsets || "{}"); } catch { return {}; }
  }, [formState.sectionOffsets]);

  // Per-section text style overrides: { [sectionKey]: { color, fontSize, fontStyle, textTransform } }
  const sectionStyles: Record<string, any> = useMemo(() => {
    try { return JSON.parse(formState.sectionStyles || "{}"); } catch { return {}; }
  }, [formState.sectionStyles]);

  const updateSectionOffset = (key: string, x: number, y: number) => {
    const next = { ...sectionOffsets, [key]: { x, y } };
    onChange({ sectionOffsets: JSON.stringify(next) });
  };

  const updateSectionStyle = (key: string, patch: Record<string, any>) => {
    const next = { ...sectionStyles, [key]: { ...(sectionStyles[key] || {}), ...patch } };
    onChange({ sectionStyles: JSON.stringify(next) });
  };


  const primaryColor = formState.defaultPrimary || "#9B1B30";
  const secondaryColor = formState.defaultSecondary || "#333333";
  const accentColor = formState.defaultAccent || "#C9A84C";
  const bgColor = formState.frameBgColor || "#ffffff";
  const getNum = (val: any, fallback: number) => {
    if (val === undefined || val === null || val === "") return fallback;
    const n = parseFloat(val);
    return isNaN(n) ? fallback : n;
  };

  const basePad = getNum(formState.defaultPadding, 60);
  const baseYPad = getNum(formState.defaultYPadding, basePad);

  const paddingTop = getNum(formState.defaultPaddingTop, baseYPad);
  const paddingLeft = getNum(formState.defaultPaddingLeft, basePad);
  const paddingRight = getNum(formState.defaultPaddingRight, basePad);

  const px = parseFloat(formState.photoX) || 390;
  const py = parseFloat(formState.photoY) || 100;
  const pw = parseFloat(formState.photoWidth) || 100;
  const ph = parseFloat(formState.photoHeight) || 130;
  const pr = parseFloat(formState.photoCornerRadius) || 8;

  const outerInset = parseFloat(formState.frameOuterInset) || 10;
  const outerStroke = parseFloat(formState.frameOuterStrokeWidth) || 2;
  const outerRadius = parseFloat(formState.frameOuterCornerRadius) || 8;

  const innerInset = parseFloat(formState.frameInnerInset) || 16;
  const innerStroke = parseFloat(formState.frameInnerStrokeWidth) || 1;
  const innerRadius = parseFloat(formState.frameInnerCornerRadius) || 6;

  // Background gradient support
  const bgGradientColors = formState.frameBgGradientColors
    ? formState.frameBgGradientColors.split(",").map((c: string) => c.trim())
    : ["#ffffff", "#f9e8e8"];

  // Border gradient support
  const frameGradientColors = formState.frameGradientColors
    ? formState.frameGradientColors.split(",").map((c: string) => c.trim())
    : ["#4F46E5", "#06B6D4"];

  // Watermark SVG/WebP image
  const watermarkSrc = formState.bgImageFile || formState.bgImageUrl || "";
  const resolvedWatermarkSrc = getClientImageUrl(watermarkSrc);
  const [watermarkImage] = useImage(resolvedWatermarkSrc, resolvedWatermarkSrc.startsWith("data:") ? undefined : "anonymous");

  // Custom frame template PNG/SVG
  const frameImageSrc = formState.frameFile || template?.frameUrlTemplate || null;
  const frameImage = useColorizedFrameImage(
    frameImageSrc,
    "",
    formState.enableSvgTint ? formState.defaultPrimary : "",
    "",
    formState.enableSvgTint ? formState.defaultAccent : ""
  );

  // Resolve selected font key → CSS family name for Konva Text nodes
  const fontFamily = getKonvaFontFamily(formState.defaultFontFamily || "noto");

  useEffect(() => {
    loadKonvaFonts([fontFamily, "Noto Sans Devanagari"]).then(() => {
      setFontsReady(true);
    });
  }, [fontFamily]);

  // Adjust Stage sizing responsively to fit A4 ratio inside its wrapper card
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const { width, height } = el.getBoundingClientRect();
      setStageSize({ width, height });
      const initialScale = Math.min(width / A4_W, height / A4_H);
      setScale(initialScale);
      setStagePos({
        x: (width - A4_W * initialScale) / 2,
        y: (height - A4_H * initialScale) / 2,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleWheel = (e: any) => {
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

  const handleMouseDown = (e: any) => {
    const isLeftClick = e.evt.button === 0;
    if (!isLeftClick) return;

    const clickedOnEmpty = e.target === e.target.getStage();
    const clickedOnBackground = e.target.name() === "bg-rect";

    if (isSpacePressed || clickedOnEmpty) {
      const stage = e.target.getStage();
      if (stage) {
        stage.container().style.cursor = 'grabbing';
      }
    } else if (clickedOnBackground) {
      // Stop the stage drag immediately so we can draw selection box instead
      const stage = e.target.getStage();
      if (stage) {
        stage.stopDrag();
        stage.container().style.cursor = 'default';
        const pointer = stage.getPointerPosition();
        if (pointer) {
          const localPt = stage.getAbsoluteTransform().copy().invert().point(pointer);
          setSelectionBox({
            x1: localPt.x,
            y1: localPt.y,
            x2: localPt.x,
            y2: localPt.y
          });
        }
      }
    }
  };

  const handleMouseMove = (e: any) => {
    if (selectionBox) {
      const stage = e.target.getStage();
      if (stage) {
        const pointer = stage.getPointerPosition();
        if (pointer) {
          const localPt = stage.getAbsoluteTransform().copy().invert().point(pointer);
          setSelectionBox(prev => prev ? { ...prev, x2: localPt.x, y2: localPt.y } : null);
        }
      }
    }
  };

  const handleMouseUp = (e: any) => {
    // Reset cursor based on where the mouse is released
    const stage = e.target.getStage();
    if (stage) {
      const clickedOnEmpty = e.target === stage;
      stage.container().style.cursor = (isSpacePressed || clickedOnEmpty) ? 'grab' : 'default';
    }

    if (selectionBox) {
      const x1 = Math.min(selectionBox.x1, selectionBox.x2);
      const x2 = Math.max(selectionBox.x1, selectionBox.x2);
      const y1 = Math.min(selectionBox.y1, selectionBox.y2);
      const y2 = Math.max(selectionBox.y1, selectionBox.y2);

      const width = x2 - x1;
      const height = y2 - y1;

      // Skip very tiny drag/click to prevent accidental drag select clear
      if (width > 5 || height > 5) {
        const matchedIds: string[] = [];

        // Check text sections
        layout.sectionLayouts.forEach((sec: any, secIdx: number) => {
          const secKey = `sec-${secIdx}`;
          const bounds = getElementBounds(secKey);
          if (bounds) {
            const overlap = !(
              bounds.x > x2 ||
              bounds.x + bounds.width < x1 ||
              bounds.y > y2 ||
              bounds.y + bounds.height < y1
            );
            if (overlap) {
              matchedIds.push(secKey);
            }
          }
        });

        // Check Photo
        const photoBounds = getElementBounds("photo");
        if (photoBounds) {
          const overlap = !(
            photoBounds.x > x2 ||
            photoBounds.x + photoBounds.width < x1 ||
            photoBounds.y > y2 ||
            photoBounds.y + photoBounds.height < y1
          );
          if (overlap) {
            matchedIds.push("photo");
          }
        }

        // Check Watermark
        if (watermarkImage) {
          const wmBounds = getElementBounds("watermark");
          if (wmBounds) {
            const overlap = !(
              wmBounds.x > x2 ||
              wmBounds.x + wmBounds.width < x1 ||
              wmBounds.y > y2 ||
              wmBounds.y + wmBounds.height < y1
            );
            if (overlap) {
              matchedIds.push("watermark");
            }
          }
        }

        // Check Frame Image
        if (formState.frameType === "image" && frameImage) {
          const frameBounds = getElementBounds("frame");
          if (frameBounds) {
            const overlap = !(
              frameBounds.x > x2 ||
              frameBounds.x + frameBounds.width < x1 ||
              frameBounds.y > y2 ||
              frameBounds.y + frameBounds.height < y1
            );
            if (overlap) {
              matchedIds.push("frame");
            }
          }
        }

        setSelectedIds(matchedIds);
      }
      setSelectionBox(null);
    }
  };

  const handleFitToScreen = () => {
    const el = containerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const initialScale = Math.min(width / A4_W, height / A4_H);
    setScale(initialScale);
    setStagePos({
      x: (width - A4_W * initialScale) / 2,
      y: (height - A4_H * initialScale) / 2,
    });
  };

  const handleDownloadPreview = async () => {
    try {
      const prevSelected = [...selectedIds];
      setSelectedIds([]); // Clear selection to hide bounding boxes
      
      // Wait a tick for React to re-render without selection highlights
      await new Promise((resolve) => setTimeout(resolve, 80));
      
      const stage = stageRef.current;
      if (!stage) return;
      
      // Hide transformer node if any is active
      const transformer = transformerRef.current;
      let oldNodes: Konva.Node[] = [];
      if (transformer) {
        oldNodes = transformer.nodes();
        transformer.nodes([]);
        transformer.getLayer()?.batchDraw();
      }
      
      // Save original state
      const oldScaleX = stage.scaleX();
      const oldScaleY = stage.scaleY();
      const oldX = stage.x();
      const oldY = stage.y();
      const oldWidth = stage.width();
      const oldHeight = stage.height();

      // Temporarily set to A4 absolute dimensions for precise thumbnail capture
      stage.scaleX(1);
      stage.scaleY(1);
      stage.x(0);
      stage.y(0);
      stage.width(A4_W);
      stage.height(A4_H);
      stage.draw();

      const dataUrl = stage.toDataURL({
        pixelRatio: 2.5, // high quality
        mimeType: "image/png"
      });

      // Restore original state
      stage.scaleX(oldScaleX);
      stage.scaleY(oldScaleY);
      stage.x(oldX);
      stage.y(oldY);
      stage.width(oldWidth);
      stage.height(oldHeight);
      stage.draw();
      
      // Restore selections
      setSelectedIds(prevSelected);
      if (transformer && oldNodes.length > 0) {
        transformer.nodes(oldNodes);
        transformer.getLayer()?.batchDraw();
      }

      // Download the image using file-saver
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const { saveAs } = await import("file-saver");
      const fileName = `${formState.name || "template"}_preview_hq_${Date.now()}.png`;
      saveAs(blob, fileName);
    } catch (err) {
      console.error("Failed to download preview:", err);
    }
  };

  // Update Transformer nodes on selection change
  useEffect(() => {
    if (selectedIds.length > 0 && transformerRef.current) {
      const stage = stageRef.current;
      if (stage) {
        const nodes = selectedIds
          .map(id => stage.findOne("#" + id))
          .filter((node): node is Konva.Node => !!node);
        transformerRef.current.nodes(nodes);
        transformerRef.current.getLayer()?.batchDraw();
        return;
      }
    }
    transformerRef.current?.nodes([]);
  }, [selectedIds, formState]);

  // Simulated Fields for Layout Calculations
  const currentLang = formState.language || "English";
  const t = translations[currentLang] || translations["English"];

  const sections = useMemo(() => {
    if (propSections && propSections.length > 0) {
      return propSections;
    }
    
    const lang = formState.language || "English";
    const getDummyVal = (key: string, defaultVal: string) => {
      const dummies: Record<string, Record<string, string>> = {
        "English": {
          "p1": "Rahul Anil Sharma",
          "p2": "15 October 1995",
          "p3": "10:15 AM",
          "p4": "Mumbai, Maharashtra",
          "p5": "5 ft 10 in",
          "e1": "B.Tech in Computer Science",
          "e2": "Senior Software Engineer",
          "e3": "₹ 28,00,000 PA",
          "f1": "Mr. Anil Kumar Sharma",
          "f2": "Mrs. Sunita Sharma",
          "f3": "Pune, Maharashtra",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "हिंदी": {
          "p1": "राहुल अनिल शर्मा",
          "p2": "15 अक्टूबर 1995",
          "p3": "10:15 AM",
          "p4": "मुंबई, महाराष्ट्र",
          "p5": "5 फीट 10 इंच",
          "e1": "बी.टेक कंप्यूटर साइंस",
          "e2": "वरिष्ठ सॉफ्टवेयर इंजीनियर",
          "e3": "₹ 28,00,000 प्रति वर्ष",
          "f1": "श्री अनिल कुमार शर्मा",
          "f2": "श्रीमती सुनीता शर्मा",
          "f3": "पुणे, महाराष्ट्र",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "मराठी": {
          "p1": "राहुल अनिल शर्मा",
          "p2": "15 ऑक्टोबर 1995",
          "p3": "10:15 AM",
          "p4": "मुंबई, महाराष्ट्र",
          "p5": "5 फूट 10 इंच",
          "e1": "बी.टेक संगणक शास्त्र",
          "e2": "वरिष्ठ सॉफ्टवेअर इंजिनिअर",
          "e3": "₹ 28,00,000 प्रति वर्ष",
          "f1": "श्री अनिल कुमार शर्मा",
          "f2": "श्रीमتی सुनीता शर्मा",
          "f3": "पुणे, महाराष्ट्र",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "ગુજરાતી": {
          "p1": "રાહુલ અનિલ શર્મા",
          "p2": "15 ઓક્ટોબર 1995",
          "p3": "10:15 AM",
          "p4": "મુંબઈ, મહારાષ્ટ્ર",
          "p5": "5 ફૂટ 10 ઇંચ",
          "e1": "બી.ટેક કમ્પ્યુટર સાયન્સ",
          "e2": "સીનિયર સોફ્ટવેર એન્જિનિયર",
          "e3": "₹ 28,00,000 પ્રતિ વર્ષ",
          "f1": "શ્રી અનિલ કુમાર શર્મા",
          "f2": "શ્રીમતી સુનીતા શર્મા",
          "f3": "પુણે, મહારાષ્ટ્ર",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "বাংলা": {
          "p1": "রাহুল অনিল শর্মা",
          "p2": "15 অক্টোবর ১৯৯৫",
          "p3": "10:15 AM",
          "p4": "মুম্বাই, মহারাষ্ট্র",
          "p5": "5 ফুট 10 ইঞ্চি",
          "e1": "বি.টেক কম্পিউটার সায়েন্স",
          "e2": "সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার",
          "e3": "₹ 28,00,000 প্রতি বছর",
          "f1": "শ্রী অনিল কুমার শর্মা",
          "f2": "শ্রীমতী সুনীতা শর্মা",
          "f3": "পুনে, মহারাষ্ট্র",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "தமிழ்": {
          "p1": "ராகுல் அனில் சர்மா",
          "p2": "15 அக்டோபர் 1995",
          "p3": "முற்பகல் 10:15",
          "p4": "மும்பை, மகாராஷ்டிரா",
          "p5": "5 அடி 10 அங்குலம்",
          "e1": "பி.டெக் கணினி அறிவியல்",
          "e2": "மூத்த மென்பொருள் பொறியாளர்",
          "e3": "₹ 28,00,000 ஆண்டுக்கு",
          "f1": "திரு. அனில் குமார் சர்மா",
          "f2": "திருமதி. சுனிதா சர்மா",
          "f3": "புனே, மகாராஷ்டிரா",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "తెలుగు": {
          "p1": "రాహుల్ అనిల్ శర్మ",
          "p2": "15 అక్టోబర్ 1995",
          "p3": "ఉదయం 10:15",
          "p4": "ముంబై, మహారాష్ట్ర",
          "p5": "5 అడుగుల 10 అంగుళాలు",
          "e1": "బి.టెక్ కంప్యూటర్ సైన్స్",
          "e2": "సీనియర్ సాఫ్ట్‌వేర్ ఇంజనీర్",
          "e3": "₹ 28,00,000 సంవత్సరానికి",
          "f1": "శ్రీ అనిల్ కుమార్ శర్మ",
          "f2": "శ్రీమతి సునీత శర్మ",
          "f3": "పూణే, మహారాష్ట్ర",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "ಕನ್ನಡ": {
          "p1": "ರಾಹುಲ್ ಅನಿಲ್ ಶರ್ಮ",
          "p2": "15 ಅಕ್ಟೋಬರ್ 1995",
          "p3": "ಬೆಳಿಗ್ಗೆ 10:15",
          "p4": "ಮುಂಬೈ, ಮಹಾರಾಷ್ಟ್ರ",
          "p5": "5 ಅಡಿ 10 ಇಂಚು",
          "e1": "ಬಿ.ಟೆಕ್ ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್",
          "e2": "ಹಿರಿಯ ಸಾಫ್ಟ್‌ವೇರ್ ಎಂಜಿನಿಯರ್",
          "e3": "₹ 28,00,000 ವಾರ್ಷಿಕ",
          "f1": "ಶ್ರೀ ಅನಿಲ್ ಕುಮಾರ್ ಶರ್ಮ",
          "f2": "ಶ್ರೀಮತಿ ಸುನೀತ ಶರ್ಮ",
          "f3": "ಪುಣೆ, ಮಹಾರಾಷ್ಟ್ರ",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "ਪੰਜਾਬੀ": {
          "p1": "ਰਾਹੁਲ ਅਨਿਲ ਸ਼ਰਮਾ",
          "p2": "15 ਅਕਤੂਬਰ 1995",
          "p3": "ਸਵੇਰੇ 10:15",
          "p4": "ਮੁੰਬਈ, ਮਹਾਰਾਸ਼ਟਰ",
          "p5": "5 ਫੁੱਟ 10 ਇੰਚ",
          "e1": "ਬੀ.ਟੈਕ ਕੰਪਿਊਟਰ ਸਾਇੰਸ",
          "e2": "ਸੀਨੀਅਰ ਸਾਫਟਵੇਅਰ ਇੰਜੀਨੀਅਰ",
          "e3": "₹ 28,00,000 ਸਾਲਾਨਾ",
          "f1": "ਸ਼੍ਰੀ ਅਨਿਲ ਕੁਮਾਰ ਸ਼ਰਮਾ",
          "f2": "ਸ਼੍ਰੀਮਤੀ ਸੁਨੀਤਾ ਸ਼ਰਮਾ",
          "f3": "ਪੁਣੇ, ਮਹਾਰਾਸ਼ਟਰ",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        },
        "Urdu": {
          "p1": "راہول انیل شرما",
          "p2": "15 اکتوبر 1995",
          "p3": "10:15 صبح",
          "p4": "ممبئی، مہاراشٹر",
          "p5": "5 فٹ 10 انچ",
          "e1": "بی ٹیک کمپیوٹر سائنس",
          "e2": "سینئر سافٹ ویئر انجینئر",
          "e3": "₹ 28,00,000 سالانہ",
          "f1": "جناب انیلکمار شرما",
          "f2": "محترمہ سنیتا شرما",
          "f3": "پونے، مہاراشٹر",
          "c1": "+91 98765 43210",
          "c2": "rahul.sharma@example.com",
        }
      };
      return dummies[lang]?.[key] || dummies["English"][key] || defaultVal;
    };

    return [
      {
        key: "personal",
        title: t.personal || "Personal Details",
        fields: [
          { id: "p1", displayLabel: t.fullName || "Full Name", displayValue: getDummyVal("p1", "Rahul Anil Sharma") },
          { id: "p2", displayLabel: t.dateOfBirth || "Date of Birth", displayValue: getDummyVal("p2", "15 October 1995") },
          { id: "p3", displayLabel: t.timeOfBirth || "Time of Birth", displayValue: getDummyVal("p3", "10:15 AM") },
          { id: "p4", displayLabel: t.placeOfBirth || "Place of Birth", displayValue: getDummyVal("p4", "Mumbai, Maharashtra") },
          { id: "p5", displayLabel: t.height || "Height", displayValue: getDummyVal("p5", "5 ft 10 in") },
        ],
      },
      {
        key: "educationSec",
        title: t.educationSec || "Education & Career",
        fields: [
          { id: "e1", displayLabel: t.education || "Education", displayValue: getDummyVal("e1", "B.Tech in Computer Science") },
          { id: "e2", displayLabel: t.occupation || "Occupation", displayValue: getDummyVal("e2", "Senior Software Engineer") },
          { id: "e3", displayLabel: t.annualIncome || "Annual Income", displayValue: getDummyVal("e3", "₹ 28,00,000 PA") },
        ],
      },
      {
        key: "family",
        title: t.family || "Family Background",
        fields: [
          { id: "f1", displayLabel: t.fatherName || "Father's Name", displayValue: getDummyVal("f1", "Mr. Anil Kumar Sharma") },
          { id: "f2", displayLabel: t.motherName || "Mother's Name", displayValue: getDummyVal("f2", "Mrs. Sunita Sharma") },
          { id: "f3", displayLabel: t.nativePlace || "Native Place", displayValue: getDummyVal("f3", "Pune, Maharashtra") },
        ],
      },
      {
        key: "contact",
        title: t.contact || "Contact Details",
        fields: [
          { id: "c1", displayLabel: t.mobile || "Mobile", displayValue: getDummyVal("c1", "+91 98765 43210") },
          { id: "c2", displayLabel: t.email || "Email", displayValue: getDummyVal("c2", "rahul.sharma@example.com") },
        ],
      },
    ];
  }, [t, propSections, formState.language]);

  // Layout math calculations mirrored exactly from KonvaPreview.tsx
  const layout = useMemo(() => {
    let cursorY = paddingTop + 20;
    const baseFontSize = getNum(formState.defaultFontSize, 9);
    
    // Header mantra & document title space offset
    cursorY += baseFontSize * 2; // Mantra
    cursorY += baseFontSize * 2.8; // Title

    const LABEL_WIDTH = 130;
    const COLON_WIDTH = 20;
    const LINE_SPACING = baseFontSize * 0.5 + 2;
    const contentWidth = A4_W - paddingLeft - paddingRight - 10;
    const standardHalfW = (contentWidth - 12) / 2;
    const standardLabelW = Math.round(standardHalfW * 0.45);
    const sectionLayouts: any[] = [];

    sections.forEach((sec, secIdx) => {
      const secKey = `sec-${secIdx}`;
      const style = sectionStyles[secKey] || {};
      const secFontSize = style.fontSize ? Number(style.fontSize) : baseFontSize;
      const secLineSpacing = secFontSize * 0.5 + 2;

      const titleY = cursorY;
      cursorY += Math.round(secFontSize * 1.4) + secLineSpacing + 16;
      const fieldLayouts: any[] = [];

      let i = 0;
      while (i < sec.fields.length) {
        const field = sec.fields[i];
        const valText = String(field.displayValue);

        let rowWidth = contentWidth;
        if (
          cursorY >= py - 15 &&
          cursorY <= py + ph + 15
        ) {
          rowWidth = px - paddingLeft - 20; // Flow text left of photo area
        }

        const isTwoCol = formState.detailsLayout === "two-column";
        const nextField = sec.fields[i + 1];
        const canPair =
          isTwoCol &&
          nextField &&
          valText.length < 16 &&
          field.displayLabel.length < 13 &&
          nextField.displayValue.length < 16 &&
          nextField.displayLabel.length < 13 &&
          !(
            cursorY >= py - 15 &&
            cursorY <= py + ph + 15
          );

        if (canPair) {
          const halfW = (rowWidth - 12) / 2;
          const labelW = Math.round(halfW * 0.45);
          const valueW = halfW - labelW - 10;

          fieldLayouts.push({
            id: field.id,
            label: field.displayLabel,
            value: valText,
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
            y: cursorY,
            availableWidth: valueW,
            isHalf: true,
            colIndex: 1,
            halfW,
            labelW,
          });

          cursorY += secFontSize * 1.35 + secLineSpacing;
          i += 2;
        } else {
          const halfW = (rowWidth - 12) / 2;
          const labelW = Math.round(halfW * 0.45);
          const unpairedLabelW = isTwoCol ? standardLabelW : LABEL_WIDTH;
          const valueW = rowWidth - unpairedLabelW - COLON_WIDTH;
          const valW = valText.length * secFontSize * 0.6;
          const lines = Math.ceil(valW / valueW) || 1;
          const rowHeight = Math.max(secFontSize, lines * secFontSize * 1.1);

          fieldLayouts.push({
            id: field.id,
            label: field.displayLabel,
            value: valText,
            y: cursorY,
            availableWidth: valueW,
            isHalf: false,
            labelW: unpairedLabelW,
          });
          cursorY += rowHeight + secLineSpacing;
          i += 1;
        }
      }

      sectionLayouts.push({
        key: sec.key,
        titleText: sec.title,
        titleY,
        fields: fieldLayouts,
      });
      cursorY += secFontSize * 1.5;
    });

    return { sectionLayouts, fSize: baseFontSize };
  }, [sections, paddingTop, paddingLeft, paddingRight, formState.defaultFontSize, formState.detailsLayout, px, py, ph, sectionStyles]);

  const resolvedMantraSignUrl = getClientImageUrl(mantraSignUrl);
  const [signImage] = useImage(resolvedMantraSignUrl || "", resolvedMantraSignUrl?.startsWith("data:") ? undefined : "anonymous");

  const mantraGeometry = useMemo(() => {
    if (!mantraSignUrl) return null;
    const textVal = mantra || (currentLang === "हिंदी" ? "॥ श्री गणेशाय नमः ॥" : "|| Shree Ganeshay Namah ||");
    const textWidth = textVal.length * (layout.fSize * 1.2 * 0.5);
    const align = sectionStyles["header"]?.textAlign || "center";
    const imgW = 45;
    const gap = 7;
    
    if (align === "left") {
      return {
        leftX: paddingLeft,
        rightX: paddingLeft + textWidth + gap * 2 + imgW,
      };
    } else if (align === "right") {
      return {
        leftX: A4_W - paddingRight - textWidth - gap * 2 - imgW,
        rightX: A4_W - paddingRight,
      };
    } else {
      const halfW = textWidth / 2;
      return {
        leftX: A4_W / 2 - halfW - gap - imgW,
        rightX: A4_W / 2 + halfW + gap + imgW,
      };
    }
  }, [mantra, mantraSignUrl, layout.fSize, currentLang, sectionStyles, paddingLeft, paddingRight]);

  const isSectionId = useCallback((id: string) => {
    return id.startsWith("sec-") || ["personal", "educationSec", "family", "contact", "header"].includes(id);
  }, []);

  const getSectionData = useCallback((id: string) => {
    let sec = layout.sectionLayouts.find((s: any) => s.key === id);
    let secIdx = -1;
    if (!sec && id.startsWith("sec-")) {
      const idx = Number(id.replace("sec-", ""));
      sec = layout.sectionLayouts[idx];
      secIdx = idx;
    } else if (sec) {
      secIdx = layout.sectionLayouts.findIndex((s: any) => s.key === id);
    }
    return { sec, secIdx };
  }, [layout]);

  const selectedSectionStyle = selectedId && isSectionId(selectedId)
    ? (() => {
        const { sec, secIdx } = getSectionData(selectedId);
        const lookupKey = sec?.key || selectedId;
        return sectionStyles[lookupKey] || sectionStyles[`sec-${secIdx}`] || {};
      })()
    : null;

  const handleSetCursor = useCallback((cursorType: string) => {
    const stage = stageRef.current;
    if (stage) {
      stage.container().style.cursor = cursorType;
    }
  }, []);

  // Multi-selection drag starts coordinate tracking
  const dragStartPositions = useRef<Record<string, { x: number; y: number }>>({});

  const handleElementSelect = (id: string, isShift: boolean) => {
    if (isShift) {
      if (selectedIds.includes(id)) {
        setSelectedIds(prev => prev.filter(item => item !== id));
      } else {
        setSelectedIds(prev => [...prev, id]);
      }
    } else {
      setSelectedIds([id]);
    }
  };

  const getElementBounds = (id: string) => {
    if (id === "header") {
      const offset = sectionOffsets["header"] || { x: 0, y: 0 };
      return {
        x: offset.x,
        y: offset.y + paddingTop + 10,
        width: A4_W,
        height: 75
      };
    }
    if (id === "photo") {
      return { x: px, y: py, width: pw, height: ph };
    }
    if (id === "watermark") {
      const wx = parseFloat(formState.bgImageX) || 0;
      const wy = parseFloat(formState.bgImageY) || 0;
      const ww = parseFloat(formState.bgImageWidth) || 595;
      const wh = parseFloat(formState.bgImageHeight) || 842;
      return { x: wx, y: wy, width: ww, height: wh };
    }
    if (isSectionId(id)) {
      const { sec, secIdx } = getSectionData(id);
      if (sec) {
        const lookupKey = sec.key || `sec-${secIdx}`;
        const offset = sectionOffsets[lookupKey] || sectionOffsets[`sec-${secIdx}`] || { x: 0, y: 0 };
        const style = sectionStyles[lookupKey] || sectionStyles[`sec-${secIdx}`] || {};
        const fSize = style.fontSize ? Number(style.fontSize) : layout.fSize;
        const lastField = sec.fields[sec.fields.length - 1];
        const height = lastField ? (lastField.y + fSize * 2 - sec.titleY) : 40;
        return {
          x: offset.x + paddingLeft,
          y: offset.y + sec.titleY,
          width: A4_W - paddingLeft - paddingRight,
          height: height
        };
      }
    }
    return null;
  };

  const updateElementPos = (id: string, newX: number, newY: number, updates: Record<string, any> = {}) => {
    const getCurrentOffsets = () => {
      if (updates.sectionOffsets) {
        try { return JSON.parse(updates.sectionOffsets); } catch (e) { return sectionOffsets; }
      }
      return sectionOffsets;
    };

    if (id === "photo") {
      updates.photoX = String(newX);
      updates.photoY = String(newY);
    } else if (id === "watermark") {
      updates.bgImageX = String(newX);
      updates.bgImageY = String(newY);
    } else if (id === "header") {
      const nextOffsets = {
        ...getCurrentOffsets(),
        "header": { x: newX, y: newY - (paddingTop + 10) }
      };
      updates.sectionOffsets = JSON.stringify(nextOffsets);
    } else if (isSectionId(id)) {
      const { sec, secIdx } = getSectionData(id);
      if (sec) {
        const storeKey = sec.key || `sec-${secIdx}`;
        const nextOffsets = {
          ...getCurrentOffsets(),
          [storeKey]: { x: newX - paddingLeft, y: newY - sec.titleY }
        };
        updates.sectionOffsets = JSON.stringify(nextOffsets);
      }
    }
  };

  useEffect(() => {
    const handleArrowKeys = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code) && selectedIds.length > 0) {
        e.preventDefault();
        
        const step = e.shiftKey ? 10 : 1;
        let deltaX = 0;
        let deltaY = 0;
        
        if (e.code === "ArrowUp") deltaY = -step;
        if (e.code === "ArrowDown") deltaY = step;
        if (e.code === "ArrowLeft") deltaX = -step;
        if (e.code === "ArrowRight") deltaX = step;

        const updates: Record<string, any> = {};
        
        selectedIds.forEach(id => {
          const bounds = getElementBounds(id);
          if (bounds) {
            updateElementPos(id, bounds.x + deltaX, bounds.y + deltaY, updates);
          }
        });

        if (Object.keys(updates).length > 0) {
          onChange(updates);
        }
      }
    };

    window.addEventListener("keydown", handleArrowKeys);
    return () => window.removeEventListener("keydown", handleArrowKeys);
  }, [selectedIds, sectionOffsets, paddingTop, paddingLeft, paddingRight, onChange, formState]);

  const handleDragStart = () => {
    const startPos: Record<string, { x: number; y: number }> = {};
    selectedIds.forEach(id => {
      const bounds = getElementBounds(id);
      if (bounds) {
        startPos[id] = { x: bounds.x, y: bounds.y };
      }
    });
    dragStartPositions.current = startPos;
  };

  const handleMultiDragEnd = (draggedId: string, finalX: number, finalY: number) => {
    const startPos = dragStartPositions.current[draggedId];
    if (!startPos) return;
    const deltaX = finalX - startPos.x;
    const deltaY = finalY - startPos.y;

    const updates: Record<string, any> = {};
    selectedIds.forEach(id => {
      const sPos = dragStartPositions.current[id];
      if (sPos) {
        const targetX = sPos.x + deltaX;
        const targetY = sPos.y + deltaY;
        updateElementPos(id, targetX, targetY, updates);
      }
    });

    if (Object.keys(updates).length > 0) {
      onChange(updates);
    }
  };

  const handleAlign = (alignmentType: string) => {
    if (selectedIds.length === 0) return;

    const boundsList = selectedIds
      .map(id => ({ id, bounds: getElementBounds(id) }))
      .filter((item): item is { id: string; bounds: NonNullable<ReturnType<typeof getElementBounds>> } => !!item.bounds);

    if (boundsList.length === 0) return;

    const updates: Record<string, any> = {};

    if (boundsList.length === 1) {
      const { id, bounds } = boundsList[0];
      let newX = bounds.x;
      let newY = bounds.y;

      if (alignmentType === "left") {
        newX = isSectionId(id) ? paddingLeft : 0;
      } else if (alignmentType === "center") {
        newX = Math.round((A4_W - bounds.width) / 2);
      } else if (alignmentType === "right") {
        newX = isSectionId(id) ? A4_W - paddingLeft - paddingRight - bounds.width : A4_W - bounds.width;
      } else if (alignmentType === "top") {
        newY = 0;
      } else if (alignmentType === "middle") {
        newY = Math.round((A4_H - bounds.height) / 2);
      } else if (alignmentType === "bottom") {
        newY = A4_H - bounds.height;
      }

      updateElementPos(id, newX, newY, updates);
    } else {
      const minX = Math.min(...boundsList.map(b => b.bounds.x));
      const maxX = Math.max(...boundsList.map(b => b.bounds.x + b.bounds.width));
      const minY = Math.min(...boundsList.map(b => b.bounds.y));
      const maxY = Math.max(...boundsList.map(b => b.bounds.y + b.bounds.height));
      const totalWidth = maxX - minX;
      const totalHeight = maxY - minY;

      if (alignmentType === "left") {
        boundsList.forEach(item => updateElementPos(item.id, minX, item.bounds.y, updates));
      } else if (alignmentType === "center") {
        boundsList.forEach(item => {
          const newX = Math.round(minX + (totalWidth - item.bounds.width) / 2);
          updateElementPos(item.id, newX, item.bounds.y, updates);
        });
      } else if (alignmentType === "right") {
        boundsList.forEach(item => {
          const newX = Math.round(maxX - item.bounds.width);
          updateElementPos(item.id, newX, item.bounds.y, updates);
        });
      } else if (alignmentType === "top") {
        boundsList.forEach(item => updateElementPos(item.id, item.bounds.x, minY, updates));
      } else if (alignmentType === "middle") {
        boundsList.forEach(item => {
          const newY = Math.round(minY + (totalHeight - item.bounds.height) / 2);
          updateElementPos(item.id, item.bounds.x, newY, updates);
        });
      } else if (alignmentType === "bottom") {
        boundsList.forEach(item => {
          const newY = Math.round(maxY - item.bounds.height);
          updateElementPos(item.id, item.bounds.x, newY, updates);
        });
      } else if (alignmentType === "distributeV" && boundsList.length >= 3) {
        const sorted = [...boundsList].sort((a, b) => a.bounds.y - b.bounds.y);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const sumHeights = sorted.reduce((sum, item) => sum + item.bounds.height, 0);
        const totalDist = last.bounds.y + last.bounds.height - first.bounds.y;
        const totalGapSpace = totalDist - sumHeights;
        const gap = totalGapSpace / (sorted.length - 1);
        let currentY = first.bounds.y;
        sorted.forEach((item, index) => {
          if (index > 0 && index < sorted.length - 1) {
            updateElementPos(item.id, item.bounds.x, Math.round(currentY), updates);
          }
          currentY += item.bounds.height + gap;
        });
      } else if (alignmentType === "distributeH" && boundsList.length >= 3) {
        const sorted = [...boundsList].sort((a, b) => a.bounds.x - b.bounds.x);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const sumWidths = sorted.reduce((sum, item) => sum + item.bounds.width, 0);
        const totalDist = last.bounds.x + last.bounds.width - first.bounds.x;
        const totalGapSpace = totalDist - sumWidths;
        const gap = totalGapSpace / (sorted.length - 1);
        let currentX = first.bounds.x;
        sorted.forEach((item, index) => {
          if (index > 0 && index < sorted.length - 1) {
            updateElementPos(item.id, Math.round(currentX), item.bounds.y, updates);
          }
          currentX += item.bounds.width + gap;
        });
      }
    }

    if (Object.keys(updates).length > 0) {
      onChange(updates);
    }
  };


  // Handle drag coordinates synchronization for Profile Photo
  const handlePhotoDragEnd = (e: any) => {
    const node = e.target;
    const newX = Math.round(node.x());
    const newY = Math.round(node.y());
    if (selectedIds.includes("photo")) {
      handleMultiDragEnd("photo", newX, newY);
    } else {
      onChange({
        photoX: String(newX),
        photoY: String(newY),
      });
    }
  };

  // Handle scale/transform synchronization for Profile Photo
  const handlePhotoTransformEnd = () => {
    const node = photoRef.current;
    if (!node) return;
    const newWidth = Math.round(node.width() * node.scaleX());
    const newHeight = Math.round(node.height() * node.scaleY());
    const newX = Math.round(node.x());
    const newY = Math.round(node.y());

    // Reset scales to keep geometry pristine
    node.scaleX(1);
    node.scaleY(1);

    onChange({
      photoX: String(newX),
      photoY: String(newY),
      photoWidth: String(newWidth),
      photoHeight: String(newHeight),
    });
  };

  // Handle drag coordinates synchronization for Background Watermark
  const handleBgDragEnd = (e: any) => {
    const node = e.target;
    const newX = Math.round(node.x());
    const newY = Math.round(node.y());
    if (selectedIds.includes("watermark")) {
      handleMultiDragEnd("watermark", newX, newY);
    } else {
      onChange({
        bgImageX: String(newX),
        bgImageY: String(newY),
      });
    }
  };

  // Handle scale/transform synchronization for Background Watermark
  const handleBgTransformEnd = () => {
    const node = bgRef.current;
    if (!node) return;
    const newWidth = Math.round(node.width() * node.scaleX());
    const newHeight = Math.round(node.height() * node.scaleY());
    const newX = Math.round(node.x());
    const newY = Math.round(node.y());

    node.scaleX(1);
    node.scaleY(1);

    onChange({
      bgImageX: String(newX),
      bgImageY: String(newY),
      bgImageWidth: String(newWidth),
      bgImageHeight: String(newHeight),
    });
  };

  // Handle drag coordinates synchronization for Custom Frame Image
  const handleFrameDragEnd = (e: any) => {
    const node = e.target;
    const newX = Math.round(node.x());
    const newY = Math.round(node.y());
    if (selectedIds.includes("frame")) {
      handleMultiDragEnd("frame", newX, newY);
    } else {
      onChange({
        frameImageX: String(newX),
        frameImageY: String(newY),
      });
    }
  };

  // Handle scale/transform synchronization for Custom Frame Image
  const handleFrameTransformEnd = (e: any) => {
    const node = e.target;
    const newWidth = Math.round(node.width() * node.scaleX());
    const newHeight = Math.round(node.height() * node.scaleY());
    const newX = Math.round(node.x());
    const newY = Math.round(node.y());

    node.scaleX(1);
    node.scaleY(1);

    onChange({
      frameImageX: String(newX),
      frameImageY: String(newY),
      frameImageWidth: String(newWidth),
      frameImageHeight: String(newHeight),
    });
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center">


      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden bg-transparent flex items-center justify-center"
      >
        {stageSize.width > 0 && stageSize.height > 0 && (
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
          x={stagePos.x}
          y={stagePos.y}
          draggable={true}
          onMouseEnter={() => {
            const stage = stageRef.current;
            if (stage) {
              const clickedOnEmpty = true; // default hover cursor on enter
              stage.container().style.cursor = isSpacePressed ? 'grab' : 'default';
            }
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          onWheel={handleWheel}
          onDragStart={(e) => {
            if (e.target === e.currentTarget) {
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = 'grabbing';
            }
            handleDragStart();
          }}
          onDragEnd={(e) => {
            if (e.target === e.currentTarget) {
              setStagePos({ x: e.target.x(), y: e.target.y() });
              const stage = e.target.getStage();
              if (stage) stage.container().style.cursor = isSpacePressed ? 'grab' : 'default';
            }
          }}
          onClick={(e) => {
            // Deselect when clicking the stage itself or any non-interactive background element
            const clickedOnEmpty = e.target === e.target.getStage();
            const clickedOnBackground = e.target.name() === "bg-rect";
            if (clickedOnEmpty || clickedOnBackground) {
              setSelectedIds([]);
            }
          }}
        >
          {/* BACKGROUND LAYER */}
          <Layer>
            {/* Page base color or gradient */}
            {formState.frameBgType === "linear" && bgGradientColors.length > 1 ? (
              <Rect
                name="bg-rect"
                width={A4_W}
                height={A4_H}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: A4_H }}
                fillLinearGradientColorStops={bgGradientColors.flatMap((color: string, i: number, arr: any[]) => [
                  i / (arr.length - 1),
                  color || "#ffffff",
                ])}
                shadowColor="#000000"
                shadowBlur={20}
                shadowOpacity={0.2}
                shadowOffset={{ x: 0, y: 8 }}
                onMouseEnter={() => handleSetCursor('default')}
                onMouseLeave={() => handleSetCursor('grab')}
              />
            ) : formState.frameBgType === "radial" && bgGradientColors.length > 1 ? (
              <Rect
                name="bg-rect"
                width={A4_W}
                height={A4_H}
                fillRadialGradientStartPoint={{ x: A4_W / 2, y: A4_H / 2 }}
                fillRadialGradientStartRadius={0}
                fillRadialGradientEndPoint={{ x: A4_W / 2, y: A4_H / 2 }}
                fillRadialGradientEndRadius={Math.max(A4_W, A4_H) / 2}
                fillRadialGradientColorStops={bgGradientColors.flatMap((color: string, i: number, arr: any[]) => [
                  i / (arr.length - 1),
                  color || "#ffffff",
                ])}
                shadowColor="#000000"
                shadowBlur={20}
                shadowOpacity={0.2}
                shadowOffset={{ x: 0, y: 8 }}
                onMouseEnter={() => handleSetCursor('default')}
                onMouseLeave={() => handleSetCursor('grab')}
              />
            ) : (
              <Rect
                name="bg-rect"
                width={A4_W}
                height={A4_H}
                fill={bgColor}
                shadowColor="#000000"
                shadowBlur={20}
                shadowOpacity={0.2}
                shadowOffset={{ x: 0, y: 8 }}
                onMouseEnter={() => handleSetCursor('default')}
                onMouseLeave={() => handleSetCursor('grab')}
              />
            )}

            {watermarkImage && (
              <KonvaImage
                id="watermark"
                ref={bgRef}
                image={watermarkImage}
                x={parseFloat(formState.bgImageX) || 0}
                y={parseFloat(formState.bgImageY) || 0}
                width={parseFloat(formState.bgImageWidth) || 595}
                height={parseFloat(formState.bgImageHeight) || 842}
                opacity={parseFloat(formState.bgImageOpacity) ?? 0.15}
                draggable={selectedIds.includes("watermark")}
                listening={selectedIds.includes("watermark")}
                onDragStart={handleDragStart}
                onDragEnd={handleBgDragEnd}
                onTransformEnd={handleBgTransformEnd}
                onMouseEnter={() => handleSetCursor('move')}
                onMouseLeave={() => handleSetCursor('default')}
              />
            )}
            {formState.frameType === "image" && frameImage && (
              <KonvaImage 
                id="frame"
                image={frameImage} 
                x={parseFloat(formState.frameImageX) || 0}
                y={parseFloat(formState.frameImageY) || 0}
                width={parseFloat(formState.frameImageWidth) || A4_W} 
                height={parseFloat(formState.frameImageHeight) || A4_H} 
                draggable={selectedIds.includes("frame")}
                listening={selectedIds.includes("frame")}
                onDragStart={handleDragStart}
                onDragEnd={handleFrameDragEnd}
                onTransformEnd={handleFrameTransformEnd}
                onMouseEnter={() => handleSetCursor('move')}
                onMouseLeave={() => handleSetCursor('default')}
              />
            )}
<Group listening={false}>
            {formState.frameType === "svg" && (
              <Group>
                <Rect
                  x={outerInset}
                  y={outerInset}
                  width={A4_W - 2 * outerInset}
                  height={A4_H - 2 * outerInset}
                  stroke={primaryColor}
                  strokeWidth={outerStroke}
                  cornerRadius={outerRadius}
                />
                <Rect
                  x={innerInset}
                  y={innerInset}
                  width={A4_W - 2 * innerInset}
                  height={A4_H - 2 * innerInset}
                  stroke={accentColor}
                  strokeWidth={innerStroke}
                  cornerRadius={innerRadius}
                />
                {formState.frameHasCornerCurves && (
                  <Group stroke={accentColor} strokeWidth={innerStroke}>
                    {/* Top Left */}
                    <Path d={`M ${innerInset + 10} ${innerInset} A 10,10 0 0,0 ${innerInset} ${innerInset + 10}`} />
                    {/* Top Right */}
                    <Path d={`M ${A4_W - innerInset - 10} ${innerInset} A 10,10 0 0,1 ${A4_W - innerInset} ${innerInset + 10}`} />
                    {/* Bottom Left */}
                    <Path d={`M ${innerInset + 10} ${A4_H - innerInset} A 10,10 0 0,1 ${innerInset} ${A4_H - innerInset - 10}`} />
                    {/* Bottom Right */}
                    <Path d={`M ${A4_W - innerInset - 10} ${A4_H - innerInset} A 10,10 0 0,0 ${A4_W - innerInset} ${A4_H - innerInset - 10}`} />
                  </Group>
                )}
              </Group>
            )}

            {formState.frameType === "gradient" && (
              <Group>
                <Rect
                  x={outerInset}
                  y={outerInset}
                  width={A4_W - 2 * outerInset}
                  height={A4_H - 2 * outerInset}
                  stroke={frameGradientColors[0] || primaryColor}
                  strokeWidth={outerStroke}
                  cornerRadius={outerRadius}
                />
                <Rect
                  x={innerInset}
                  y={innerInset}
                  width={A4_W - 2 * innerInset}
                  height={A4_H - 2 * innerInset}
                  stroke={frameGradientColors[1] || accentColor}
                  strokeWidth={innerStroke}
                  cornerRadius={innerRadius}
                  opacity={0.6}
                />
              </Group>
            )}

            {/* image frame moved to active layer for resizing */}

            {formState.frameType === "custom" && (
              <Group>
                {formState.frameComponentId === "new-generation-arch" && (
                  <Group stroke={primaryColor} fill="none">
                    <Path
                      d="M 30,120 L 30,802 A 15,15 0 0,0 45,817 L 550,817 A 15,15 0 0,0 565,802 L 565,120 C 565,80 500,40 297,40 C 94,40 30,80 30,120 Z"
                      strokeWidth={3}
                    />
                    <Path
                      d="M 40,125 L 40,792 A 10,10 0 0,0 50,802 L 545,802 A 10,10 0 0,0 555,792 L 555,125 C 555,90 495,52 297,52 C 99,52 40,90 40,125 Z"
                      stroke={accentColor}
                      strokeWidth={1.5}
                      dash={[4, 2]}
                    />
                  </Group>
                )}

                {formState.frameComponentId === "ornate-grandeur" && (
                  <Group stroke={primaryColor} fill="none">
                    <Rect x={25} y={25} width={545} height={792} cornerRadius={4} strokeWidth={2.5} />
                    <Rect x={33} y={33} width={529} height={776} cornerRadius={2} strokeWidth={1} stroke={accentColor} />
                  </Group>
                )}

                {formState.frameComponentId === "green-shapes" && (
                  <Group fill="none">
                    <Rect x={20} y={20} width={555} height={802} cornerRadius={6} stroke="#2E7D32" strokeWidth={2} />
                    <Rect x={28} y={28} width={539} height={786} cornerRadius={4} stroke={accentColor} strokeWidth={1} dash={[3, 3]} />
                  </Group>
                )}
              </Group>
            )}
</Group>
</Layer>

{/* DYNAMIC CONTENT & INTERACTIVE LAYER */}
<Layer>
            {/* Draggable Header Section */}
            {(() => {
              const headerKey = "header";
              const offset = sectionOffsets[headerKey] || { x: 0, y: 0 };
              const isSelected = selectedIds.includes(headerKey);
              const isHovered = hoveredId === headerKey;

              return (
                <Group
                  id={headerKey}
                  x={offset.x}
                  y={offset.y}
                  draggable={isSelected}
                  onDragStart={handleDragStart}
                  onDragEnd={(e) => {
                    const newX = Math.round(e.target.x());
                    const newY = Math.round(e.target.y()) + paddingTop + 10;
                    handleMultiDragEnd(headerKey, newX, newY);
                  }}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    handleElementSelect(headerKey, e.evt.shiftKey);
                  }}
                  onMouseEnter={() => {
                    handleSetCursor('move');
                    setHoveredId(headerKey);
                  }}
                  onMouseLeave={() => {
                    handleSetCursor('default');
                    setHoveredId(null);
                  }}
                >
                  {/* Selection highlight border */}
                  {isSelected && (
                    <Rect
                      x={20}
                      y={paddingTop}
                      width={A4_W - 40}
                      height={75}
                      fill="rgba(201,168,76,0.07)"
                      stroke={accentColor}
                      strokeWidth={1}
                      dash={[4, 3]}
                      cornerRadius={6}
                      listening={false}
                    />
                  )}

                  {/* Hover outline */}
                  {!isSelected && isHovered && (
                    <Rect
                      x={20}
                      y={paddingTop}
                      width={A4_W - 40}
                      height={75}
                      stroke={accentColor + "90"}
                      strokeWidth={1}
                      dash={[3, 3]}
                      cornerRadius={6}
                      listening={false}
                    />
                  )}

                    {/* Header Mantra */}
                    <Group y={paddingTop + 10}>
                      {(() => {
                        const hasMantraSticker = !!mantraSignUrl;
                        const gap = 7;
                        const imgW = 45;
                        const textX = paddingLeft + (hasMantraSticker ? (imgW + gap) : 0);
                        const textWidth = A4_W - paddingLeft - paddingRight - (hasMantraSticker ? (imgW + gap) * 2 : 0);
                        return (
                          <Text
                            x={textX}
                            y={0}
                            text={mantra || (currentLang === "हिंदी" ? "॥ श्री गणेशाय नमः ॥" : "|| Shree Ganeshay Namah ||")}
                            fontSize={layout.fSize * 1.2}
                            fontFamily={fontFamily}
                            fontStyle="bold"
                            fill={primaryColor}
                            align={sectionStyles["header"]?.textAlign || "center"}
                            width={textWidth}
                          />
                        );
                      })()}
                      {signImage && mantraGeometry && (() => {
                        const placement = formState.mantraSignPlacement || "both";
                        const vertical = formState.mantraSignVertical || "top";
                        const signY = vertical === "middle"
                          ? (A4_H / 2) - paddingTop - 10 - 22
                          : -6;

                        // top-center: single sign centered above mantra row
                        if (placement === "top-center") {
                          return (
                            <KonvaImage
                              image={signImage}
                              x={(A4_W - 45) / 2}
                              y={signY - 50}
                              width={45}
                              height={45}
                            />
                          );
                        }

                        const showLeft = placement === "both" || placement === "left";
                        const showRight = placement === "both" || placement === "right";
                        return (
                          <>
                            {showLeft && (
                              <KonvaImage
                                image={signImage}
                                x={mantraGeometry.leftX}
                                y={signY}
                                width={45}
                                height={45}
                              />
                            )}
                            {showRight && (
                              <KonvaImage
                                image={signImage}
                                x={mantraGeometry.rightX}
                                y={signY}
                                width={45}
                                height={45}
                                scaleX={-1}
                              />
                            )}
                          </>
                        );
                      })()}
                    </Group>

                    {/* Document Title "BIODATA" */}
                    {(() => {
                      const titleY = paddingTop + 10 + layout.fSize * 2;
                      const titleHeight = layout.fSize * 2;
                      const align = sectionStyles["header"]?.textAlign || "center";

                      if (formState.titleShape === "ribbon") {
                        const titleVal = formState.title || "BIODATA";
                        const ribbonW = Math.min(
                          Math.max(titleVal.length * layout.fSize * 1.05 + 60, 180),
                          A4_W - paddingLeft - paddingRight
                        );
                        const ribbonH = layout.fSize * 2.8;
                        const ribbonX = (A4_W - ribbonW) / 2;
                        const ribbonY = titleY - 4;
 
                        return (
                          <Group>
                            <Rect
                              x={ribbonX}
                              y={ribbonY}
                              width={ribbonW}
                              height={ribbonH}
                              fill={primaryColor}
                              cornerRadius={6}
                              stroke={accentColor || primaryColor}
                              strokeWidth={2}
                            />
                            <Text
                              x={ribbonX}
                              y={ribbonY + (ribbonH - titleHeight) / 2}
                              text={title || (currentLang === "हिंदी" ? "बायोडाटा" : "BIODATA")}
                              fontSize={layout.fSize * 1.8}
                              fontFamily={fontFamily}
                              fontStyle="bold"
                              fill="#ffffff"
                              align="center"
                              width={ribbonW}
                            />
                          </Group>
                        );
                      } else if (formState.titleShape === "arch") {
                        return (
                          <Group>
                            <Path
                              data={`M ${A4_W / 2 - 120},${titleY - 8} C ${A4_W / 2 - 80},${titleY - 24} ${A4_W / 2 - 30},${titleY - 30} ${A4_W / 2},${titleY - 30} C ${A4_W / 2 + 30},${titleY - 30} ${A4_W / 2 + 80},${titleY - 24} ${A4_W / 2 + 120},${titleY - 8}`}
                              stroke={accentColor || primaryColor}
                              strokeWidth={2.5}
                              lineCap="round"
                            />
                            <Text
                              x={paddingLeft}
                              y={titleY}
                              text={title || (currentLang === "हिंदी" ? "बायोडाटा" : "BIODATA")}
                              fontSize={layout.fSize * 2}
                              fontFamily={fontFamily}
                              fontStyle="bold"
                              fill={primaryColor}
                              align="center"
                              width={A4_W - paddingLeft - paddingRight}
                            />
                          </Group>
                        );
                      } else if (formState.titleShape === "ornament") {
                        return (
                          <Group>
                            <Text
                              x={paddingLeft}
                              y={titleY}
                              text={title || (currentLang === "हिंदी" ? "बायोडाटा" : "BIODATA")}
                              fontSize={layout.fSize * 2}
                              fontFamily={fontFamily}
                              fontStyle="bold"
                              fill={primaryColor}
                              align="center"
                              width={A4_W - paddingLeft - paddingRight}
                            />
                            <Line
                              points={[A4_W / 2 - 90, titleY + titleHeight + 4, A4_W / 2 + 90, titleY + titleHeight + 4]}
                              stroke={accentColor || primaryColor}
                              strokeWidth={1.5}
                            />
                          </Group>
                        );
                      } else {
                        return (
                          <Text
                            x={paddingLeft}
                            y={titleY}
                            text={title || (currentLang === "हिंदी" ? "बायोडाटा" : "BIODATA")}
                            fontSize={layout.fSize * 2.2}
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

            {/* Dynamic Columns & Boxes Layout preview */}
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
                <Group
                  key={secKey}
                  id={secKey}
                  x={offset.x}
                  y={offset.y}
                  draggable={selectedIds.includes(secKey)}
                  onDragStart={handleDragStart}
                  onDragEnd={(e) => {
                    const newX = Math.round(e.target.x()) + paddingLeft;
                    const newY = Math.round(e.target.y()) + sec.titleY;
                    if (selectedIds.includes(secKey)) {
                      handleMultiDragEnd(secKey, newX, newY);
                    } else {
                      updateSectionOffset(secKey, Math.round(e.target.x()), Math.round(e.target.y()));
                    }
                  }}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    handleElementSelect(secKey, e.evt.shiftKey);
                  }}
                  onMouseEnter={() => {
                    handleSetCursor('move');
                    setHoveredId(secKey);
                  }}
                  onMouseLeave={() => {
                    handleSetCursor('default');
                    setHoveredId(null);
                  }}
                >
                  {formState.detailsLayout === "modern-boxed" && (() => {
                    const lastField = sec.fields[sec.fields.length - 1];
                    const boxHeight = lastField ? lastField.y + fSize * 1.45 - sec.titleY + 12 : 50;
                    return (
                      <Rect
                        x={paddingLeft - 8}
                        y={sec.titleY - 8}
                        width={A4_W - paddingLeft - paddingRight + 16}
                        height={boxHeight}
                        fill={primaryColor + "06"}
                        stroke={primaryColor + "1a"}
                        strokeWidth={1.2}
                        cornerRadius={10}
                        name="bg-rect"
                      />
                    );
                  })()}

                  {/* Selection highlight bg */}
                  {selectedId === secKey && (
                    <Rect
                      x={paddingLeft - 12}
                      y={sec.titleY - 10}
                      width={A4_W - paddingLeft - paddingRight + 24}
                      height={sec.fields.length > 0
                        ? (sec.fields[sec.fields.length - 1].y + fSize * 2 - sec.titleY + 18)
                        : 40}
                      fill="rgba(201,168,76,0.07)"
                      stroke={accentColor}
                      strokeWidth={1}
                      dash={[4, 3]}
                      cornerRadius={6}
                      listening={false}
                    />
                  )}

                  {/* Hover highlight border */}
                  {hoveredId === secKey && selectedId !== secKey && (
                    <Rect
                      x={paddingLeft - 12}
                      y={sec.titleY - 10}
                      width={A4_W - paddingLeft - paddingRight + 24}
                      height={sec.fields.length > 0
                        ? (sec.fields[sec.fields.length - 1].y + fSize * 2 - sec.titleY + 18)
                        : 40}
                      stroke={accentColor || primaryColor}
                      strokeWidth={1}
                      dash={[2, 2]}
                      cornerRadius={6}
                      listening={false}
                    />
                  )}

                    {/* Section Header Underline Decoration */}
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
                          stroke={accentColor || primaryColor}
                          strokeWidth={3}
                          lineCap="round"
                          listening={false}
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

                  {/* Section Fields mapping */}
                  {sec.fields.map((field: any) => {
                    const colX = field.isHalf
                      ? field.colIndex === 0
                        ? paddingLeft + 10
                        : paddingLeft + 10 + field.halfW + 10
                      : paddingLeft + 10;
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
                        <Text
                          x={colX}
                          y={field.y}
                          width={lblW}
                          text={applyTransform(field.label)}
                          fontSize={fSize}
                          fontFamily={fontFamily}
                          fontStyle={fontStyle}
                          fill={fieldColor}
                        />
                        <Text
                          x={colonX}
                          y={field.y}
                          text=":"
                          fontSize={fSize}
                          fontFamily={fontFamily}
                          fill={fieldColor}
                        />
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

                        {/* Divider lines for elegant layout */}
                        {formState.detailsLayout === "elegant-divided" && (!field.isHalf || field.colIndex === 1) && (
                          <Line
                            points={[
                              colX,
                              field.y + fSize * 1.35 + 2,
                              colX + (field.isHalf ? field.halfW : A4_W - paddingLeft - paddingRight - 20),
                              field.y + fSize * 1.35 + 2,
                            ]}
                            stroke={fieldColor + "15"}
                            strokeWidth={0.8}
                            dash={[2, 2]}
                            listening={false}
                          />
                        )}
                      </Group>
                    );
                  })}
                </Group>
              );
            })}

            {/* Bottom watermark branding */}
            <Text
              x={0}
              y={A4_H - 30}
              width={A4_W}
              text="www.biodata99.com"
              fontSize={8}
              fontFamily="Inter"
              fill="#cccccc"
              align="center"
            />

            <Group
              id="photo"
              ref={photoRef}
              x={px}
              y={py}
              width={pw}
              height={ph}
              draggable={selectedIds.includes("photo")}
              onDragStart={handleDragStart}
              onDragEnd={handlePhotoDragEnd}
              onTransformEnd={handlePhotoTransformEnd}
              onClick={(e) => {
                e.cancelBubble = true;
                handleElementSelect("photo", e.evt.shiftKey);
              }}
              onMouseEnter={() => handleSetCursor('move')}
              onMouseLeave={() => handleSetCursor('default')}
            >
              <PhotoImage
                src={previewPhotoFile || ""}
                x={0}
                y={0}
                width={pw}
                height={ph}
                cornerRadius={pr}
                borderColor={formState.photoShowBorder !== false ? primaryColor : ""}
              />
            </Group>

            {/* THE VISUAL TRANSFORMER OVERLAY BOX */}
            {selectedIds.length > 0 && (
              <Transformer
                ref={transformerRef}
                centeredScaling={selectedId !== "frame" && selectedId !== "watermark"}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 30 || newBox.height < 30) {
                    return oldBox;
                  }
                  return newBox;
                }}
                rotateEnabled={false}
                enabledAnchors={
                  selectedIds.length === 1
                    ? selectedId === "frame"
                      ? ["top-left", "top-center", "top-right", "middle-right", "bottom-right", "bottom-center", "bottom-left", "middle-left"]
                      : ["top-left", "top-right", "bottom-left", "bottom-right"]
                    : []
                }
                anchorSize={10}
                anchorCornerRadius={3}
                anchorStroke={primaryColor}
                anchorFill="#ffffff"
                borderStroke={primaryColor}
                borderStrokeWidth={1.5}
                keepRatio={selectedId === "photo" || selectedId === "watermark"}
              />
            )}
{selectionBox && (
<Rect
                x={Math.min(selectionBox.x1, selectionBox.x2)}
                y={Math.min(selectionBox.y1, selectionBox.y2)}
                width={Math.abs(selectionBox.x1 - selectionBox.x2)}
                height={Math.abs(selectionBox.y1 - selectionBox.y2)}
                fill="rgba(37, 99, 235, 0.12)"
                stroke="#2563eb"
                strokeWidth={1 / scale}
                dash={[3, 3]}
listening={false}
/>
)}
</Layer>
</Stage>
        )}
      </div>


      {/* Canva-style Context Toolbar — appears at top when a single element is selected */}
      {selectedId && selectedIds.length === 1 && (
        <div className="absolute top-0 left-0 right-0 z-30 h-12 bg-card/98 border-b border-border backdrop-blur-md shadow-lg flex items-center px-4 gap-1 select-none animate-in fade-in duration-150">
          
          {/* Element indicator chip */}
          <div className="flex items-center gap-1.5 pr-3 border-r border-border mr-1 shrink-0">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-black text-foreground uppercase tracking-wider">
              {selectedId.startsWith("sec-") 
                ? `Section ${Number(selectedId.replace("sec-", "")) + 1}`
                : selectedId}
            </span>
          </div>

          {/* Render section-specific controllers only when selectedId is a section */}
          {isSectionId(selectedId) && selectedSectionStyle !== null && (
            <>
              {/* Title Color swatch */}
              <label className="relative cursor-pointer flex items-center gap-1.5 hover:bg-muted px-2 py-1 rounded-lg transition-colors" title="Title Color">
                <div className="w-5 h-5 rounded-full border-2 border-border shadow overflow-hidden shrink-0">
                  <input type="color" value={selectedSectionStyle.titleColor || primaryColor}
                    onChange={e => updateSectionStyle(selectedId, { titleColor: e.target.value })}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  <div className="w-full h-full" style={{ background: selectedSectionStyle.titleColor || primaryColor }} />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground hidden sm:block">Title</span>
              </label>

              {/* Field Color swatch */}
              <label className="relative cursor-pointer flex items-center gap-1.5 hover:bg-muted px-2 py-1 rounded-lg transition-colors" title="Field Color">
                <div className="w-5 h-5 rounded-full border-2 border-border shadow overflow-hidden shrink-0">
                  <input type="color" value={selectedSectionStyle.fieldColor || secondaryColor}
                    onChange={e => updateSectionStyle(selectedId, { fieldColor: e.target.value })}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  <div className="w-full h-full" style={{ background: selectedSectionStyle.fieldColor || secondaryColor }} />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground hidden sm:block">Fields</span>
              </label>

              <div className="h-6 w-px bg-border mx-1 shrink-0" />

              {/* Font size stepper */}
              <div className="flex items-center gap-0.5 shrink-0">
                <button type="button" title="Decrease font size"
                  onClick={() => updateSectionStyle(selectedId, { fontSize: Math.max(7, (Number(selectedSectionStyle.fontSize) || layout.fSize) - 1) })}
                  className="w-6 h-7 flex items-center justify-center rounded hover:bg-muted text-foreground text-sm font-bold cursor-pointer border-0 bg-transparent transition-colors">
                  −
                </button>
                <div className="w-8 h-7 flex items-center justify-center rounded border border-border bg-muted/40 text-[12px] font-black text-foreground">
                  {selectedSectionStyle.fontSize || layout.fSize}
                </div>
                <button type="button" title="Increase font size"
                  onClick={() => updateSectionStyle(selectedId, { fontSize: Math.min(24, (Number(selectedSectionStyle.fontSize) || layout.fSize) + 1) })}
                  className="w-6 h-7 flex items-center justify-center rounded hover:bg-muted text-foreground text-sm font-bold cursor-pointer border-0 bg-transparent transition-colors">
                  +
                </button>
              </div>

              <div className="h-6 w-px bg-border mx-1 shrink-0" />

              {/* Bold */}
              <button type="button" title="Bold"
                onClick={() => updateSectionStyle(selectedId, { fontStyle: (selectedSectionStyle.fontStyle || "bold") === "bold" ? "normal" : "bold" })}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-black cursor-pointer border-0 transition-all ${(selectedSectionStyle.fontStyle || "bold") === "bold" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
                B
              </button>

              {/* Italic */}
              <button type="button" title="Italic"
                onClick={() => updateSectionStyle(selectedId, { italic: !selectedSectionStyle.italic })}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-black italic cursor-pointer border-0 transition-all ${selectedSectionStyle.italic ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
                I
              </button>

              {/* Underline */}
              <button type="button" title="Underline"
                onClick={() => updateSectionStyle(selectedId, { underline: !selectedSectionStyle.underline })}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-black underline cursor-pointer border-0 transition-all ${selectedSectionStyle.underline ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
                U
              </button>

              {/* Strikethrough */}
              <button type="button" title="Strikethrough"
                onClick={() => updateSectionStyle(selectedId, { strikethrough: !selectedSectionStyle.strikethrough })}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-black line-through cursor-pointer border-0 transition-all ${selectedSectionStyle.strikethrough ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
                S
              </button>

              <div className="h-6 w-px bg-border mx-1 shrink-0" />

              {/* Text Transform — Canva-style aA button */}
              {([
                { val: "none",       label: "Aa", title: "Default case" },
                { val: "uppercase",  label: "AA", title: "ALL CAPS" },
                { val: "capitalize", label: "Ab", title: "Title Case" },
                { val: "lowercase",  label: "aa", title: "lowercase" },
              ] as const).map(({ val, label, title }) => (
                <button key={val} type="button" title={title}
                  onClick={() => updateSectionStyle(selectedId, { textTransform: val })}
                  className={`w-9 h-8 rounded-lg flex items-center justify-center text-[11px] font-black cursor-pointer border-0 transition-all tracking-wide ${(selectedSectionStyle.textTransform || "none") === val ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "text-muted-foreground hover:bg-muted"}`}>
                  {label}
                </button>
              ))}

              <div className="h-6 w-px bg-border mx-1 shrink-0" />

              {/* Alignment */}
              {([
                { val: "left",   icon: <AlignLeft className="w-4 h-4" />, title: "Align Left" },
                { val: "center", icon: <AlignCenter className="w-4 h-4" />, title: "Align Center" },
                { val: "right",  icon: <AlignRight className="w-4 h-4" />, title: "Align Right" },
              ] as const).map(({ val, icon, title }) => (
                <button key={val} type="button" title={title}
                  onClick={() => updateSectionStyle(selectedId, { textAlign: val })}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-0 transition-all ${(selectedSectionStyle.textAlign || "left") === val ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
                  {icon}
                </button>
              ))}
            </>
          )}

          {/* Block Align (to A4 page) — available for all single selected elements */}
          <div className="h-6 w-px bg-border mx-1 shrink-0" />
          <span className="text-[10px] font-bold text-muted-foreground">Block Align:</span>
          <button type="button" onClick={() => handleAlign("center")} className="h-8 px-2 rounded-lg text-[10px] font-bold hover:bg-muted text-foreground border-0 bg-transparent cursor-pointer" title="Center align block on page">
            Center
          </button>
          <button type="button" onClick={() => handleAlign("middle")} className="h-8 px-2 rounded-lg text-[10px] font-bold hover:bg-muted text-foreground border-0 bg-transparent cursor-pointer" title="Middle align block on page">
            Middle
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Reset button only for sections */}
          {isSectionId(selectedId) && (
            <button type="button" title="Reset all section styles"
              onClick={() => {
                const next = { ...sectionStyles };
                delete next[selectedId];
                const { sec, secIdx } = getSectionData(selectedId);
                if (sec?.key) {
                  delete next[sec.key];
                }
                delete next[`sec-${secIdx}`];
                onChange({ sectionStyles: JSON.stringify(next) });
              }}
              className="h-7 px-3 rounded-lg text-[10px] font-bold text-destructive hover:bg-destructive/10 cursor-pointer border border-destructive/30 bg-transparent transition-all mr-1">
              Reset
            </button>
          )}

          {/* Close / deselect */}
          <button type="button" title="Deselect"
            onClick={() => setSelectedId(null)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer border-0 bg-transparent text-sm transition-colors">
            ✕
          </button>
        </div>
      )}

      {/* Canva-style Multi-Selection Context Toolbar */}
      {selectedIds.length > 1 && (
        <div className="absolute top-0 left-0 right-0 z-30 h-12 bg-card/98 border-b border-border backdrop-blur-md shadow-lg flex items-center px-4 gap-2 select-none animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 pr-3 border-r border-border mr-1 shrink-0">
            <span className="text-[11px] font-black text-foreground">
              {selectedIds.length} elements selected
            </span>
          </div>

          <span className="text-[10px] font-bold text-muted-foreground">Align:</span>

          {/* Align Left */}
          <button type="button" onClick={() => handleAlign("left")} className="h-8 px-2.5 rounded-lg text-[11px] font-bold hover:bg-muted text-foreground border-0 bg-transparent cursor-pointer">
            Left
          </button>
          {/* Align Center */}
          <button type="button" onClick={() => handleAlign("center")} className="h-8 px-2.5 rounded-lg text-[11px] font-bold hover:bg-muted text-foreground border-0 bg-transparent cursor-pointer">
            Center
          </button>
          {/* Align Right */}
          <button type="button" onClick={() => handleAlign("right")} className="h-8 px-2.5 rounded-lg text-[11px] font-bold hover:bg-muted text-foreground border-0 bg-transparent cursor-pointer">
            Right
          </button>

          <div className="h-6 w-px bg-border mx-1 shrink-0" />

          {/* Align Top */}
          <button type="button" onClick={() => handleAlign("top")} className="h-8 px-2.5 rounded-lg text-[11px] font-bold hover:bg-muted text-foreground border-0 bg-transparent cursor-pointer">
            Top
          </button>
          {/* Align Middle */}
          <button type="button" onClick={() => handleAlign("middle")} className="h-8 px-2.5 rounded-lg text-[11px] font-bold hover:bg-muted text-foreground border-0 bg-transparent cursor-pointer">
            Middle
          </button>
          {/* Align Bottom */}
          <button type="button" onClick={() => handleAlign("bottom")} className="h-8 px-2.5 rounded-lg text-[11px] font-bold hover:bg-muted text-foreground border-0 bg-transparent cursor-pointer">
            Bottom
          </button>

          {selectedIds.length >= 3 && (
            <>
              <div className="h-6 w-px bg-border mx-1 shrink-0" />
              <span className="text-[10px] font-bold text-muted-foreground">Distribute:</span>
              <button type="button" onClick={() => handleAlign("distributeV")} className="h-8 px-2.5 rounded-lg text-[11px] font-bold hover:bg-muted text-foreground border-0 bg-transparent cursor-pointer">
                Vertically
              </button>
              <button type="button" onClick={() => handleAlign("distributeH")} className="h-8 px-2.5 rounded-lg text-[11px] font-bold hover:bg-muted text-foreground border-0 bg-transparent cursor-pointer">
                Horizontally
              </button>
            </>
          )}

          <div className="flex-1" />

          <button type="button" onClick={() => setSelectedIds([])} className="h-7 px-3 rounded-lg text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer border border-border bg-transparent transition-all">
            Deselect All
          </button>
        </div>
      )}

      {/* Floating Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-slate-900/95 border border-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-2xl select-none">
        <button
          type="button"
          onClick={() => setScale(prev => Math.max(prev - 0.1, 0.2))}
          className="p-1.5 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleFitToScreen}
          className="p-1.5 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center"
          title="Fit to Screen"
        >
          <Maximize className="w-4 h-4" />
        </button>
        <span className="text-[10.5px] font-black text-slate-200 w-11 text-center font-mono">
          {Math.round(scale * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setScale(prev => Math.min(prev + 0.1, 3))}
          className="p-1.5 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white active:scale-95 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="h-4 w-px bg-slate-700/80 mx-1" />
        <button
          type="button"
          onClick={handleDownloadPreview}
          className="p-1.5 hover:bg-slate-800 rounded-full text-emerald-400 hover:text-emerald-300 active:scale-95 transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center"
          title="Download HQ Preview PNG"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
