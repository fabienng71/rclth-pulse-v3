import { useState, useCallback, useEffect, useRef } from 'react';
import { CustomTheme, useTheme } from '@/hooks/useTheme';
import { toast } from '@/hooks/use-toast';
import { ThemeColors } from './ColorFields';
import { useDebounce } from '@/hooks/useDebounce';

interface ThemeCustomizerStateProps {
  editTheme?: CustomTheme;
  onClose: () => void;
}

export function useThemeCustomizerState({ editTheme, onClose }: ThemeCustomizerStateProps) {
  const { 
    createCustomTheme, 
    updateCustomTheme, 
    getThemeTemplate, 
    applyTheme,
    isApplyingTheme
  } = useTheme();
  
  // Prevent multiple saves 
  const isSavingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [themeName, setThemeName] = useState(editTheme?.name || 'My Custom Theme');
  const [isDarkMode, setIsDarkMode] = useState(editTheme?.isDark || false);
  
  // Create initial colors with defaults based on mode
  const initialColors: ThemeColors = {
    background: editTheme?.background || (isDarkMode ? '#1a0f0f' : '#ffffff'),
    foreground: editTheme?.foreground || (isDarkMode ? '#f8fafc' : '#020817'),
    primary: editTheme?.primary || '#e11d48',
    secondary: editTheme?.secondary || (isDarkMode ? '#1e293b' : '#f1f5f9'),
    accent: editTheme?.accent || (isDarkMode ? '#1e293b' : '#f1f5f9'),
    muted: editTheme?.muted || (isDarkMode ? '#1e293b' : '#f1f5f9'),
    border: editTheme?.border || (isDarkMode ? '#1e293b' : '#e2e8f0'),
  };
  
  const [colors, setColors] = useState<ThemeColors>(initialColors);
  
  // Create a debounced version of colors for real-time preview
  // that doesn't cause too many re-renders
  const debouncedColors = useDebounce(colors, 300);

  // Reset state if editTheme changes
  useEffect(() => {
    if (editTheme) {
      setThemeName(editTheme.name);
      setIsDarkMode(editTheme.isDark);
      setColors({
        background: editTheme.background,
        foreground: editTheme.foreground,
        primary: editTheme.primary,
        secondary: editTheme.secondary,
        accent: editTheme.accent,
        muted: editTheme.muted,
        border: editTheme.border
      });
    }
  }, [editTheme]);

  // Memoize the color change handler to prevent creating new functions on every render
  const handleColorChange = useCallback((key: keyof ThemeColors, value: string) => {
    setColors(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Optimize the dark mode toggle to batch updates
  const handleToggleDarkMode = useCallback(() => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Get theme template for the new mode to use as a base
    const template = getThemeTemplate(newMode);
    
    // Update colors based on mode switch, keeping the primary color
    setColors(prev => ({
      ...prev,
      background: template.background,
      foreground: template.foreground,
      secondary: template.secondary,
      accent: template.accent,
      muted: template.muted,
      border: template.border,
    }));
  }, [isDarkMode, getThemeTemplate]);

  // Optimize the save handler with better error handling and state management
  const handleSave = useCallback(async () => {
    // Prevent multiple saves or saving during theme application
    if (isSavingRef.current || isApplyingTheme) return;
    
    isSavingRef.current = true;
    setIsSaving(true);
    
    const themeData = {
      name: themeName,
      isDark: isDarkMode,
      ...colors
    };
    
    try {
      if (editTheme) {
        // Update existing theme
        const updated = updateCustomTheme(editTheme.id, themeData);
        if (updated) {
          toast({
            title: "Theme updated",
            description: "Your custom theme has been updated",
          });
        }
      } else {
        // Create new theme
        const newTheme = createCustomTheme(themeData);
        await applyTheme(newTheme.id);
        toast({
          title: "Theme created",
          description: "Your custom theme has been created and applied",
        });
      }
      
      // Close the customizer after a short delay to allow for visual feedback
      setTimeout(() => {
        onClose();
        // Reset the saving state after the dialog closes
        setTimeout(() => {
          isSavingRef.current = false;
          setIsSaving(false);
        }, 300);
      }, 300);
    } catch (error) {
      console.error("Error saving theme:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your theme",
        variant: "destructive"
      });
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [
    themeName, 
    isDarkMode, 
    colors, 
    editTheme, 
    createCustomTheme, 
    updateCustomTheme, 
    applyTheme, 
    onClose, 
    isApplyingTheme
  ]);

  // Reset to theme defaults based on current dark/light mode
  const handleReset = useCallback(() => {
    const template = getThemeTemplate(isDarkMode);
    setThemeName(editTheme?.name || template.name);
    setColors({
      background: template.background,
      foreground: template.foreground,
      primary: template.primary,
      secondary: template.secondary,
      accent: template.accent,
      muted: template.muted,
      border: template.border,
    });
  }, [isDarkMode, getThemeTemplate, editTheme]);

  return {
    themeName,
    setThemeName,
    isDarkMode,
    colors: debouncedColors, // Use debounced colors for preview
    rawColors: colors, // Use raw colors for editing
    handleColorChange,
    handleToggleDarkMode,
    handleSave,
    handleReset,
    isSaving
  };
}
