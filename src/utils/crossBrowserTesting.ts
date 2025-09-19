/**
 * Cross-browser character encoding testing utilities
 * Provides comprehensive testing across different browsers, platforms, and rendering contexts
 */

interface BrowserCapabilities {
  userAgent: string;
  vendor: string;
  platform: string;
  cookieEnabled: boolean;
  onLine: boolean;
  language: string;
  languages: readonly string[];
  maxTouchPoints: number;
  hardwareConcurrency: number;
}

interface CharacterTestResult {
  character: string;
  unicode: string;
  expected: string;
  actual: string;
  rendered: boolean;
  fallbackUsed: boolean;
  fontUsed: string;
  testPassed: boolean;
  pixelData?: Uint8ClampedArray;
}

interface CrossBrowserTestSuite {
  browserInfo: BrowserCapabilities;
  fontSupport: { [fontName: string]: boolean };
  characterTests: CharacterTestResult[];
  renderingEngine: string;
  unicodeSupport: 'full' | 'partial' | 'limited';
  recommendations: string[];
}

/**
 * Test characters that commonly cause encoding issues
 */
const TEST_CHARACTERS = [
  { char: '°', unicode: 'U+00B0', name: 'Degree Symbol', expected: '°' },
  { char: 'é', unicode: 'U+00E9', name: 'Latin Small Letter E with Acute', expected: 'é' },
  { char: 'è', unicode: 'U+00E8', name: 'Latin Small Letter E with Grave', expected: 'è' },
  { char: 'ñ', unicode: 'U+00F1', name: 'Latin Small Letter N with Tilde', expected: 'ñ' },
  { char: 'ç', unicode: 'U+00E7', name: 'Latin Small Letter C with Cedilla', expected: 'ç' },
  { char: '€', unicode: 'U+20AC', name: 'Euro Sign', expected: '€' },
  { char: '—', unicode: 'U+2014', name: 'Em Dash', expected: '—' },
  { char: '"', unicode: 'U+201C', name: 'Left Double Quotation Mark', expected: '"' },
  { char: '"', unicode: 'U+201D', name: 'Right Double Quotation Mark', expected: '"' },
  { char: '™', unicode: 'U+2122', name: 'Trade Mark Sign', expected: '™' }
];

/**
 * Fonts to test for character support
 */
const TEST_FONTS = [
  'Inter-Unicode',
  'Inter',
  'Noto Sans',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'Ubuntu',
  'DejaVu Sans',
  'Liberation Sans'
];

/**
 * Get comprehensive browser information
 */
export const getBrowserCapabilities = (): BrowserCapabilities => {
  return {
    userAgent: navigator.userAgent,
    vendor: navigator.vendor,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    language: navigator.language,
    languages: navigator.languages,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    hardwareConcurrency: navigator.hardwareConcurrency || 1
  };
};

/**
 * Detect rendering engine based on user agent
 */
export const detectRenderingEngine = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('webkit') && userAgent.includes('chrome') && !userAgent.includes('edg')) {
    return 'Blink (Chrome)';
  } else if (userAgent.includes('webkit') && userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return 'WebKit (Safari)';
  } else if (userAgent.includes('gecko') && userAgent.includes('firefox')) {
    return 'Gecko (Firefox)';
  } else if (userAgent.includes('edg')) {
    return 'Blink (Edge)';
  } else if (userAgent.includes('trident') || userAgent.includes('msie')) {
    return 'Trident (Internet Explorer)';
  }
  
  return 'Unknown';
};

/**
 * Test if a font properly renders a character using pixel comparison
 */
const testCharacterRendering = (character: string, fontFamily: string): CharacterTestResult => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return {
      character,
      unicode: `U+${character.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
      expected: character,
      actual: character,
      rendered: false,
      fallbackUsed: true,
      fontUsed: 'unknown',
      testPassed: false
    };
  }

  canvas.width = 100;
  canvas.height = 100;

  // Test with target font
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `48px ${fontFamily}`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(character, 50, 50);
  
  const targetImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Test with different fallback
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '48px serif';
  ctx.fillText(character, 50, 50);
  
  const fallbackImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Compare pixel data
  let pixelDifference = 0;
  for (let i = 0; i < targetImageData.data.length; i += 4) {
    if (targetImageData.data[i] !== fallbackImageData.data[i] ||
        targetImageData.data[i + 1] !== fallbackImageData.data[i + 1] ||
        targetImageData.data[i + 2] !== fallbackImageData.data[i + 2]) {
      pixelDifference++;
    }
  }
  
  const rendered = pixelDifference > 50; // Threshold for considering different
  
  // Test for missing glyph (often shows as empty box or ?)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `48px ${fontFamily}`;
  ctx.fillText('?', 50, 50);
  const questionMarkData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  let questionMarkSimilarity = 0;
  for (let i = 0; i < targetImageData.data.length; i += 4) {
    if (targetImageData.data[i] === questionMarkData.data[i] &&
        targetImageData.data[i + 1] === questionMarkData.data[i + 1] &&
        targetImageData.data[i + 2] === questionMarkData.data[i + 2]) {
      questionMarkSimilarity++;
    }
  }
  
  const fallbackUsed = questionMarkSimilarity > (canvas.width * canvas.height * 0.8);
  
  return {
    character,
    unicode: `U+${character.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
    expected: character,
    actual: character,
    rendered,
    fallbackUsed,
    fontUsed: fontFamily,
    testPassed: rendered && !fallbackUsed,
    pixelData: targetImageData.data
  };
};

/**
 * Test font availability using canvas width measurement
 */
