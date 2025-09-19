
// Cached HSL values to avoid recalculating
const hslCache = new Map<string, { h: number, s: number, l: number }>();

// Convert hex color to HSL values with caching
export const hexToHSL = (hex: string): { h: number, s: number, l: number } => {
  // Normalize the hex color for consistent caching
  const normalizedHex = hex.toLowerCase().startsWith('#') ? hex.toLowerCase() : `#${hex.toLowerCase()}`;
  
  // Use cached value if available
  if (hslCache.has(normalizedHex)) {
    return hslCache.get(normalizedHex)!;
  }
  
  // Remove # if present
  let cleanHex = normalizedHex.replace('#', '');
  
  // Handle shorthand hex (#FFF)
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  
  // Convert hex to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    
    h = Math.round(h * 60);
  }
  
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  const result = { h, s, l };
  
  // Cache the result
  hslCache.set(normalizedHex, result);
  return result;
};

// Clear the HSL cache when needed (e.g., when memory needs to be freed)
export const clearHSLCache = (): void => {
  hslCache.clear();
};
