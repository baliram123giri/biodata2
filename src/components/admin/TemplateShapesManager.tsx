"use client";

import React from "react";
import { 
  Square, 
  Circle, 
  Triangle, 
  Star, 
  Minus, 
  Trash2, 
  Copy, 
  Layers, 
  MoveUp, 
  MoveDown, 
  ChevronUp, 
  ChevronDown,
  Sparkles,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  Link2,
  Link2Off,
  RotateCw,
  Eye,
  Scaling
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Beautiful Predefined Vector Ornaments for Indian Biodata Design
export const DECORATIVE_PRESETS = [
  {
    name: "Classic Ganesha",
    path: "M 50 15 C 44 15, 38 18, 36 24 C 34 30, 38 35, 41 38 C 36 41, 28 38, 23 34 C 18 30, 16 38, 22 43 C 27 48, 40 48, 43 43 C 45 45, 45 52, 43 60 C 40 68, 32 72, 29 77 C 26 82, 29 88, 39 88 C 49 88, 59 78, 59 63 C 59 48, 54 43, 52 38 C 56 33, 59 28, 59 18 C 59 13, 54 15, 50 15 Z M 48 30 C 48 32, 46 34, 44 34 C 42 34, 40 32, 40 30 C 40 28, 42 26, 44 26 C 46 26, 48 28, 48 30 Z",
    viewBox: "0 0 100 100",
  },
  {
    name: "Sacred Kalash",
    path: "M 35 45 C 35 32, 42 28, 50 28 C 58 28, 65 32, 65 45 C 65 58, 58 68, 50 68 C 42 68, 35 58, 35 45 Z M 40 28 L 40 20 C 43 21, 57 21, 60 20 L 60 28 Z M 46 20 L 50 12 L 54 20 Z M 32 45 L 68 45 M 50 28 L 50 68",
    viewBox: "0 0 100 100",
  },
  {
    name: "Swastik Accent",
    path: "M 25 25 L 50 25 L 50 75 L 75 75 M 50 50 L 75 50 L 75 25 L 85 25 M 50 50 L 25 50 L 25 75 L 15 75 M 50 50 L 50 25 L 25 25",
    viewBox: "0 0 100 100",
  },
  {
    name: "Mandala Flower",
    path: "M 50 50 C 40 30, 30 40, 10 50 C 30 60, 40 70, 50 50 Z M 50 50 C 60 30, 70 40, 90 50 C 70 60, 60 70, 50 50 Z M 50 50 C 30 40, 40 30, 50 10 C 60 30, 70 40, 50 50 Z M 50 50 C 30 60, 40 70, 50 90 C 60 70, 70 60, 50 50 Z",
    viewBox: "0 0 100 100",
  },
  {
    name: "Corner Flourish",
    path: "M 10 10 L 90 10 C 70 30, 30 70, 10 90 Z M 10 30 C 20 40, 40 20, 30 10 M 10 50 C 25 60, 60 25, 45 10 M 10 70 C 30 75, 75 30, 55 10",
    viewBox: "0 0 100 100",
  },
  {
    name: "Royal Arch",
    path: "M 10 90 L 10 30 C 10 15, 30 10, 50 10 C 70 10, 90 15, 90 30 L 90 90 L 80 90 L 80 30 C 80 20, 65 18, 50 18 C 35 18, 20 20, 20 30 L 20 90 Z",
    viewBox: "0 0 100 100",
  },
  {
    name: "Elegant Divider",
    path: "M 0 50 L 35 50 C 40 40, 45 40, 50 50 C 55 40, 60 40, 65 50 L 100 50 M 50 42 L 50 58 M 46 50 C 46 48, 54 48, 54 50 C 54 52, 46 52, 46 50 Z",
    viewBox: "0 0 100 100",
  },
  {
    name: "Floral Vine",
    path: "M 10 50 Q 30 30, 50 50 T 90 50 M 30 40 Q 35 30, 30 20 Q 25 30, 30 40 Z M 70 60 Q 75 70, 70 80 Q 65 70, 70 60 Z",
    viewBox: "0 0 100 100",
  }
];

interface Shape {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  cornerRadius?: number;
  cornerRadiusTL?: number;
  cornerRadiusTR?: number;
  cornerRadiusBL?: number;
  cornerRadiusBR?: number;
  isCornersIndependent?: boolean;
  isRatioLocked?: boolean;
  pathData?: string;
  isDashed?: boolean;
  dashLength?: number;
  dashGap?: number;
}

interface TemplateShapesManagerProps {
  shapesString: string;
  onChange: (shapesString: string) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  onAlign?: (alignmentType: string) => void;
}

export function TemplateShapesManager({
  shapesString,
  onChange,
  selectedId,
  onSelect,
  primaryColor,
  secondaryColor,
  accentColor,
  onAlign
}: TemplateShapesManagerProps) {
  
  const shapes: Shape[] = React.useMemo(() => {
    try {
      return JSON.parse(shapesString || "[]");
    } catch {
      return [];
    }
  }, [shapesString]);

  const updateShapes = (newShapes: Shape[]) => {
    onChange(JSON.stringify(newShapes));
  };

  const addShape = (type: string, pathData?: string, name?: string) => {
    const id = `shape-${Date.now()}`;
    const newShape: Shape = {
      id,
      type,
      name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${shapes.length + 1}`,
      x: 247, // Default center on A4 width (595/2 - 50)
      y: 371, // Default center on A4 height (842/2 - 50)
      width: type === "line" ? 150 : 100,
      height: type === "line" ? 4 : 100,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      fill: type === "line" ? "none" : primaryColor,
      stroke: type === "line" ? primaryColor : "none",
      strokeWidth: type === "line" ? 2 : 0,
      opacity: 1,
      cornerRadius: type === "rect" ? 0 : undefined,
      cornerRadiusTL: type === "rect" ? 0 : undefined,
      cornerRadiusTR: type === "rect" ? 0 : undefined,
      cornerRadiusBL: type === "rect" ? 0 : undefined,
      cornerRadiusBR: type === "rect" ? 0 : undefined,
      isCornersIndependent: false,
      isRatioLocked: false,
      pathData: pathData || undefined,
      isDashed: false,
      dashLength: 6,
      dashGap: 4
    };

    updateShapes([...shapes, newShape]);
    onSelect(id);
  };

  const deleteShape = (id: string) => {
    const next = shapes.filter(s => s.id !== id);
    updateShapes(next);
    if (selectedId === id) {
      onSelect(null);
    }
  };

  const duplicateShape = (shape: Shape) => {
    const id = `shape-${Date.now()}`;
    const duplicate: Shape = {
      ...shape,
      id,
      name: `${shape.name} (Copy)`,
      x: shape.x + 20,
      y: shape.y + 20
    };
    updateShapes([...shapes, duplicate]);
    onSelect(id);
  };

  const updateSelectedShape = (patch: Partial<Shape>) => {
    if (!selectedId) return;
    const next = shapes.map(s => {
      if (s.id === selectedId) {
        return { ...s, ...patch };
      }
      return s;
    });
    updateShapes(next);
  };

  const activeShape = shapes.find(s => s.id === selectedId);

  // Math helper for visual size adjustments
  const activeVisWidth = activeShape
    ? Math.round(activeShape.width * (activeShape.scaleX || 1))
    : 0;

  const activeVisHeight = activeShape
    ? Math.round(activeShape.height * (activeShape.scaleY || 1))
    : 0;

  const handleWidthChange = (val: number) => {
    if (!activeShape) return;
    const currentVisWidth = Math.round(activeShape.width * (activeShape.scaleX || 1));
    const currentVisHeight = Math.round(activeShape.height * (activeShape.scaleY || 1));

    if (activeShape.type === "path") {
      const newScaleX = val / activeShape.width;
      if (activeShape.isRatioLocked && currentVisHeight > 0) {
        const ratio = currentVisWidth / currentVisHeight;
        const targetVisHeight = val / ratio;
        const newScaleY = targetVisHeight / activeShape.height;
        updateSelectedShape({ scaleX: newScaleX, scaleY: newScaleY });
      } else {
        updateSelectedShape({ scaleX: newScaleX });
      }
    } else {
      if (activeShape.isRatioLocked && activeShape.height > 0) {
        const ratio = activeShape.width / activeShape.height;
        updateSelectedShape({
          width: val,
          height: Math.round(val / ratio)
        });
      } else {
        updateSelectedShape({ width: val });
      }
    }
  };

  const handleHeightChange = (val: number) => {
    if (!activeShape) return;
    const currentVisWidth = Math.round(activeShape.width * (activeShape.scaleX || 1));
    const currentVisHeight = Math.round(activeShape.height * (activeShape.scaleY || 1));

    if (activeShape.type === "path") {
      const newScaleY = val / activeShape.height;
      if (activeShape.isRatioLocked && currentVisWidth > 0) {
        const ratio = currentVisWidth / currentVisHeight;
        const targetVisWidth = val * ratio;
        const newScaleX = targetVisWidth / activeShape.width;
        updateSelectedShape({ scaleX: newScaleX, scaleY: newScaleY });
      } else {
        updateSelectedShape({ scaleY: newScaleY });
      }
    } else {
      if (activeShape.isRatioLocked && activeShape.width > 0) {
        const ratio = activeShape.width / activeShape.height;
        updateSelectedShape({
          height: val,
          width: Math.round(val * ratio)
        });
      } else {
        updateSelectedShape({ height: val });
      }
    }
  };

  // Layering reorder logic
  const moveLayer = (direction: "front" | "back" | "up" | "down") => {
    if (!selectedId) return;
    const idx = shapes.findIndex(s => s.id === selectedId);
    if (idx === -1) return;

    const next = [...shapes];
    if (direction === "front") {
      const [el] = next.splice(idx, 1);
      next.push(el);
    } else if (direction === "back") {
      const [el] = next.splice(idx, 1);
      next.unshift(el);
    } else if (direction === "up" && idx < next.length - 1) {
      const temp = next[idx];
      next[idx] = next[idx + 1];
      next[idx + 1] = temp;
    } else if (direction === "down" && idx > 0) {
      const temp = next[idx];
      next[idx] = next[idx - 1];
      next[idx - 1] = temp;
    }
    updateShapes(next);
  };

  return (
    <div className="space-y-5">
      {/* ── Shape Creation Actions ── */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Add Standard Shape
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {[
            { type: "rect", Icon: Square, label: "Rect" },
            { type: "circle", Icon: Circle, label: "Circle" },
            { type: "triangle", Icon: Triangle, label: "Triangle", path: "M 50 0 L 100 100 L 0 100 Z" },
            { type: "star", Icon: Star, label: "Star", path: "M 50 0 L 65 35 L 100 35 L 70 55 L 80 90 L 50 70 L 20 90 L 30 55 L 0 35 L 35 35 Z" },
            { type: "line", Icon: Minus, label: "Line" },
          ].map(({ type, Icon, label, path }) => (
            <TooltipProvider key={type}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    onClick={() => addShape(type, path)}
                    variant="outline"
                    className="h-10 px-0 flex flex-col justify-center items-center gap-1 hover:border-primary hover:text-primary transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] font-bold">{label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs font-bold">Add {label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* ── Predefined Vector Ornaments ── */}
      <div className="space-y-2.5">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          Indian Vector Ornaments
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {DECORATIVE_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              type="button"
              onClick={() => addShape("path", preset.path, preset.name)}
              variant="outline"
              className="h-14 px-3 flex items-center justify-start gap-2.5 hover:border-primary hover:bg-primary/5 transition-all text-left"
            >
              <div className="w-8 h-8 rounded border border-border bg-muted/30 p-1 shrink-0 flex items-center justify-center text-primary">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                  <path d={preset.path} />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10.5px] font-black leading-tight truncate text-foreground">{preset.name}</p>
                <p className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-wider">Vector Decor</p>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* ── Active Shape Customization Parameters ── */}
      {activeShape ? (
        <div className="p-4 rounded-xl border border-border/85 bg-card space-y-4 shadow-md animate-in fade-in duration-200">
          
          {/* Header name with copy & trash */}
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="min-w-0 flex-1 mr-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-primary">Element Name</span>
              <Input
                type="text"
                value={activeShape.name}
                onChange={e => updateSelectedShape({ name: e.target.value })}
                className="h-7 text-xs font-bold bg-transparent border-0 border-b border-transparent hover:border-border/60 focus-visible:border-primary focus-visible:ring-0 px-0 rounded-none w-full truncate"
              />
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => duplicateShape(activeShape)}
                      className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-muted"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs font-bold">Duplicate</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteShape(activeShape.id)}
                      className="w-8 h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs font-bold">Delete Shape</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* ── Figma-style Align Panel ── */}
          {onAlign && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Alignment</span>
              <div className="flex items-center justify-between bg-muted/30 border border-border p-1.5 rounded-lg">
                {[
                  { type: "left", label: "Align Left", Icon: AlignStartHorizontal },
                  { type: "center", label: "Align Horizontal Center", Icon: AlignCenterHorizontal },
                  { type: "right", label: "Align Right", Icon: AlignEndHorizontal },
                  { type: "top", label: "Align Top", Icon: AlignStartVertical },
                  { type: "middle", label: "Align Vertical Middle", Icon: AlignCenterVertical },
                  { type: "bottom", label: "Align Bottom", Icon: AlignEndVertical }
                ].map((btn) => (
                  <TooltipProvider key={btn.type}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onAlign(btn.type)}
                          className="w-7 h-7 hover:text-primary hover:bg-muted"
                        >
                          <btn.Icon className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-xs font-bold">{btn.label}</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}

          {/* ── Figma-style Geometry Inputs Grid ── */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Geometry</span>
            <div className="grid grid-cols-3 gap-2">
              
              {/* X position */}
              <div className="relative flex items-center bg-muted/30 border border-border rounded-lg px-2 py-1">
                <span className="text-[10px] font-bold text-muted-foreground/60 w-3">X</span>
                <input
                  type="number"
                  value={Math.round(activeShape.x)}
                  onChange={e => updateSelectedShape({ x: Number(e.target.value) || 0 })}
                  className="bg-transparent border-none outline-none text-[11px] font-bold w-full text-right pr-1 focus:ring-0"
                />
              </div>

              {/* Y position */}
              <div className="relative flex items-center bg-muted/30 border border-border rounded-lg px-2 py-1">
                <span className="text-[10px] font-bold text-muted-foreground/60 w-3">Y</span>
                <input
                  type="number"
                  value={Math.round(activeShape.y)}
                  onChange={e => updateSelectedShape({ y: Number(e.target.value) || 0 })}
                  className="bg-transparent border-none outline-none text-[11px] font-bold w-full text-right pr-1 focus:ring-0"
                />
              </div>

              {/* Rotation */}
              <div className="relative flex items-center bg-muted/30 border border-border rounded-lg px-2 py-1">
                <RotateCw className="w-3 h-3 text-muted-foreground/60 mr-1 shrink-0" />
                <input
                  type="number"
                  value={Math.round(activeShape.rotation)}
                  onChange={e => updateSelectedShape({ rotation: Number(e.target.value) || 0 })}
                  className="bg-transparent border-none outline-none text-[11px] font-bold w-full text-right pr-1 focus:ring-0"
                />
                <span className="text-[10px] font-bold text-muted-foreground/60">°</span>
              </div>

              {/* Width (W) */}
              <div className="relative flex items-center bg-muted/30 border border-border rounded-lg px-2 py-1">
                <span className="text-[10px] font-bold text-muted-foreground/60 w-3">W</span>
                <input
                  type="number"
                  min={1}
                  value={activeVisWidth}
                  onChange={e => handleWidthChange(Number(e.target.value) || 1)}
                  className="bg-transparent border-none outline-none text-[11px] font-bold w-full text-right pr-1 focus:ring-0"
                />
              </div>

              {/* Height (H) */}
              <div className="relative flex items-center bg-muted/30 border border-border rounded-lg px-2 py-1">
                <span className="text-[10px] font-bold text-muted-foreground/60 w-3">H</span>
                <input
                  type="number"
                  min={1}
                  value={activeVisHeight}
                  onChange={e => handleHeightChange(Number(e.target.value) || 1)}
                  className="bg-transparent border-none outline-none text-[11px] font-bold w-full text-right pr-1 focus:ring-0"
                />
              </div>

              {/* Aspect Ratio Lock & Opacity */}
              <div className="flex items-center justify-between gap-1.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => updateSelectedShape({ isRatioLocked: !activeShape.isRatioLocked })}
                        className={`w-7 h-7 border border-border shrink-0 ${activeShape.isRatioLocked ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground hover:bg-muted'}`}
                      >
                        {activeShape.isRatioLocked ? <Link2 className="w-3.5 h-3.5" /> : <Link2Off className="w-3.5 h-3.5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-bold">{activeShape.isRatioLocked ? "Unlock Aspect Ratio" : "Constrain Proportions"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="relative flex items-center bg-muted/30 border border-border rounded-lg px-1.5 py-1 flex-1 min-w-0">
                  <Eye className="w-3 h-3 text-muted-foreground/60 mr-1 shrink-0" />
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={Math.round(activeShape.opacity * 100)}
                    onChange={e => updateSelectedShape({ opacity: Math.min(100, Math.max(0, Number(e.target.value) || 100)) / 100 })}
                    className="bg-transparent border-none outline-none text-[10px] font-bold w-full text-right focus:ring-0"
                  />
                  <span className="text-[9px] font-bold text-muted-foreground/60">%</span>
                </div>
              </div>

            </div>
          </div>

          {/* ── Figma-style Corner Radius Control (Only for Rects) ── */}
          {activeShape.type === "rect" && (
            <div className="space-y-2.5 border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Corners</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground">Independent Corners</span>
                  <Switch
                    checked={activeShape.isCornersIndependent || false}
                    onCheckedChange={(val) => {
                      if (val) {
                        const uniform = activeShape.cornerRadius || 0;
                        updateSelectedShape({
                          isCornersIndependent: true,
                          cornerRadiusTL: uniform,
                          cornerRadiusTR: uniform,
                          cornerRadiusBR: uniform,
                          cornerRadiusBL: uniform
                        });
                      } else {
                        const tl = activeShape.cornerRadiusTL || 0;
                        updateSelectedShape({
                          isCornersIndependent: false,
                          cornerRadius: tl
                        });
                      }
                    }}
                  />
                </div>
              </div>

              {!activeShape.isCornersIndependent ? (
                // Uniform Corner Radius
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-bold text-muted-foreground">Radius</Label>
                    <span className="text-[10px] font-mono font-bold text-primary">{activeShape.cornerRadius || 0}px</span>
                  </div>
                  <Slider
                    value={[activeShape.cornerRadius || 0]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([val]) => updateSelectedShape({ cornerRadius: val })}
                    className="cursor-pointer"
                  />
                </div>
              ) : (
                // Independent Corner Radii (Figma Style)
                <div className="grid grid-cols-2 gap-2.5 animate-in slide-in-from-top-1 duration-150">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                      <span>Top Left (TL)</span>
                      <span>{activeShape.cornerRadiusTL || 0}px</span>
                    </div>
                    <Slider
                      value={[activeShape.cornerRadiusTL || 0]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([val]) => updateSelectedShape({ cornerRadiusTL: val })}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                      <span>Top Right (TR)</span>
                      <span>{activeShape.cornerRadiusTR || 0}px</span>
                    </div>
                    <Slider
                      value={[activeShape.cornerRadiusTR || 0]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([val]) => updateSelectedShape({ cornerRadiusTR: val })}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                      <span>Bottom Right (BR)</span>
                      <span>{activeShape.cornerRadiusBR || 0}px</span>
                    </div>
                    <Slider
                      value={[activeShape.cornerRadiusBR || 0]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([val]) => updateSelectedShape({ cornerRadiusBR: val })}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                      <span>Bottom Left (BL)</span>
                      <span>{activeShape.cornerRadiusBL || 0}px</span>
                    </div>
                    <Slider
                      value={[activeShape.cornerRadiusBL || 0]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([val]) => updateSelectedShape({ cornerRadiusBL: val })}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Color Selectors */}
          <div className="space-y-3 border-t border-border pt-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fill & Outline</span>

            {activeShape.type !== "line" && (
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-muted-foreground">Fill Color</Label>
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full border-2 border-border shadow overflow-hidden cursor-pointer shrink-0">
                    <input
                      type="color"
                      value={activeShape.fill === "none" ? "#ffffff" : activeShape.fill}
                      onChange={e => updateSelectedShape({ fill: e.target.value })}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div className="w-full h-full" style={{ background: activeShape.fill === "none" ? "transparent" : activeShape.fill }} />
                  </div>
                  {/* Swatches */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[primaryColor, secondaryColor, accentColor, "#ffffff", "none"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateSelectedShape({ fill: color })}
                        className={`w-6 h-6 rounded-full border border-border shadow-sm flex items-center justify-center text-[10px] font-bold ${activeShape.fill === color ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                        style={{ backgroundColor: color === "none" ? "transparent" : color }}
                        title={color === "none" ? "Transparent / No Fill" : color}
                      >
                        {color === "none" && "✕"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stroke Color */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-muted-foreground">Outline Color</Label>
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full border-2 border-border shadow overflow-hidden cursor-pointer shrink-0">
                  <input
                    type="color"
                    value={activeShape.stroke === "none" ? "#ffffff" : activeShape.stroke}
                    onChange={e => updateSelectedShape({ stroke: e.target.value })}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  />
                  <div className="w-full h-full" style={{ background: activeShape.stroke === "none" ? "transparent" : activeShape.stroke }} />
                </div>
                {/* Swatches */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[primaryColor, secondaryColor, accentColor, "#ffffff", "none"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateSelectedShape({ stroke: color, strokeWidth: color === "none" ? 0 : Math.max(1, activeShape.strokeWidth) })}
                      className={`w-6 h-6 rounded-full border border-border shadow-sm flex items-center justify-center text-[10px] font-bold ${activeShape.stroke === color ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                      style={{ backgroundColor: color === "none" ? "transparent" : color }}
                      title={color === "none" ? "No Outline" : color}
                    >
                      {color === "none" && "✕"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stroke Width Slider */}
          {activeShape.stroke !== "none" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-bold text-muted-foreground">Outline Thickness</Label>
                <span className="text-[10px] font-mono font-bold text-primary">{activeShape.strokeWidth}px</span>
              </div>
              <Slider
                value={[activeShape.strokeWidth]}
                min={1}
                max={15}
                step={1}
                onValueChange={([val]) => updateSelectedShape({ strokeWidth: val })}
                className="cursor-pointer"
              />
            </div>
          )}

          {/* Dashed Stroke Toggle & Custom Dashboard Configurations */}
          {activeShape.stroke !== "none" && (
            <div className="space-y-2 border-t border-border pt-3">
              <div className="flex items-center justify-between bg-muted/40 p-2 rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-[11px] font-bold text-foreground">Dashed Outline</Label>
                  <p className="text-[9px] text-muted-foreground">Render outline as dashed pattern</p>
                </div>
                <Switch
                  checked={activeShape.isDashed || false}
                  onCheckedChange={val => updateSelectedShape({ isDashed: val })}
                />
              </div>

              {activeShape.isDashed && (
                <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-1 duration-150">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                      <span>Dash Length</span>
                      <span>{activeShape.dashLength || 6}px</span>
                    </div>
                    <Slider
                      value={[activeShape.dashLength || 6]}
                      min={1}
                      max={40}
                      step={1}
                      onValueChange={([val]) => updateSelectedShape({ dashLength: val })}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                      <span>Dash Gap</span>
                      <span>{activeShape.dashGap || 4}px</span>
                    </div>
                    <Slider
                      value={[activeShape.dashGap || 4]}
                      min={1}
                      max={40}
                      step={1}
                      onValueChange={([val]) => updateSelectedShape({ dashGap: val })}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Layering & Arrangement */}
          <div className="space-y-2 border-t border-border pt-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Arrangement</span>
            <div className="grid grid-cols-4 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveLayer("front")}
                className="h-8 text-[10px] font-bold flex gap-1 items-center px-1"
                title="Bring element to the top of all layers"
              >
                <MoveUp className="w-3 h-3 text-primary" />
                To Front
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveLayer("up")}
                className="h-8 text-[10px] font-bold flex gap-1 items-center px-1"
                title="Move layer up one step"
              >
                <ChevronUp className="w-3 h-3" />
                Forward
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveLayer("down")}
                className="h-8 text-[10px] font-bold flex gap-1 items-center px-1"
                title="Move layer down one step"
              >
                <ChevronDown className="w-3 h-3" />
                Backward
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => moveLayer("back")}
                className="h-8 text-[10px] font-bold flex gap-1 items-center px-1"
                title="Send element to the bottom of all layers"
              >
                <MoveDown className="w-3 h-3 text-muted-foreground" />
                To Back
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 border border-dashed border-border/70 rounded-xl text-center space-y-1.5 bg-muted/10">
          <Layers className="w-8 h-8 text-muted-foreground/50 mx-auto" />
          <p className="text-xs font-bold text-foreground">No element selected</p>
          <p className="text-[10px] text-muted-foreground">
            Select a shape on the design canvas or add a new shape from the templates above to custom configure layout coordinates, strokes, and corner radiuses.
          </p>
        </div>
      )}

      {/* ── Shapes List ── */}
      {shapes.length > 0 && (
        <div className="space-y-2 border-t border-border pt-4">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            All Elements ({shapes.length})
          </Label>
          <div className="border border-border/80 rounded-xl divide-y divide-border/60 max-h-48 overflow-y-auto custom-scrollbar bg-card/40">
            {shapes.map((shape, idx) => (
              <div
                key={shape.id}
                onClick={() => onSelect(shape.id)}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${selectedId === shape.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/40'}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-5 h-5 rounded border border-border shadow-sm flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: shape.fill === "none" ? "transparent" : shape.fill,
                      borderColor: shape.stroke === "none" ? "rgba(0,0,0,0.15)" : shape.stroke,
                    }}
                  >
                    {shape.fill === "none" && <span className="text-[8px]">✕</span>}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[11px] leading-tight truncate ${selectedId === shape.id ? 'font-black text-primary' : 'font-bold text-foreground'}`}>
                      {shape.name}
                    </p>
                    <p className="text-[8.5px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">
                      Layer {idx + 1} • {shape.type}
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteShape(shape.id);
                  }}
                  className="p-1 hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                  title="Remove Shape"
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
