import { useState, useRef } from 'react';

interface CharacterAnalysis {
  char: string;
  code: number;
  hex: string;
  name: string;
  inFont: boolean;
  rendersCorrectly: boolean;
  domContent: string;
  displayedAs: string;
}

export const useCharacterAnalysis = () => {
  const [characterAnalysis, setCharacterAnalysis] = useState<CharacterAnalysis[]>([]);
  const testDivRef = useRef<HTMLDivElement>(null);

  const getCharacterName = (code: number): string => {
    const names: Record<number, string> = {
      0x00B0: 'Degree Symbol',
      0x00E9: 'Latin Small Letter E with Acute',
      0x00E8: 'Latin Small Letter E with Grave',
      0x00E0: 'Latin Small Letter A with Grave',
      0x00E7: 'Latin Small Letter C with Cedilla',
      0x00F1: 'Latin Small Letter N with Tilde',
      0x20AC: 'Euro Sign',
    };
    return names[code] || `Unicode U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
  };

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

  const analyzeCharacters = async (text: string): Promise<CharacterAnalysis[]> => {
    const analyses: CharacterAnalysis[] = [];
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const code = char.charCodeAt(0);
      
      if (code > 127) { // Non-ASCII characters
        // Test DOM rendering
        if (testDivRef.current) {
          testDivRef.current.textContent = char;
          const computedStyle = window.getComputedStyle(testDivRef.current);
          const fontFamily = computedStyle.fontFamily;
          
          // Get actual displayed content
          const displayedAs = testDivRef.current.textContent || '';
          const rendersCorrectly = displayedAs === char;
          
          analyses.push({
            char,
            code,
            hex: code.toString(16).toUpperCase().padStart(4, '0'),
            name: getCharacterName(code),
            inFont: await checkFontCharacterSupport(fontFamily, char),
            rendersCorrectly,
            domContent: char,
            displayedAs
          });
        }
      }
    }
    
    setCharacterAnalysis(analyses);
    return analyses;
  };

  return {
    characterAnalysis,
    setCharacterAnalysis,
    testDivRef,
    analyzeCharacters,
    getCharacterName,
  };
};