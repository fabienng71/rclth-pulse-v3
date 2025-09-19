
import React, { memo } from 'react';

interface ThemePreviewProps {
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    border: string;
  };
  isDarkMode: boolean;
}

// Use memo to prevent unnecessary re-renders
export const ThemePreview = memo(function ThemePreview({ colors, isDarkMode }: ThemePreviewProps) {
  return (
    <div className="bg-muted p-4 rounded-lg mt-4">
      <h3 className="text-sm font-medium mb-2">Preview</h3>
      <div 
        className="p-4 rounded-md" 
        style={{ 
          backgroundColor: colors.background,
          color: colors.foreground,
          borderColor: colors.border,
          borderWidth: '1px',
        }}
      >
        <div className="flex flex-col space-y-2">
          <span>Text Color</span>
          <div 
            className="p-2 rounded-md" 
            style={{ 
              backgroundColor: colors.primary,
              color: isDarkMode ? '#f8fafc' : '#ffffff',
            }}
          >
            Primary Button
          </div>
          <div 
            className="p-2 rounded-md" 
            style={{ 
              backgroundColor: colors.secondary,
              color: isDarkMode ? '#f8fafc' : '#020817',
            }}
          >
            Secondary Element
          </div>
          <div 
            className="p-2 rounded-md" 
            style={{ 
              backgroundColor: colors.accent,
              color: isDarkMode ? '#f8fafc' : '#020817',
            }}
          >
            Accent Element
          </div>
          <div 
            className="p-2 rounded-md" 
            style={{ 
              backgroundColor: colors.muted,
              color: isDarkMode ? '#f8fafc' : '#020817',
              opacity: 0.7
            }}
          >
            Muted Element
          </div>
        </div>
      </div>
    </div>
  );
});
