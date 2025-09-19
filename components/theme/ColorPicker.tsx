
import React from 'react';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorPicker({ color, onChange, disabled }: ColorPickerProps) {
  return (
    <div className="flex gap-2 items-center">
      <div 
        className={`w-8 h-8 rounded-md border border-input overflow-hidden ${disabled ? 'opacity-50' : ''}`}
        style={{ backgroundColor: color }}
      >
        <input 
          type="color" 
          value={color} 
          onChange={(e) => onChange(e.target.value)} 
          className="w-10 h-10 opacity-0 cursor-pointer"
          disabled={disabled}
        />
      </div>
      
      <Input 
        value={color} 
        onChange={(e) => onChange(e.target.value)} 
        className="font-mono"
        maxLength={9}
        disabled={disabled}
      />
    </div>
  );
}