const testFontAvailability = (fontName: string): boolean => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return false;
  
  const testText = 'mmmmmmmmmmlli';
  
  // Measure with target font + fallback
  ctx.font = `12px ${fontName}, monospace`;
  const targetWidth = ctx.measureText(testText).width;
  
  // Measure with just fallback
  ctx.font = '12px monospace';
  const fallbackWidth = ctx.measureText(testText).width;
  
  // Font is available if widths differ significantly
  return Math.abs(targetWidth - fallbackWidth) > 0.1;
};

/**
 * Run comprehensive cross-browser character testing
 */
export const runCrossBrowserTest = async (): Promise<CrossBrowserTestSuite> => {
  const browserInfo = getBrowserCapabilities();
  const renderingEngine = detectRenderingEngine();
  
  // Test font availability
  const fontSupport: { [fontName: string]: boolean } = {};
  for (const fontName of TEST_FONTS) {
    fontSupport[fontName] = testFontAvailability(fontName);
  }
  
  // Find best available font for testing
  const availableFonts = TEST_FONTS.filter(font => fontSupport[font]);
  const testFont = availableFonts[0] || 'Arial';
  
  // Test character rendering
  const characterTests: CharacterTestResult[] = [];
  for (const testChar of TEST_CHARACTERS) {
    const result = testCharacterRendering(testChar.char, testFont);
    characterTests.push(result);
  }
  
  // Determine Unicode support level
  const passedTests = characterTests.filter(test => test.testPassed).length;
  const totalTests = characterTests.length;
  const passRate = passedTests / totalTests;
  
  let unicodeSupport: 'full' | 'partial' | 'limited';
  if (passRate > 0.9) {
    unicodeSupport = 'full';
  } else if (passRate > 0.6) {
    unicodeSupport = 'partial';
  } else {
    unicodeSupport = 'limited';
  }
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (unicodeSupport === 'limited') {
    recommendations.push('Use HTML entities for special characters');
    recommendations.push('Implement fallback text for unsupported characters');
    recommendations.push('Consider using web fonts with extended character sets');
  }
  
  if (unicodeSupport === 'partial') {
    recommendations.push('Test critical characters before deployment');
    recommendations.push('Provide fallback fonts in CSS font stack');
    recommendations.push('Consider selective HTML entity replacement');
  }
  
  if (!fontSupport['Inter'] && !fontSupport['Noto Sans']) {
    recommendations.push('Load web fonts for consistent character rendering');
  }
  
  if (renderingEngine.includes('WebKit') && unicodeSupport !== 'full') {
    recommendations.push('Verify font loading on iOS/Safari devices');
  }
  
  if (renderingEngine.includes('Gecko') && passRate < 0.8) {
    recommendations.push('Test character rendering in Firefox specifically');
  }
  
  return {
    browserInfo,
    fontSupport,
    characterTests,
    renderingEngine,
    unicodeSupport,
    recommendations
  };
};

/**
 * Generate human-readable test report
 */
export const generateTestReport = (testSuite: CrossBrowserTestSuite): string => {
  const passedTests = testSuite.characterTests.filter(test => test.testPassed).length;
  const totalTests = testSuite.characterTests.length;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  let report = `=== Cross-Browser Character Encoding Test Report ===\n\n`;
  
  report += `🌐 Browser: ${testSuite.renderingEngine}\n`;
  report += `💻 Platform: ${testSuite.browserInfo.platform}\n`;
  report += `🔤 Unicode Support: ${testSuite.unicodeSupport.toUpperCase()}\n`;
  report += `✅ Pass Rate: ${passRate}% (${passedTests}/${totalTests})\n\n`;
  
  report += `📝 Font Availability:\n`;
  Object.entries(testSuite.fontSupport).forEach(([font, available]) => {
    report += `  ${available ? '✅' : '❌'} ${font}\n`;
  });
  
  report += `\n🔍 Character Test Results:\n`;
  testSuite.characterTests.forEach(test => {
    const status = test.testPassed ? '✅' : '❌';
    const fallback = test.fallbackUsed ? ' (fallback)' : '';
    report += `  ${status} ${test.character} (${test.unicode})${fallback}\n`;
  });
  
  if (testSuite.recommendations.length > 0) {
    report += `\n💡 Recommendations:\n`;
    testSuite.recommendations.forEach(rec => {
      report += `  • ${rec}\n`;
    });
  }
  
  return report;
};

/**
 * Export test results for further analysis
 */
export const exportTestResults = (testSuite: CrossBrowserTestSuite): Blob => {
  const data = JSON.stringify(testSuite, null, 2);
  return new Blob([data], { type: 'application/json' });
};

/**
 * Quick character encoding health check
 */
export const quickCharacterCheck = (text: string): {
  hasSpecialChars: boolean;
  problematicChars: string[];
  recommendations: string[];
} => {
  const specialChars = text.match(/[^\x00-\x7F]/g) || [];
  const uniqueSpecialChars = [...new Set(specialChars)];
  
  const problematicChars: string[] = [];
  const recommendations: string[] = [];
  
  // Common problematic characters
  const commonIssues = ['°', 'é', 'è', 'ñ', 'ç', '€', '—', '"', '"', '™'];
  
  uniqueSpecialChars.forEach(char => {
    if (commonIssues.includes(char)) {
      problematicChars.push(char);
    }
  });
  
  if (problematicChars.length > 0) {
    recommendations.push('Test character display across different browsers');
    recommendations.push('Consider HTML entity fallbacks for critical characters');
    recommendations.push('Verify font loading includes necessary Unicode ranges');
  }
  
  return {
    hasSpecialChars: uniqueSpecialChars.length > 0,
    problematicChars,
    recommendations
  };
};