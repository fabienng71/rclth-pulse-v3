
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ThemeNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ThemeNameField({ value, onChange, disabled }: ThemeNameFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="theme-name">Theme Name</Label>
      <Input 
        id="theme-name" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder="My Custom Theme"
        disabled={disabled}
      />
    </div>
  );
}
