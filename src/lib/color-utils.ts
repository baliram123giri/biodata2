export function getLightBgColor(hex: string): string {
  // Remove '#' if present
  hex = hex.replace(/^#/, '');

  // Parse RGB
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  // Mix with white (95% white, 5% color)
  const mixRatio = 0.05;
  r = Math.round(r * mixRatio + 255 * (1 - mixRatio));
  g = Math.round(g * mixRatio + 255 * (1 - mixRatio));
  b = Math.round(b * mixRatio + 255 * (1 - mixRatio));

  // Convert back to hex
  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
