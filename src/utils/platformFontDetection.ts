/**
 * Platform-specific font detection and Unicode character support
 * Provides intelligent font fallbacks based on user's operating system and browser
 */

interface PlatformFontInfo {
  platform: string;
  browserEngine: string;
  recommendedFonts: string[];
  fallbackStrategy: 'system' | 'webfont' | 'entity';
  unicodeSupport: 'full' | 'partial' | 'limited';
}

interface FontTestResult {
  fontName: string;
  available: boolean;
  supportsUnicode: boolean;
  testResults: { [char: string]: boolean };
}

/**
 * Platform-specific font configurations
 */
const PLATFORM_CONFIGS: { [key: string]: PlatformFontInfo } = {
  'macOS': {
    platform: 'macOS',
    browserEngine: 'webkit',
    recommendedFonts: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Helvetica Neue', 'Arial'],
    fallbackStrategy: 'system',
    unicodeSupport: 'full'
  },
  'Windows': {
    platform: 'Windows',
    browserEngine: 'blink',
    recommendedFonts: ['Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
    fallbackStrategy: 'webfont',
    unicodeSupport: 'partial'
  },
  'Linux': {
    platform: 'Linux',
    browserEngine: 'gecko',
    recommendedFonts: ['Ubuntu', 'DejaVu Sans', 'Liberation Sans', 'Arial', 'sans-serif'],
    fallbackStrategy: 'webfont',
    unicodeSupport: 'limited'
  },
  'Android': {
    platform: 'Android',
    browserEngine: 'webkit',
    recommendedFonts: ['Roboto', 'Droid Sans', 'sans-serif'],
    fallbackStrategy: 'webfont',
    unicodeSupport: 'partial'
  },
  'iOS': {
    platform: 'iOS',
    browserEngine: 'webkit',
    recommendedFonts: ['-apple-system', 'San Francisco', 'Helvetica Neue', 'Arial'],
    fallbackStrategy: 'system',
    unicodeSupport: 'full'
  }
};

/**
 * Detect the user's platform and browser engine
 */
export const detectPlatform = (): PlatformFontInfo => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  // Detect platform
  if (/Mac|iPhone|iPad/.test(platform) || /Mac OS X/.test(userAgent)) {
    return /iPhone|iPad/.test(platform) ? PLATFORM_CONFIGS['iOS'] : PLATFORM_CONFIGS['macOS'];
  } else if (/Win/.test(platform) || /Windows/.test(userAgent)) {
    return PLATFORM_CONFIGS['Windows'];
  } else if (/Android/.test(userAgent)) {
    return PLATFORM_CONFIGS['Android'];
  } else if (/Linux|X11/.test(platform) || /Linux/.test(userAgent)) {
    return PLATFORM_CONFIGS['Linux'];
  }
  
  // Default fallback
  return PLATFORM_CONFIGS['Windows'];
};

/**
 * Test if a font is available on the system
 */
export const isFontAvailable = (fontName: string): boolean => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  // Test text
  const testString = 'mmmmmmmmmlli';
  canvas.width = 200;
  canvas.height = 50;

  // Measure with the font
  ctx.font = `12px ${fontName}, monospace`;
  const width1 = ctx.measureText(testString).width;

  // Measure with fallback
  ctx.font = '12px monospace';
  const width2 = ctx.measureText(testString).width;

  // If widths are different, the font is available
  return Math.abs(width1 - width2) > 0.5;
};

/**
 * Test Unicode character support in a font
 */
