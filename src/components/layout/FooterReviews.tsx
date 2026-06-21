import * as React from "react";
import { Star, ExternalLink } from "lucide-react";
import { prisma, withRetry } from "@/lib/prisma";
import { FooterReviewsTooltip } from "./FooterReviewsTooltip";

import { unstable_cache } from "next/cache";

const getCachedReviewSettings = unstable_cache(
  async () => {
    if (!prisma || !(prisma as any).reviewSettings) {
      console.warn("[FooterReviews] prisma.reviewSettings is undefined. Returning null.");
      return null;
    }
    
    // Read only: query the DB without transaction/write overhead
    let settings = await withRetry(() =>
      (prisma as any).reviewSettings.findUnique({
        where: { id: "global" },
      })
    );
    
    // Create lazily if it does not exist (runs once per cache lifetime)
    if (!settings) {
      try {
        settings = await withRetry(() =>
          (prisma as any).reviewSettings.create({
            data: {
              id: "global",
              googleEnabled: true,
              googleRating: 4.9,
              googleCount: 524,
              googleUrl: "https://share.google/T4eEjxMJkqDKaFWGN",
              trustpilotEnabled: true,
              trustpilotRating: 4.8,
              trustpilotCount: 320,
              trustpilotUrl: "https://www.trustpilot.com/review/biodata99.com",
            },
          })
        );
      } catch (err) {
        console.error("Failed to initialize default review settings in cache worker:", err);
      }
    }
    return settings;
  },
  ["footer-review-settings-cache-v1"],
  { revalidate: 3600, tags: ["footer-reviews"] }
);

