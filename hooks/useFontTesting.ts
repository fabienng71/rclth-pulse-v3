import { useState } from 'react';

interface FontLoadingStatus {
  fontName: string;
  loaded: boolean;
  supported: boolean;
  hasUnicode: boolean;
}

export const useFontTesting = () => {
  const [fontTests, setFontTests] = useState<FontLoadingStatus[]>([]);

  const testFonts = [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'Noto Sans',
    'sans-serif'
  ];

  const checkFontCharacterSupport = (fontFamily: string, character: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(false);
        return;
      }

      canvas.width = 50;
      canvas.height = 50;
      
      // Test with the specific font
      ctx.font = `24px ${fontFamily}`;
      ctx.fillStyle = 'black';
      ctx.textBaseline = 'middle';
      ctx.fillText(character, 10, 25);
      const imageData1 = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Clear and test with a fallback font
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '24px monospace'; // Known fallback
      ctx.fillText(character, 10, 25);
      const imageData2 = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Compare the images - if they're different, the font supports the character
      let different = false;
      for (let i = 0; i < imageData1.data.length; i += 4) {
        if (imageData1.data[i] !== imageData2.data[i] || 
            imageData1.data[i + 1] !== imageData2.data[i + 1] || 
            imageData1.data[i + 2] !== imageData2.data[i + 2]) {
          different = true;
          break;
        }
      }
      
      resolve(different);
    });
  };

  const checkFontLoading = async (): Promise<FontLoadingStatus[]> => {
    const results: FontLoadingStatus[] = [];
    
    for (const fontName of testFonts) {
      let loaded = false;
      let supported = false;
      let hasUnicode = false;

      try {
        // Check if font is loaded
        if ('fonts' in document) {
          const fontFace = new FontFace(fontName, `local("${fontName}")`);
          await fontFace.load();
          loaded = true;
        }
      } catch (e) {
        loaded = false;
      }

      // Test character support
      hasUnicode = await checkFontCharacterSupport(fontName, '°');

      // Simple font availability test
      const testCanvas = document.createElement('canvas');
      const ctx = testCanvas.getContext('2d');
      if (ctx) {
        ctx.font = `12px ${fontName}, monospace`;
        const width1 = ctx.measureText('mmmmmmmmmlli').width;
        ctx.font = '12px monospace';
        const width2 = ctx.measureText('mmmmmmmmmlli').width;
        supported = Math.abs(width1 - width2) > 0.1;
      }

      results.push({
        fontName,
        loaded,
        supported,
        hasUnicode
      });
    }

    return results;
  };

  const runFontTests = async () => {
    const fontStatus = await checkFontLoading();
    setFontTests(fontStatus);
    return fontStatus;
  };

  return {
    fontTests,
    setFontTests,
    runFontTests,
    checkFontCharacterSupport,
  };
};