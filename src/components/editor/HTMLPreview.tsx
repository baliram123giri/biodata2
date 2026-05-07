"use client";

import React from "react";
import { useBiodataStore } from "@/store/useBiodataStore";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/utils";
import { translations } from "@/lib/translations";
import { processPDFField } from "@/lib/pdf-data-utils";

// This component mimics the PDF layout using HTML/CSS for a zero-flicker experience
export function HTMLPreview() {
  const { formData, selectedTemplate } = useBiodataStore();
  const theme = useThemeStore();
  
  const currentLang = formData.language || "English";
  const t = translations[currentLang] || translations["English"];
  
  // Design Tokens from Theme
  const primaryColor = theme.primaryColor;
  const secondaryColor = theme.secondaryColor;
  const accentColor = theme.accentColor;
  const baseFontSize = theme.fontSize;
  const padding = theme.padding;
  
  const fontFamily = theme.fontFamily === 'playfair' 
    ? 'var(--font-playfair)' 
    : theme.fontFamily === 'inter' 
      ? 'var(--font-inter)' 
      : 'var(--font-noto-serif)';

  const renderSection = (title: string, fields: any[]) => {
    if (!fields || fields.length === 0) return null;
    const hasValues = fields.some(f => f.value && f.type !== "hidden");
    if (!hasValues) return null;

    return (
      <div className="mb-6">
        <h3 
          className="font-bold mb-3 border-l-4 pl-3" 
          style={{ 
            fontSize: `${baseFontSize * 1.4}px`, 
            color: primaryColor,
            borderColor: primaryColor,
            fontFamily: fontFamily
          }}
        >
          {title}
        </h3>
        <div className="space-y-2 pl-3">
          {fields.map((field: any) => {
            const { displayLabel, displayValue, logoUrl, shouldSkip } = processPDFField(field, fields, formData, t);
            if (shouldSkip) return null;

            return (
              <div key={field.id} className="flex items-start gap-2 leading-relaxed">
                <span 
                  className="w-32 shrink-0 font-bold" 
                  style={{ fontSize: `${baseFontSize}px`, color: secondaryColor, fontFamily: fontFamily }}
                >
                  {displayLabel}
                </span>
                <span style={{ fontSize: `${baseFontSize}px`, color: secondaryColor }}>:</span>
                <div className="flex-1 flex items-center gap-1.5 flex-wrap">
                  {logoUrl && <img src={logoUrl} className="w-4 h-4 object-contain" alt="" />}
                  <span 
                    className="text-black" 
                    style={{ fontSize: `${baseFontSize}px`, fontFamily: fontFamily }}
                  >
                    {logoUrl ? `(${displayValue})` : displayValue}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex justify-center py-8">
      {/* A4 Proportionate Container */}
      <div 
        className="relative bg-white shadow-2xl overflow-hidden print:shadow-none"
        style={{ 
          width: "794px", 
          minHeight: "1123px",
          padding: `${padding}px`,
          backgroundColor: "#fffaf7"
        }}
      >
        {/* Simple HTML recreation of the Frame for the preview */}
        <div className="absolute inset-0 pointer-events-none border-[15px]" style={{ borderColor: primaryColor, opacity: 0.1, borderRadius: "12px", margin: "15px" }} />
        <div className="absolute inset-0 pointer-events-none border-[1.5px]" style={{ borderColor: accentColor, opacity: 0.2, borderRadius: "8px", margin: "28px" }} />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          <div className="text-center mb-8 px-10">
            {formData.mantra && (
              <p 
                className="font-bold mb-1" 
                style={{ fontSize: "14px", color: primaryColor, fontFamily: 'var(--font-noto-devanagari)' }}
              >
                {formData.mantra}
              </p>
            )}
            {formData.title && (
              <h1 
                className="font-bold uppercase tracking-widest" 
                style={{ fontSize: `${baseFontSize * 2.2}px`, color: primaryColor, fontFamily: fontFamily }}
              >
                {formData.title}
              </h1>
            )}
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 gap-1">
              {renderSection(t.personal || "Personal Details", formData.personalDetails)}
              {renderSection(t.educationSec || "Education & Career", formData.educationDetails)}
              {renderSection(t.family || "Family Background", formData.familyDetails)}
              {renderSection(t.contact || "Contact Details", formData.contactDetails)}
            </div>
          </div>
          
          {/* Photo Placeholder */}
          {formData.photo && (
            <div 
              className="absolute shadow-lg border-2"
              style={{ 
                width: '119px', 
                height: '149px', 
                borderRadius: '10px', 
                right: '60px', 
                top: '110px',
                borderColor: primaryColor,
                overflow: 'hidden'
              }}
            >
              <img src={formData.photo} className="w-full h-full object-cover" alt="Profile" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
