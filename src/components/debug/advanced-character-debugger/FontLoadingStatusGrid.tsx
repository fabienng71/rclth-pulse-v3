import React from 'react';
import { Badge } from '@/components/ui/badge';

interface FontLoadingStatus {
  fontName: string;
  loaded: boolean;
  supported: boolean;
  hasUnicode: boolean;
}

interface FontLoadingStatusGridProps {
  fontTests: FontLoadingStatus[];
}

export const FontLoadingStatusGrid: React.FC<FontLoadingStatusGridProps> = ({ fontTests }) => {
  if (fontTests.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">🔤 Font Loading Status</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {fontTests.map((font) => (
          <div key={font.fontName} className="p-3 border rounded">
            <div className="font-medium text-sm">{font.fontName}</div>
            <div className="space-y-1 text-xs">
              <Badge variant={font.loaded ? "default" : "destructive"}>
                {font.loaded ? "Loaded" : "Not Loaded"}
              </Badge>
              <Badge variant={font.supported ? "default" : "secondary"}>
                {font.supported ? "Available" : "Fallback"}
              </Badge>
              <Badge variant={font.hasUnicode ? "default" : "destructive"}>
                {font.hasUnicode ? "Has °" : "No °"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};