export const testUnicodeSupport = (fontName: string, characters: string[]): { [char: string]: boolean } => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const results: { [char: string]: boolean } = {};
  
  if (!ctx) {
    characters.forEach(char => results[char] = false);
    return results;
  }

  canvas.width = 60;
  canvas.height = 60;

  characters.forEach(char => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw with target font
    ctx.font = `24px ${fontName}`;
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, 30, 30);
    
    // Get image data
    const imageData1 = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Clear and draw with fallback font
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '24px serif'; // Different fallback
    ctx.fillText(char, 30, 30);
    const imageData2 = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Compare the two images
    let isDifferent = false;
    for (let i = 0; i < imageData1.data.length; i += 4) {
      if (imageData1.data[i] !== imageData2.data[i] || 
          imageData1.data[i + 1] !== imageData2.data[i + 1] || 
          imageData1.data[i + 2] !== imageData2.data[i + 2]) {
        isDifferent = true;
        break;
      }
    }
    
    results[char] = isDifferent;
  });

  return results;
};

/**
 * Get the optimal font stack for the current platform
 */
export const getOptimalFontStack = (): string[] => {
  const platformInfo = detectPlatform();
  const fonts = [...platformInfo.recommendedFonts];
  
  // Add web fonts based on strategy
  if (platformInfo.fallbackStrategy === 'webfont') {
    fonts.unshift('Inter', 'Noto Sans');
  }
  
  // Always add emoji fonts at the end
  fonts.push('"Apple Color Emoji"', '"Segoe UI Emoji"', '"Noto Color Emoji"');
  
  return fonts;
};

/**
 * Test all available fonts for Unicode character support
 */
export const runFontCompatibilityTest = async (): Promise<FontTestResult[]> => {
  const platformInfo = detectPlatform();
  const testChars = ['°', 'é', 'è', 'ñ', 'ç', '€'];
  const results: FontTestResult[] = [];
  
  const fontsToTest = [
    'Inter',
    'Inter-Unicode',
    'Noto Sans',
    ...platformInfo.recommendedFonts,
    'Arial',
    'Helvetica',
    'Times New Roman',
    'serif',
    'sans-serif'
  ];
  
  for (const fontName of fontsToTest) {
    const available = isFontAvailable(fontName);
    const unicodeTests = available ? testUnicodeSupport(fontName, testChars) : {};
    const supportsUnicode = Object.values(unicodeTests).some(Boolean);
    
    results.push({
      fontName,
      available,
      supportsUnicode,
      testResults: unicodeTests
    });
  }
  
  return results;
};

/**
 * Generate CSS font-family declaration based on platform detection
 */
export const generateOptimalFontFamily = (): string => {
  const fontStack = getOptimalFontStack();
  return fontStack.map(font => 
    font.includes(' ') && !font.startsWith('"') ? `"${font}"` : font
  ).join(', ');
};

/**
 * Get platform-specific character rendering recommendations
 */
export const getPlatformRecommendations = (): {
  useWebFonts: boolean;
  useHtmlEntities: boolean;
  useFallbackText: boolean;
  fontFamily: string;
} => {
  const platformInfo = detectPlatform();
  
  return {
    useWebFonts: platformInfo.fallbackStrategy === 'webfont',
    useHtmlEntities: platformInfo.unicodeSupport !== 'full',
    useFallbackText: platformInfo.unicodeSupport === 'limited',
    fontFamily: generateOptimalFontFamily()
  };
};

/**
 * Apply platform-specific font optimizations
 */
export const applyPlatformFontOptimizations = (): void => {
  const recommendations = getPlatformRecommendations();
  
  // Update body font-family
  document.body.style.fontFamily = recommendations.fontFamily;
  
  // Add platform-specific CSS class
  const platformInfo = detectPlatform();
  document.documentElement.classList.add(`platform-${platformInfo.platform.toLowerCase()}`);
  document.documentElement.classList.add(`engine-${platformInfo.browserEngine}`);
  
  // Add font optimization CSS
  const style = document.createElement('style');
  style.textContent = `
    .platform-optimized {
      font-family: ${recommendations.fontFamily};
      font-synthesis: weight style;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .unicode-safe {
      font-variant-ligatures: common-ligatures;
      font-variant-numeric: tabular-nums;
    }
  `;
  document.head.appendChild(style);
};