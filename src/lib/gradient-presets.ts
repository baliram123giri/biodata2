/**
 * Curated Premium Gradient Presets Registry
 * 
 * Aggregates 50 professional linear/radial gradient palettes designed 
 * specifically for matrimonial biodata frames and background settings.
 */

export interface GradientPreset {
  name: string;
  colors: string; // Comma-separated hex values
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  // Dark / Rich Presets (Matches Gold frames well)
  { name: "Midnight Navy", colors: "#0f172a,#1e293b" },
  { name: "Deep Aubergine", colors: "#2a1b38,#3a254f" },
  { name: "Royal Onyx", colors: "#0a0a0a,#1c1c1c" },
  { name: "Emerald Black", colors: "#061a14,#0e3327" },
  { name: "Rich Crimson", colors: "#2b0910,#4a101b" },
  { name: "Deep Cocoa", colors: "#2c1810,#422418" },
  { name: "Midnight Sapphire", colors: "#020c1b,#0a192f" },
  { name: "Dark Amethyst", colors: "#1a0b2e,#3b185f" },
  { name: "Forest Night", colors: "#013220,#02422b" },
  { name: "Burgundy Wine", colors: "#3b0000,#5c0000" },
  { name: "Obsidian", colors: "#000000,#242424" },
  { name: "Navy to Purple", colors: "#0f0c29,#302b63,#24243e" },
  
  // Warm & Earthy
  { name: "Warm Gold", colors: "#ffffff,#fef9e7" },
  { name: "Sunset Orange", colors: "#ff7e5f,#feb47b" },
  { name: "Peachy Dawn", colors: "#ffedbc,#ed4264" },
  { name: "Desert Sand", colors: "#e6dada,#274046" },
  { name: "Autumn Leaves", colors: "#d38312,#a83279" },
  { name: "Mocha", colors: "#e6d0ce,#9a8478" },
  { name: "Bronze Muted", colors: "#b79891,#94716b" },
  { name: "Coffee", colors: "#603813,#b29f94" },
  
  // Cool & Aquatic
  { name: "Aqua Marine", colors: "#1a2a6c,#b21f1f,#fdbb2d" },
  { name: "Ocean Breeze", colors: "#2193b0,#6dd5ed" },
  { name: "Deep Sea", colors: "#2c3e50,#3498db" },
  { name: "Mint Water", colors: "#56ab2f,#a8e063" },
  { name: "Subtle Mint", colors: "#ffffff,#f2fbf5" },
  { name: "Teal Glow", colors: "#11998e,#38ef7d" },
  { name: "Azure Pop", colors: "#00c6ff,#0072ff" },
  { name: "Frost", colors: "#000428,#004e92" },
  
  // Vibrant & Playful
  { name: "Magenta Pop", colors: "#f12711,#f5af19" },
  { name: "Neon Pink", colors: "#dd3e54,#6be585" },
  { name: "Purple Haze", colors: "#8e2de2,#4a00e0" },
  { name: "Fruity", colors: "#f09819,#edde5d" },
  { name: "Mango", colors: "#ffe259,#ffa751" },
  { name: "Berry Smooth", colors: "#8a2387,#e94057,#f27121" },
  { name: "Cosmic", colors: "#ff0099,#493240" },
  
  // Light / Pastel
  { name: "Soft Rose", colors: "#ffffff,#fff0f5" },
  { name: "Pearl White", colors: "#ffffff,#f8f9fa" },
  { name: "Lavender Dream", colors: "#e0c3fc,#8ec5fc" },
  { name: "Sky Tint", colors: "#e0eafc,#cfdef3" },
  { name: "Rose Water", colors: "#e55d87,#5fc3e4" },
  { name: "Cotton Candy", colors: "#ffecd2,#fcb69f" },
  { name: "Peppermint", colors: "#a1ffce,#faffd1" },
  { name: "Vanilla", colors: "#f3e7e9,#e3eeff" },
  { name: "Lemon", colors: "#f9d423,#ff4e50" },
  
  // Elegant & Neutral
  { name: "Silver Grey", colors: "#bdc3c7,#2c3e50" },
  { name: "Slate", colors: "#4b6cb7,#182848" },
  { name: "Steel", colors: "#141e30,#243b55" },
  { name: "Platinum", colors: "#d7d2cc,#304352" },
  { name: "Ash", colors: "#606c88,#3f4c6b" },
  { name: "Graphite", colors: "#485563,#29323c" }
];
