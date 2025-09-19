
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ThemeModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ThemeModeToggle({ isDarkMode, onToggle, disabled }: ThemeModeToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="dark-mode">Dark Mode</Label>
      <Switch 
        id="dark-mode" 
        checked={isDarkMode} 
        onCheckedChange={onToggle} 
        disabled={disabled}
      />
    </div>
  );
}
