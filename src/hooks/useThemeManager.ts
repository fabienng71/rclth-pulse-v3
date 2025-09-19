
import { useState } from 'react';

export const useThemeManager = () => {
  const [isLoading, setIsLoading] = useState(false);

  const exportTheme = async () => {
    setIsLoading(true);
    try {
      // Get current theme from CSS variables
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      const themeData = {
        colors: {
          primary: computedStyle.getPropertyValue('--primary').trim(),
          secondary: computedStyle.getPropertyValue('--secondary').trim(),
          accent: computedStyle.getPropertyValue('--accent').trim(),
          background: computedStyle.getPropertyValue('--background').trim(),
        },
        timestamp: new Date().toISOString(),
      };
      
      return themeData;
    } finally {
      setIsLoading(false);
    }
  };

  const importTheme = async (themeData: any) => {
    setIsLoading(true);
    try {
      const root = document.documentElement;
      
      if (themeData.colors) {
        Object.entries(themeData.colors).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value as string);
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exportTheme,
    importTheme,
    isLoading,
  };
};