export async function FooterReviews() {
  let googleEnabled = true;
  let googleCount = 524;
  let googleAvg = 4.9;
  let googleUrl = "https://share.google/T4eEjxMJkqDKaFWGN";

  let trustpilotEnabled = true;
  let trustpilotCount = 320;
  let trustpilotAvg = 4.8;
  let trustpilotUrl = "https://www.trustpilot.com/review/biodata99.com";

  try {
    const settings: any = await getCachedReviewSettings();
    if (settings) {
      googleEnabled = settings.googleEnabled;
      googleCount = settings.googleCount;
      googleAvg = settings.googleRating;
      googleUrl = settings.googleUrl;

      trustpilotEnabled = settings.trustpilotEnabled;
      trustpilotCount = settings.trustpilotCount;
      trustpilotAvg = settings.trustpilotRating;
      trustpilotUrl = settings.trustpilotUrl;
    }
  } catch (error) {
    console.error("Failed to fetch review settings for footer reviews:", error);
  }

  if (!googleEnabled && !trustpilotEnabled) {
    return null;
  }

  // Helper to render stars with support for half stars
  const renderStars = (rating: number, isGoogle: boolean) => {
    const activeColor = isGoogle ? "text-amber-400 fill-amber-400" : "text-emerald-400 fill-emerald-400";
    
    return Array.from({ length: 5 }, (_, i) => {
      const diff = rating - i;
      
      // Full star threshold (>= 0.75)
      if (diff >= 0.75) {
        return (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${activeColor}`}
          />
        );
      }
      
      // Half star threshold (>= 0.25 and < 0.75)
      if (diff >= 0.25) {
        return (
          <div key={i} className="relative w-3.5 h-3.5 shrink-0 select-none">
            {/* Background outline star */}
            <Star className="absolute inset-0 w-3.5 h-3.5 text-slate-600 fill-transparent" />
            {/* Overlay filled left-half star */}
            <Star 
              className={`absolute inset-0 w-3.5 h-3.5 ${activeColor}`}
              style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
            />
          </div>
        );
      }
      
      // Empty star
      return (
        <Star
          key={i}
          className="w-3.5 h-3.5 text-slate-600 fill-transparent"
        />
      );
    });
  };

  const googleStars = renderStars(googleAvg, true);
  const trustpilotStars = renderStars(trustpilotAvg, false);

  return (
    <div className="flex flex-col gap-2 mt-2.5 w-fit">
      {/* Subtitle */}
      <span className="text-[11px] font-semibold text-slate-300 group-[.footer-marathi]/footer:text-[#FEF3C7] group-[.footer-muslim]/footer:text-[#F5E6B8] tracking-wide">
        Trusted by Indian families
      </span>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-0.5">
        {googleEnabled && (
          <div className="flex flex-col gap-2 w-fit">
            {/* Ratings & Stars row wrapped in a Radix Tooltip */}
            <FooterReviewsTooltip content={`Average Google rating of ${googleAvg}/5 based on real user feedback.`}>
              <div className="flex items-center gap-2 cursor-help">
                <div className="flex items-center gap-0.5">
                  {googleStars}
                </div>
                <span className="text-xs font-bold text-slate-200 group-[.footer-marathi]/footer:text-[#FFFDF9] group-[.footer-muslim]/footer:text-[#FAF8F3]">
                  {googleAvg} <span className="text-slate-300 group-[.footer-marathi]/footer:text-[#FEF3C7] group-[.footer-muslim]/footer:text-[#FAF8F3]/80 font-normal">· {googleCount}+ reviews</span>
                </span>
              </div>
            </FooterReviewsTooltip>

            {/* Google Reviews Button */}
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/12 text-slate-200 hover:text-white group-[.footer-marathi]/footer:border-white/20 group-[.footer-marathi]/footer:bg-white/10 group-[.footer-marathi]/footer:hover:bg-white/15 group-[.footer-marathi]/footer:text-white group-[.footer-muslim]/footer:border-white/20 group-[.footer-muslim]/footer:bg-white/10 group-[.footer-muslim]/footer:hover:bg-white/15 group-[.footer-muslim]/footer:text-white text-xs font-bold transition-all duration-200 w-fit cursor-pointer mt-1"
            >
              {/* Google 'G' Logo SVG */}
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3.01A11.916 11.916 0 0 0 12 0C7.309 0 3.268 2.56 1.155 6.368l4.11 3.397z"
                />
                <path
                  fill="#34A853"
                  d="M16.04 15.345c-1.077.733-2.433 1.164-4.04 1.164-2.955 0-5.467-1.99-6.36-4.673L1.517 15.22A11.969 11.969 0 0 0 12 24c3.3 0 6.073-1.091 8.09-2.964l-4.05-3.691z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.273c0-.818-.073-1.609-.209-2.373H12v4.582h6.455c-.278 1.482-1.118 2.736-2.373 3.582l4.05 3.691c2.372-2.19 3.736-5.418 3.736-9.482z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.64 11.836A7.16 7.16 0 0 1 5.64 9.773L1.53 6.376A11.933 11.933 0 0 0 0 12c0 2.01.5 3.91 1.382 5.59l4.258-3.754z"
                />
              </svg>
              <span>See Google reviews</span>
              <ExternalLink className="w-3 h-3 text-slate-300 group-[.footer-marathi]/footer:text-[#FEF3C7] group-[.footer-muslim]/footer:text-[#F5E6B8]" />
            </a>
          </div>
        )}

        {trustpilotEnabled && (
          <div className="flex flex-col gap-2 w-fit">
            {/* Ratings & Stars row wrapped in a Radix Tooltip */}
            <FooterReviewsTooltip content={`Average Trustpilot rating of ${trustpilotAvg}/5 based on real user feedback.`}>
              <div className="flex items-center gap-2 cursor-help">
                <div className="flex items-center gap-0.5">
                  {trustpilotStars}
                </div>
                <span className="text-xs font-bold text-slate-200 group-[.footer-marathi]/footer:text-[#FFFDF9] group-[.footer-muslim]/footer:text-[#FAF8F3]">
                  {trustpilotAvg} <span className="text-slate-300 group-[.footer-marathi]/footer:text-[#FEF3C7] group-[.footer-muslim]/footer:text-[#FAF8F3]/80 font-normal">· {trustpilotCount}+ reviews</span>
                </span>
              </div>
            </FooterReviewsTooltip>

            {/* Trustpilot Reviews Button */}
            <a
              href={trustpilotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/12 text-slate-200 hover:text-white group-[.footer-marathi]/footer:border-white/20 group-[.footer-marathi]/footer:bg-white/10 group-[.footer-marathi]/footer:hover:bg-white/15 group-[.footer-marathi]/footer:text-white group-[.footer-muslim]/footer:border-white/20 group-[.footer-muslim]/footer:bg-white/10 group-[.footer-muslim]/footer:hover:bg-white/15 group-[.footer-muslim]/footer:text-white text-xs font-bold transition-all duration-200 w-fit cursor-pointer mt-1"
            >
              {/* Trustpilot Star SVG */}
              <svg className="w-3.5 h-3.5 shrink-0 fill-emerald-400" viewBox="0 0 24 24">
                <path d="M24 9.624H14.83L12 1l-2.83 8.624H0l7.41 5.378L4.58 23L12 17.624L19.42 23l-2.83-8.998z" />
              </svg>
              <span>See Trustpilot reviews</span>
              <ExternalLink className="w-3 h-3 text-slate-300 group-[.footer-marathi]/footer:text-[#FEF3C7] group-[.footer-muslim]/footer:text-[#F5E6B8]" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
