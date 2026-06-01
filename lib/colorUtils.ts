// Color conversion utilities for accurate color distance calculations

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface LAB {
  l: number;
  a: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

// Convert HEX to RGB
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// Convert RGB to HEX
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

// Convert HSL to RGB
export function hslToRgb(hsl: HSL): RGB {
  const { h, s, l } = hsl;
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

// Convert RGB to HSL
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert RGB to LAB (using D65 illuminant)
export function rgbToLab(rgb: RGB): LAB {
  // First convert RGB to XYZ
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  // Apply gamma correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  r *= 100;
  g *= 100;
  b *= 100;

  // RGB to XYZ
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

  // XYZ to LAB (D65 illuminant)
  const refX = 95.047;
  const refY = 100.000;
  const refZ = 108.883;

  let xr = x / refX;
  let yr = y / refY;
  let zr = z / refZ;

  const epsilon = 0.008856;
  const kappa = 903.3;

  xr = xr > epsilon ? Math.pow(xr, 1/3) : (kappa * xr + 16) / 116;
  yr = yr > epsilon ? Math.pow(yr, 1/3) : (kappa * yr + 16) / 116;
  zr = zr > epsilon ? Math.pow(zr, 1/3) : (kappa * zr + 16) / 116;

  return {
    l: 116 * yr - 16,
    a: 500 * (xr - yr),
    b: 200 * (yr - zr),
  };
}

// Calculate Delta E (CIE76) - perceptual color distance
export function deltaE(lab1: LAB, lab2: LAB): number {
  const deltaL = lab1.l - lab2.l;
  const deltaA = lab1.a - lab2.a;
  const deltaB = lab1.b - lab2.b;
  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

// Calculate Delta E between two hex colors
export function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lab1 = rgbToLab(rgb1);
  const lab2 = rgbToLab(rgb2);
  return deltaE(lab1, lab2);
}

// Generate a random vibrant color
export function generateRandomColor(): string {
  // Generate colors with good saturation and varied lightness
  const h = Math.floor(Math.random() * 360);
  const s = 50 + Math.floor(Math.random() * 40); // 50-90% saturation
  const l = 35 + Math.floor(Math.random() * 35); // 35-70% lightness

  const rgb = hslToRgb({ h, s, l });
  return rgbToHex(rgb);
}

// Convert HSL to HEX
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

// Convert HEX to HSL
export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}
