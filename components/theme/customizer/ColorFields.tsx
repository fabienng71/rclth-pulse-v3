
import React from 'react';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '../ColorPicker';

export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  border: string;
}

interface ColorFieldsProps {
  colors: ThemeColors;
  onColorChange: (key: keyof ThemeColors, value: string) => void;
  disabled?: boolean;
}

export function ColorFields({ colors, onColorChange, disabled }: ColorFieldsProps) {
  return (
    <div className="grid gap-4 mt-2">
      <h3 className="text-sm font-medium">Colors</h3>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>Background</Label>
          <ColorPicker 
            color={colors.background} 
            onChange={(color) => onColorChange('background', color)}
            disabled={disabled}
          />
        </div>
        
        <div className="grid gap-2">
          <Label>Foreground (Text)</Label>
          <ColorPicker 
            color={colors.foreground} 
            onChange={(color) => onColorChange('foreground', color)}
            disabled={disabled}
          />
        </div>
        
        <div className="grid gap-2">
          <Label>Primary</Label>
          <ColorPicker 
            color={colors.primary} 
            onChange={(color) => onColorChange('primary', color)}
            disabled={disabled}
          />
        </div>
        
        <div className="grid gap-2">
          <Label>Secondary</Label>
          <ColorPicker 
            color={colors.secondary} 
            onChange={(color) => onColorChange('secondary', color)}
            disabled={disabled}
          />
        </div>
        
        <div className="grid gap-2">
          <Label>Accent</Label>
          <ColorPicker 
            color={colors.accent} 
            onChange={(color) => onColorChange('accent', color)}
            disabled={disabled}
          />
        </div>
        
        <div className="grid gap-2">
          <Label>Muted</Label>
          <ColorPicker 
            color={colors.muted} 
            onChange={(color) => onColorChange('muted', color)}
            disabled={disabled}
          />
        </div>
        
        <div className="grid gap-2">
          <Label>Border</Label>
          <ColorPicker 
            color={colors.border} 
            onChange={(color) => onColorChange('border', color)}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
