"use client";

import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, X, Crop as CropIcon, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  aspect?: number;
}

// Utility to center the initial crop
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageUpload({ value, onChange, aspect = 3 / 4 }: ImageUploadProps) {
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isOpen, setIsOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrc(reader.result?.toString() || "");
        setIsOpen(true);
      });
      reader.readAsDataURL(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  };

  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    let targetWidth = completedCrop.width * scaleX;
    let targetHeight = completedCrop.height * scaleY;

    // Cap resolution to avoid massive base64 strings and 413 server errors (800px is still very sharp for a biodata photo)
    const maxDim = 800;
    if (targetWidth > maxDim || targetHeight > maxDim) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((maxDim / targetWidth) * targetHeight);
        targetWidth = maxDim;
      } else {
        targetWidth = Math.round((maxDim / targetHeight) * targetWidth);
        targetHeight = maxDim;
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      targetWidth,
      targetHeight
    );

    const base64Image = canvas.toDataURL("image/jpeg", 0.85);
    onChange(base64Image);
    setIsOpen(false);
    setImgSrc("");
  }, [completedCrop, onChange]);

  return (
    <div className="space-y-4">
      {!value ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer
            flex flex-col items-center justify-center gap-3
            ${isDragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-gray-200 hover:border-primary/50 hover:bg-gray-50"}
          `}
        >
          <input {...getInputProps()} />
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-700">Click or drag photo here</p>
            <p className="text-sm text-gray-500">Professional portrait recommended</p>
          </div>
        </div>
      ) : (
        <div className="relative w-28 h-36">
          <img
            src={value}
            alt="Profile"
            className="w-full h-full object-cover rounded-lg border shadow-sm bg-gray-50"
          />
          <button
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-all active:scale-95 z-10"
            title="Remove photo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[95vw] sm:max-w-xl md:max-w-2xl p-4 sm:p-6 rounded-xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle>Adjust your photo</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-100/50 rounded-lg p-2 sm:p-4 min-h-0 overflow-hidden relative">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                className="flex items-center justify-center max-w-full max-h-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-w-full object-contain"
                  style={{ maxHeight: "calc(90vh - 180px)" }}
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter className="shrink-0 gap-2 mt-2 sm:mt-0 pt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={getCroppedImg} className="w-full sm:w-auto">
              Save Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
