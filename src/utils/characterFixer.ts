/**
 * Character encoding fix utilities for handling problematic Unicode characters
 * This provides multiple strategies to ensure special characters display correctly
 */

interface CharacterMapping {
  unicode: string;
  htmlEntity: string;
  cssContent: string;
  fallbackText: string;
  charCode: number;
}

/**
 * Comprehensive mapping of problematic characters with multiple fallback strategies
 */
const CHARACTER_MAPPINGS: CharacterMapping[] = [
  {
    unicode: '°',
    htmlEntity: '&deg;',
    cssContent: '\\00B0',
    fallbackText: 'deg',
    charCode: 0x00B0
  },
  {
    unicode: 'é',
    htmlEntity: '&eacute;',
    cssContent: '\\00E9',
    fallbackText: 'e',
    charCode: 0x00E9
  },
  {
    unicode: 'è',
    htmlEntity: '&egrave;',
    cssContent: '\\00E8',
    fallbackText: 'e',
    charCode: 0x00E8
  },
  {
    unicode: 'à',
    htmlEntity: '&agrave;',
    cssContent: '\\00E0',
    fallbackText: 'a',
    charCode: 0x00E0
  },
  {
    unicode: 'ç',
    htmlEntity: '&ccedil;',
    cssContent: '\\00E7',
    fallbackText: 'c',
    charCode: 0x00E7
  },
  {
    unicode: 'ñ',
    htmlEntity: '&ntilde;',
    cssContent: '\\00F1',
    fallbackText: 'n',
    charCode: 0x00F1
  },
  {
    unicode: 'ï',
    htmlEntity: '&iuml;',
    cssContent: '\\00EF',
    fallbackText: 'i',
    charCode: 0x00EF
  },
  {
    unicode: 'ô',
    htmlEntity: '&ocirc;',
    cssContent: '\\00F4',
    fallbackText: 'o',
    charCode: 0x00F4
  },
  {
    unicode: 'ù',
    htmlEntity: '&ugrave;',
    cssContent: '\\00F9',
    fallbackText: 'u',
    charCode: 0x00F9
  },
  {
    unicode: 'û',
    htmlEntity: '&ucirc;',
    cssContent: '\\00FB',
    fallbackText: 'u',
    charCode: 0x00FB
  },
  {
    unicode: '€',
    htmlEntity: '&euro;',
    cssContent: '\\20AC',
    fallbackText: 'EUR',
    charCode: 0x20AC
  }
];

/**
 * Detect if a character is displaying incorrectly (as replacement character)
 */
export const hasCharacterDisplayIssue = (text: string): boolean => {
  // Check for replacement characters, question marks in suspicious patterns
  return /[\uFFFD?]/.test(text) && /[a-zA-Z]\s*[\uFFFD?]\s*[0-9]/.test(text);
};

/**
 * Strategy 1: HTML Entity Replacement
 * Converts Unicode characters to HTML entities for safer rendering
 */
export const toHtmlEntities = (text: string): string => {
  if (!text) return text;
  
  let result = text;
  CHARACTER_MAPPINGS.forEach(mapping => {
    const regex = new RegExp(mapping.unicode, 'g');
    result = result.replace(regex, mapping.htmlEntity);
  });
  
  return result;
};

/**
 * Strategy 2: CSS Content Replacement
 * Returns CSS content values for use in pseudo-elements
 */
export const toCssContent = (text: string): string => {
  if (!text) return text;
  
  let result = text;
  CHARACTER_MAPPINGS.forEach(mapping => {
    const regex = new RegExp(mapping.unicode, 'g');
    result = result.replace(regex, mapping.cssContent);
  });
  
  return result;
};

/**
 * Strategy 3: Fallback Text Replacement
 * Converts special characters to ASCII approximations
 */
export const toFallbackText = (text: string): string => {
  if (!text) return text;
  
  let result = text;
  CHARACTER_MAPPINGS.forEach(mapping => {
    const regex = new RegExp(mapping.unicode, 'g');
    result = result.replace(regex, mapping.fallbackText);
  });
  
  return result;
};

/**
 * Strategy 4: Font-Safe Character Generation
 * Recreates characters using Unicode escape sequences
 */
export const toUnicodeEscapes = (text: string): string => {
  if (!text) return text;
  
  let result = text;
  CHARACTER_MAPPINGS.forEach(mapping => {
    const regex = new RegExp(mapping.unicode, 'g');
    result = result.replace(regex, String.fromCharCode(mapping.charCode));
  });
  
  return result;
};

/**
 * Smart character fixing - applies the best strategy based on context
 */
export const fixCharacterDisplay = (
  text: string, 
  strategy: 'auto' | 'html' | 'css' | 'fallback' | 'unicode' = 'auto'
): string => {
  if (!text) return text;
  
  // If no display issues detected, return as-is
  if (!hasCharacterDisplayIssue(text) && strategy === 'auto') {
    return text;
  }
  
  switch (strategy) {
    case 'html':
      return toHtmlEntities(text);
    case 'css':
      return toCssContent(text);
    case 'fallback':
      return toFallbackText(text);
    case 'unicode':
      return toUnicodeEscapes(text);
    case 'auto':
    default:
      // Auto-detect best strategy
      // First try HTML entities (safest for web)
      return toHtmlEntities(text);
  }
};

/**
 * Test character rendering support in current environment
 */
export const testCharacterSupport = (): { [key: string]: boolean } => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const results: { [key: string]: boolean } = {};
  
  if (!ctx) return results;
  
  canvas.width = 50;
  canvas.height = 50;
  
  CHARACTER_MAPPINGS.forEach(mapping => {
    // Draw the character
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '24px Arial';
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'middle';
    ctx.fillText(mapping.unicode, 10, 25);
    
    // Check if anything was drawn
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let hasPixels = false;
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 255 || imageData.data[i + 1] < 255 || imageData.data[i + 2] < 255) {
        hasPixels = true;
        break;
      }
    }
    
    results[mapping.unicode] = hasPixels;
  });
  
  return results;
};

/**
 * Generate CSS for character fixes using pseudo-elements
 */
export const generateCharacterFixCSS = (): string => {
  return CHARACTER_MAPPINGS.map(mapping => `
    .char-fix-${mapping.charCode.toString(16)}::before {
      content: "${mapping.cssContent}";
    }
  `).join('\n');
};

/**
 * Detect problematic characters in text and suggest fixes
 */
export const analyzeTextIssues = (text: string): {
  hasIssues: boolean;
  problematicChars: string[];
  suggestions: string[];
} => {
  const problematicChars: string[] = [];
  const suggestions: string[] = [];
  
  CHARACTER_MAPPINGS.forEach(mapping => {
    if (text.includes(mapping.unicode)) {
      // Test if this character might be problematic
      const testSupport = testCharacterSupport();
      if (!testSupport[mapping.unicode]) {
        problematicChars.push(mapping.unicode);
        suggestions.push(`Replace "${mapping.unicode}" with HTML entity "${mapping.htmlEntity}"`);
      }
    }
  });
  
  return {
    hasIssues: problematicChars.length > 0,
    problematicChars,
    suggestions
  };
};