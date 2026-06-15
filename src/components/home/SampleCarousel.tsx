"use client";

import React from "react";
import { TemplateCarousel } from "./TemplateCarousel";

const SAMPLES = [
  {
    id: "1",
    src: "/preview_samples/Baliram Giri.jpeg",
    title: "Elegant Marathi Biodata Sample",
    community: "Marathi / Hindu",
    description: "A complete pre-filled matrimonial profile showcasing clean formatting, elegant styling, and proper photo frame integration."
  },
  {
    id: "2",
    src: "/preview_samples/effqtr5upgc4k4sp87cp.png",
    title: "Shubh Vivah Parichay",
    community: "Marathi / Regional",
    description: "A complete Marathi marriage biodata template featuring a crimson border, floral corner motifs, and traditional styling."
  },
  {
    id: "3",
    src: "/preview_samples/ewqlvpmwlvhpijrs72w6.png",
    title: "Watercolor Blue & Orange",
    community: "Hindi / Universal",
    description: "A clean and elegant Hindi marriage biodata template featuring a soft watercolor background with blue and orange tones."
  },
  {
    id: "4",
    src: "/preview_samples/nbmzkftttzofbvuis0uw.png",
    title: "Royal Gold Marathi Style",
    community: "Hindi / Marathi",
    description: "A traditional Hindi marriage biodata template with deep maroon backgrounds, gold borders, and clear layout."
  },
  {
    id: "5",
    src: "/preview_samples/template_preview_hq_1780654994849.png",
    title: "Premium Floral Heritage",
    community: "Traditional Hindu",
    description: "A premium matrimonial biodata design featuring intricate floral borders and gold ornamental frame accents."
  },
  {
    id: "6",
    src: "/preview_samples/vysbvo5lwv7wxhj2ahzw.png",
    title: "Traditional Marathi Parichay",
    community: "Marathi / Regional",
    description: "A beautifully structured marriage biodata template crafted for Marathi families, featuring elegant gold ornamental borders."
  },
  {
    id: "7",
    src: "/preview_samples/मराठी विवाह परिचय पत्र Template _ Marathi Marriage Biodata Design 2026 – Printable PDF_preview_hq_1780753314877 (1).png",
    title: "Marathi Vivah Parichay Patra",
    community: "मराठी / Regional",
    description: "The most trusted Marathi matrimonial biodata template of 2026, optimized for high-quality printing and sharing."
  }
];

export function SampleCarousel() {
  return (
    <TemplateCarousel
      samples={SAMPLES}
      title={
        <>
          Browse Our <span className="text-gradient-primary">Premium Biodata Samples</span>
        </>
      }
      themePrimary="#9B1B30"
      themeAccent="#C9A84C"
    />
  );
}
