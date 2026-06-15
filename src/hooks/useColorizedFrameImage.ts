import { useState, useEffect } from 'react';
import { tintSvg } from '@/lib/frame-config';
import { getClientImageUrl } from '@/lib/utils';

// Client-side in-memory cache for raw SVG text templates
export const svgCache: Record<string, string> = {};

// Client-side in-memory cache for colorized HTMLImageElements to avoid reload/flicker
export const colorizedImageCache: Record<string, HTMLImageElement> = {};

export async function preloadSvg(url: string) {
  if (!url || svgCache[url]) return;
  try {
    const resolvedUrl = getClientImageUrl(url);
    const isSvg = resolvedUrl.toLowerCase().includes('.svg') || resolvedUrl.startsWith('data:image/svg+xml');
    if (!isSvg) return;

    if (resolvedUrl.startsWith('data:image/svg+xml;base64,')) {
      const base64Content = resolvedUrl.split(',')[1];
      svgCache[resolvedUrl] = atob(base64Content);
    } else if (resolvedUrl.startsWith('data:image/svg+xml;utf8,')) {
      svgCache[resolvedUrl] = decodeURIComponent(resolvedUrl.split('utf8,')[1]);
    } else if (resolvedUrl.startsWith('data:image/svg+xml,')) {
      svgCache[resolvedUrl] = decodeURIComponent(resolvedUrl.split(',')[1]);
    } else {
      const res = await fetch(resolvedUrl);
      if (res.ok) {
        svgCache[resolvedUrl] = await res.text();
      }
    }
  } catch (e) {
    console.error("Error preloading SVG:", e);
  }
}

export function useColorizedFrameImage(
  src: string | null,
  originalPrimary: string,
  newPrimary: string,
  originalAccent: string,
  newAccent: string
) {
  const cacheKey = src ? `${src}_${newPrimary}_${newAccent}` : '';
  const [image, setImage] = useState<HTMLImageElement | null>(() => {
    if (cacheKey && colorizedImageCache[cacheKey]) {
      return colorizedImageCache[cacheKey];
    }
    return null;
  });

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }

    const resolvedSrc = getClientImageUrl(src);
    const currentCacheKey = `${resolvedSrc}_${newPrimary}_${newAccent}`;

    // If already cached in memory, use it immediately
    if (colorizedImageCache[currentCacheKey]) {
      setImage(colorizedImageCache[currentCacheKey]);
      return;
    }

    // Check if the source is an SVG
    const isSvg = resolvedSrc.toLowerCase().includes('.svg') || resolvedSrc.startsWith('data:image/svg+xml');

    if (!isSvg) {
      // Load standard images normally
      const img = new window.Image();
      if (!resolvedSrc.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        colorizedImageCache[currentCacheKey] = img;
        setImage(img);
      };
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
        const colorized = tintSvg(svgText, originalPrimary, newPrimary, originalAccent, newAccent);

        // Convert the tinted SVG XML code to a data URL
        const tintedDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(colorized);

        const img = new window.Image();
        // Do NOT set crossOrigin on data URLs as it causes load failures in some browsers
        img.onload = () => {
          if (isMounted) {
            colorizedImageCache[currentCacheKey] = img;
            setImage(img);
          }
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
          if (isMounted) {
            colorizedImageCache[currentCacheKey] = img;
            setImage(img);
          }
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

export function preloadFrameImage(
  src: string | null | undefined,
  originalPrimary: string,
  newPrimary: string,
  originalAccent: string,
  newAccent: string
): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  const resolvedSrc = getClientImageUrl(src);
  const currentCacheKey = `${resolvedSrc}_${newPrimary}_${newAccent}`;

  if (colorizedImageCache[currentCacheKey]) {
    return Promise.resolve(colorizedImageCache[currentCacheKey]);
  }

  const isSvg = resolvedSrc.toLowerCase().includes('.svg') || resolvedSrc.startsWith('data:image/svg+xml');

  return new Promise((resolve) => {
    if (!isSvg) {
      const img = new window.Image();
      if (!resolvedSrc.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        colorizedImageCache[currentCacheKey] = img;
        resolve(img);
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = resolvedSrc;
      return;
    }

    preloadSvg(resolvedSrc).then(() => {
      const svgText = svgCache[resolvedSrc];
      if (!svgText) {
        resolve(null);
        return;
      }
      try {
        const colorized = tintSvg(svgText, originalPrimary, newPrimary, originalAccent, newAccent);
        const tintedDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(colorized);
        const img = new window.Image();
        img.onload = () => {
          colorizedImageCache[currentCacheKey] = img;
          resolve(img);
        };
        img.onerror = () => {
          resolve(null);
        };
        img.src = tintedDataUrl;
      } catch (err) {
        console.error("Error preloading colorized SVG:", err);
        resolve(null);
      }
    });
  });
}

