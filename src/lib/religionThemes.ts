export interface ReligionTheme {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;
  gradientStart: string;
  gradientEnd: string;
  shadowColor: string;
  descriptionColor?: string;
}

export const RELIGION_THEMES: Record<string, ReligionTheme> = {
  Muslim: {
    primary: "#0F4C3A",
    primaryHover: "#0D4333",
    primaryLight: "rgba(15, 76, 58, 0.1)",
    secondary: "#D4AF37",
    secondaryHover: "#C59F2A",
    secondaryLight: "rgba(212, 175, 55, 0.1)",
    gradientStart: "#0F4C3A",
    gradientEnd: "#166D53",
    shadowColor: "rgba(15, 76, 58, 0.2)",
    descriptionColor: "#0F4C3A",
  },
  Hindu: {
    primary: "#E65C00", // Saffron/Orange
    primaryHover: "#CC5200",
    primaryLight: "rgba(230, 92, 0, 0.1)",
    secondary: "#FFD700", // Gold
    secondaryHover: "#E6C200",
    secondaryLight: "rgba(255, 215, 0, 0.1)",
    gradientStart: "#E65C00",
    gradientEnd: "#FF8C00",
    shadowColor: "rgba(230, 92, 0, 0.2)",
    descriptionColor: "#803300",
  },
  Sikh: {
    primary: "#1A365D", // Dark Navy
    primaryHover: "#122643",
    primaryLight: "rgba(26, 54, 93, 0.1)",
    secondary: "#F59E0B", // Amber/Gold
    secondaryHover: "#D97706",
    secondaryLight: "rgba(245, 158, 11, 0.1)",
    gradientStart: "#1A365D",
    gradientEnd: "#2B6CB0",
    shadowColor: "rgba(26, 54, 93, 0.2)",
    descriptionColor: "#1A365D",
  },
};

export function getReligionTheme(religion?: string | null): ReligionTheme | null {
  if (!religion) return null;
  // Case-insensitive match or direct key lookup
  const matchKey = Object.keys(RELIGION_THEMES).find(
    (key) => key.toLowerCase() === religion.toLowerCase()
  );
  return matchKey ? RELIGION_THEMES[matchKey] : null;
}
