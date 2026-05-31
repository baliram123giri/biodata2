"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  aspect?: number;
}



export function ImageUpload({ value, onChange, aspect = 3 / 4 }: ImageUploadProps) {


  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const src = reader.result?.toString();
        if (!src) return;

        // Compress and resize immediately without cropping
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let targetWidth = img.width;
          let targetHeight = img.height;

          // Cap resolution to avoid massive base64 strings and 413 server errors
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

          if (ctx) {
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            const base64Image = canvas.toDataURL("image/jpeg", 0.85);
            onChange(base64Image);
          }
        };
        img.src = src;
      });
      reader.readAsDataURL(acceptedFiles[0]);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

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
          <input {...getInputProps({ "aria-label": "Upload profile photo" })} />
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

    </div>
  );
}
