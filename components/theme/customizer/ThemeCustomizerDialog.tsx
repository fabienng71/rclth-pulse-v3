
import React, { memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomTheme } from '@/hooks/useTheme';

// Import our new components
import { ThemeNameField } from './ThemeNameField';
import { ThemeModeToggle } from './ThemeModeToggle';
import { ColorFields } from './ColorFields';
import { ThemePreview } from './ThemePreview';
import { useThemeCustomizerState } from './useThemeCustomizerState';

interface ThemeCustomizerDialogProps {
  open: boolean;
  onClose: () => void;
  editTheme?: CustomTheme;
}

// Memoize the ThemePreview component to prevent unnecessary re-renders
const MemoizedThemePreview = memo(ThemePreview);

export function ThemeCustomizerDialog({ open, onClose, editTheme }: ThemeCustomizerDialogProps) {
  const {
    themeName,
    setThemeName,
    isDarkMode,
    colors,
    rawColors,
    handleColorChange,
    handleToggleDarkMode,
    handleSave,
    handleReset,
    isSaving
  } = useThemeCustomizerState({ editTheme, onClose });

  return (
    <Dialog open={open} onOpenChange={() => !isSaving && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editTheme ? 'Edit Theme' : 'Create Custom Theme'}</DialogTitle>
          <DialogDescription>
            Customize colors to create your own theme. Changes will preview in real-time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <ThemeNameField 
            value={themeName} 
            onChange={setThemeName}
            disabled={isSaving}
          />
          
          <ThemeModeToggle 
            isDarkMode={isDarkMode} 
            onToggle={handleToggleDarkMode}
            disabled={isSaving}
          />
          
          <ColorFields 
            colors={rawColors} 
            onColorChange={handleColorChange}
            disabled={isSaving}
          />
          
          <MemoizedThemePreview 
            colors={colors}
            isDarkMode={isDarkMode}
          />
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>Reset</Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : 'Save Theme'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
