
import React from 'react';
import { CustomTheme } from '@/hooks/useTheme';
import { ThemeCustomizerDialog } from './customizer/ThemeCustomizerDialog';

interface ThemeCustomizerProps {
  open: boolean;
  onClose: () => void;
  editTheme?: CustomTheme;
}

export function ThemeCustomizer({ open, onClose, editTheme }: ThemeCustomizerProps) {
  // This component is now just a simple wrapper around ThemeCustomizerDialog
  // This allows us to maintain backward compatibility with existing code
  return (
    <ThemeCustomizerDialog
      open={open}
      onClose={onClose}
      editTheme={editTheme}
    />
  );
}
