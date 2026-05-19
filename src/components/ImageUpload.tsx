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
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const base64Image = canvas.toDataURL("image/jpeg", 0.9);
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
        <div className="relative w-32 h-40 group">
          <img
            src={value}
            alt="Profile"
            className="w-full h-full object-cover rounded-lg border shadow-sm"
          />
          <button
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none">
             <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="h-8 pointer-events-auto" onClick={() => {
                   setImgSrc(value);
                   setIsOpen(true);
                }}>
                   <CropIcon className="w-3.5 h-3.5 mr-1" />
                   Recrop
                </Button>
             </div>
          </div>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adjust your photo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-auto">
            {imgSrc && (
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                className="max-w-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  style={{ maxHeight: '400px' }}
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={getCroppedImg}>
              Save Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
