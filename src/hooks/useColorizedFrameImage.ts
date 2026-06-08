import { useState, useEffect } from 'react';
import { tintSvg } from '@/lib/frame-config';
import { getClientImageUrl } from '@/lib/utils';

// Client-side in-memory cache for raw SVG text templates
const svgCache: Record<string, string> = {};

export function useColorizedFrameImage(
  src: string | null,
  originalPrimary: string,
  newPrimary: string,
  originalAccent: string,
  newAccent: string
) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }

    const resolvedSrc = getClientImageUrl(src);

    // Check if the source is an SVG
    const isSvg = resolvedSrc.toLowerCase().includes('.svg') || resolvedSrc.startsWith('data:image/svg+xml');

    if (!isSvg) {
      // Load standard images normally
      const img = new window.Image();
      if (!resolvedSrc.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => setImage(img);
      img.onerror = () => setImage(null);
      img.src = resolvedSrc;
      return;
    }

    let isMounted = true;

    const loadAndColorize = async () => {
      try {
        let svgText = "";
        
        if (svgCache[resolvedSrc]) {
          svgText = svgCache[resolvedSrc];
        } else if (resolvedSrc.startsWith('data:image/svg+xml;base64,')) {
          const base64Content = resolvedSrc.split(',')[1];
          svgText = atob(base64Content);
        } else if (resolvedSrc.startsWith('data:image/svg+xml;utf8,')) {
          svgText = decodeURIComponent(resolvedSrc.split('utf8,')[1]);
        } else if (resolvedSrc.startsWith('data:image/svg+xml,')) {
          svgText = decodeURIComponent(resolvedSrc.split(',')[1]);
        } else {
          // Fetch from remote URL directly
          const res = await fetch(resolvedSrc);
          if (!res.ok) throw new Error("Failed to fetch SVG");
          svgText = await res.text();
          // Cache the successfully retrieved SVG content
          svgCache[resolvedSrc] = svgText;
        }

        if (!isMounted) return;

        // Apply dynamic color tinting
        const tintedSvg = tintSvg(svgText, originalPrimary, newPrimary, originalAccent, newAccent);

        // Convert the tinted SVG XML code to a data URL
        const tintedDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(tintedSvg);

        const img = new window.Image();
        // Do NOT set crossOrigin on data URLs as it causes load failures in some browsers
        img.onload = () => {
          if (isMounted) setImage(img);
        };
        img.onerror = (e) => {
          console.error("Failed to load image from tinted data URL:", e);
          if (isMounted) setImage(null);
        };
        img.src = tintedDataUrl;
      } catch (err) {
        console.error("Error colorizing frame SVG:", err);
        // Fallback: load the original SVG
        const img = new window.Image();
        if (!resolvedSrc.startsWith('data:')) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
          if (isMounted) setImage(img);
        };
        img.onerror = (e) => {
          console.error("Failed to load fallback original SVG:", e);
        };
        img.src = resolvedSrc;
      }
    };

    loadAndColorize();

    return () => {
      isMounted = false;
    };
  }, [src, originalPrimary, newPrimary, originalAccent, newAccent]);

  return image;
}

