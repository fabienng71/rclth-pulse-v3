import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

// Import from our modules
import { 
  CustomTheme, 
  ThemeColor, 
  ThemeType, 
  defaultLightThemeColors, 
  defaultDarkThemeColors,
  USER_THEME_PREFERENCE_KEY
} from './theme/types';
import { 
  getCustomThemes, 
  getActiveCustomTheme, 
  saveActiveCustomTheme 
} from './theme/storage';
import { 
  applyCustomTheme, 
  resetCustomTheme,
  ensureThemeClassAndAttributes,
  applyCrimsonTheme,
  applyWedgewoodTheme,
  applyEucalyptusTheme,
  applyRetroTheme,
  applyOriginalTheme
} from './theme/themeApplier';
import {
  createCustomThemeOp,
  updateCustomThemeOp,
  deleteCustomThemeOp,
  applyThemeOp,
  applyCrimsonThemeOp,
  applyWedgewoodThemeOp,
  applyEucalyptusThemeOp,
  applyRetroThemeOp,
  applyOriginalThemeOp,
  getThemeTemplateOp,
  getCrimsonThemeTemplateOp,
  getWedgewoodThemeTemplateOp,
  getEucalyptusThemeTemplateOp,
  getRetroThemeTemplateOp,
  exportThemeOp,
  importThemeOp
} from './theme/themeOperations';
import { throttle } from './theme/utils';

// Re-export CustomTheme for use in components
export type { CustomTheme } from './theme/types';
export { defaultLightThemeColors, defaultDarkThemeColors } from './theme/types';

// Early theme restoration function - called before React hydration
function restoreThemeEarly() {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('=== THEME RESTORATION: Starting early theme restoration ===');
    
    const savedPreference = localStorage.getItem(USER_THEME_PREFERENCE_KEY);
    if (!savedPreference) {
      console.log('=== THEME RESTORATION: No saved preference found ===');
      return;
    }

    const preference = JSON.parse(savedPreference);
    console.log('=== THEME RESTORATION: Found saved preference:', preference);
    
    if (preference.type === 'custom' && preference.themeId) {
      const customThemes = getCustomThemes();
      const activeTheme = customThemes.find(t => t.id === preference.themeId);
      if (activeTheme) {
        console.log('=== THEME RESTORATION: Applying custom theme:', activeTheme.name);
        applyCustomTheme(activeTheme);
        document.documentElement.setAttribute('data-theme', 'custom');
      }
    } else if (preference.type === 'crimson') {
      console.log('=== THEME RESTORATION: Applying crimson theme ===');
      applyCrimsonTheme(preference.isDark || false);
    } else if (preference.type === 'wedgewood') {
      console.log('=== THEME RESTORATION: Applying wedgewood theme ===');
      applyWedgewoodTheme(preference.isDark || false);
    } else if (preference.type === 'eucalyptus') {
      console.log('=== THEME RESTORATION: Applying eucalyptus theme ===');
      applyEucalyptusTheme(preference.isDark || false);
    } else if (preference.type === 'retro') {
      console.log('=== THEME RESTORATION: Applying retro theme ===');
      applyRetroTheme(preference.isDark || false);
    } else if (preference.type === 'original') {
      console.log('=== THEME RESTORATION: Applying original theme ===');
      applyOriginalTheme();
    } else {
      console.log('=== THEME RESTORATION: Applying built-in theme:', preference.type);
      ensureThemeClassAndAttributes(preference.type);
    }
  } catch (error) {
    console.error('=== THEME RESTORATION: Error during early restoration:', error);
  }
}

// Call early restoration immediately if we're in the browser
if (typeof window !== 'undefined') {
  restoreThemeEarly();
}

export function useTheme() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
  const [activeCustomThemeId, setActiveCustomThemeId] = useState<string | null>(null);
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);
  
  // Handle mounting and load saved preferences
  useEffect(() => {
    console.log('=== useTheme: Effect running, setting mounted to true ===');
    setMounted(true);
    
    // Load custom themes immediately
    const themes = getCustomThemes();
    setCustomThemes(themes);
    
    // Restore saved theme preferences synchronously
    const savedPreference = localStorage.getItem(USER_THEME_PREFERENCE_KEY);
    if (savedPreference) {
      try {
        const preference = JSON.parse(savedPreference);
        console.log('=== useTheme: Restoring saved theme preference:', preference);
        
        if (preference.type === 'custom' && preference.themeId) {
          const activeThemeId = getActiveCustomTheme();
          if (activeThemeId) {
            setActiveCustomThemeId(activeThemeId);
            // Theme already applied in early restoration, just sync state
            setTheme('custom');
          }
        } else if (preference.type === 'crimson') {
          // Theme already applied in early restoration, just sync state
          setTheme('crimson');
        } else if (preference.type === 'wedgewood') {
          // Theme already applied in early restoration, just sync state
          setTheme('wedgewood');
        } else if (preference.type === 'eucalyptus') {
          // Theme already applied in early restoration, just sync state
          setTheme('eucalyptus');
        } else if (preference.type === 'retro') {
          // Theme already applied in early restoration, just sync state
          setTheme('retro');
        } else if (preference.type === 'original') {
          // Theme already applied in early restoration, just sync state
          setTheme('red');
        } else {
          // For built-in themes, sync with next-themes
          setTheme(preference.type);
        }
      } catch (error) {
        console.error('=== useTheme: Error restoring theme preference:', error);
      }
    }
  }, [setTheme]);
  
  // Memoized computed values
  const isDarkMode = useMemo(() => resolvedTheme === 'dark', [resolvedTheme]);
  const isColorTheme = useMemo(() => 
    theme !== 'light' && theme !== 'dark' && theme !== 'system' && theme !== 'custom',
    [theme]
  );
  const isActiveColorTheme = useCallback((color: ThemeColor) => theme === color, [theme]);
  const activeCustomTheme = useMemo(() => 
    customThemes.find(t => t.id === activeCustomThemeId),
    [customThemes, activeCustomThemeId]
  );

  // Enhanced theme toggle
  const toggleMode = useCallback(throttle(() => {
    if (resolvedTheme === 'dark') {
      setActiveCustomThemeId(null);
      saveActiveCustomTheme(null);
      resetCustomTheme();
      setTimeout(() => {
        setTheme('light');
        ensureThemeClassAndAttributes('light');
        // Save preference
        localStorage.setItem(USER_THEME_PREFERENCE_KEY, JSON.stringify({ type: 'light' }));
      }, 10);
    } else {
      setActiveCustomThemeId(null);
      saveActiveCustomTheme(null);
      resetCustomTheme();
      setTimeout(() => {
        setTheme('dark');
        ensureThemeClassAndAttributes('dark');
        // Save preference
        localStorage.setItem(USER_THEME_PREFERENCE_KEY, JSON.stringify({ type: 'dark' }));
      }, 10);
    }
  }, 300), [resolvedTheme, setTheme]);
  
  // Set color theme
  const setColorTheme = useCallback(throttle((color: ThemeColor) => {
    setActiveCustomThemeId(null);
    saveActiveCustomTheme(null);
    resetCustomTheme();
    setTimeout(() => {
      setTheme(color);
      ensureThemeClassAndAttributes(color);
      // Save preference
      localStorage.setItem(USER_THEME_PREFERENCE_KEY, JSON.stringify({ type: color }));
    }, 10);
  }, 300), [setTheme]);

  // Set specific theme with proper reset
  const setSpecificTheme = useCallback(throttle((themeType: ThemeType) => {
    if (themeType === 'custom') return;
    
    setActiveCustomThemeId(null);
    saveActiveCustomTheme(null);
    resetCustomTheme();
    
    setTimeout(() => {
      setTheme(themeType);
      ensureThemeClassAndAttributes(themeType);
      // Save preference
      localStorage.setItem(USER_THEME_PREFERENCE_KEY, JSON.stringify({ type: themeType }));
    }, 10);
  }, 300), [setTheme]);
  
  // Apply crimson theme
  const applyCrimsonThemeFunc = useCallback(async (isDark: boolean = false): Promise<boolean> => {
    if (isApplyingTheme) return false;
    
    setIsApplyingTheme(true);
    setActiveCustomThemeId(null);
    
    try {
      const result = await applyCrimsonThemeOp(isDark, setTheme);
      // Save user preference
      localStorage.setItem(USER_THEME_PREFERENCE_KEY, JSON.stringify({ type: 'crimson', isDark }));
      return result;
    } finally {
      setTimeout(() => {
        setIsApplyingTheme(false);
      }, 300);
    }
  }, [isApplyingTheme, setTheme]);

  // Apply wedgewood theme
  const applyWedgewoodThemeFunc = useCallback(async (isDark: boolean = false): Promise<boolean> => {
    if (isApplyingTheme) return false;
    
    setIsApplyingTheme(true);
    setActiveCustomThemeId(null);
    
    try {
      const result = await applyWedgewoodThemeOp(isDark, setTheme);
      // Save user preference
      localStorage.setItem(USER_THEME_PREFERENCE_KEY, JSON.stringify({ type: 'wedgewood', isDark }));
      return result;
    } finally {
      setTimeout(() => {
        setIsApplyingTheme(false);
      }, 300);
    }
  }, [isApplyingTheme, setTheme]);

  // Apply eucalyptus theme
  const applyEucalyptusThemeFunc = useCallback(async (isDark: boolean = false): Promise<boolean> => {
    if (isApplyingTheme) return false;
    
    setIsApplyingTheme(true);
    setActiveCustomThemeId(null);
    
    try {
      const result = await applyEucalyptusThemeOp(isDark, setTheme);
      // Save user preference
      localStorage.setItem(USER_THEME_PREFERENCE_KEY, JSON.stringify({ type: 'eucalyptus', isDark }));
      return result;
    } finally {
      setTimeout(() => {
        setIsApplyingTheme(false);
      }, 300);
    }
  }, [isApplyingTheme, setTheme]);

  // Apply retro theme
  const applyRetroThemeFunc = useCallback(async (isDark: boolean = false): Promise<boolean> => {
    if (isApplyingTheme) return false;
    
    setIsApplyingTheme(true);
    setActiveCustomThemeId(null);
    
    try {
      const result = await applyRetroThemeOp(isDark, setTheme);
      // Save user preference
      localStorage.setItem(USER_THEME_PREFERENCE_KEY, JSON.stringify({ type: 'retro', isDark }));
      return result;
    } finally {
      setTimeout(() => {
        setIsApplyingTheme(false);
      }, 300);
    }
  }, [isApplyingTheme, setTheme]);

  // Apply original theme
  const applyOriginalThemeFunc = useCallback(async (): Promise<boolean> => {
    if (isApplyingTheme) return false;
    
    setIsApplyingTheme(true);
    setActiveCustomThemeId(null);
    
    try {
      const result = await applyOriginalThemeOp(setTheme);
      // Save user preference
      localStorage.setItem(USER_THEME_PREFERENCE_KEY, JSON.stringify({ type: 'original' }));
      return result;
    } finally {
      setTimeout(() => {
        setIsApplyingTheme(false);
      }, 300);
    }
  }, [isApplyingTheme, setTheme]);
  
  // Custom theme management functions
  const createCustomTheme = useCallback((theme: Omit<CustomTheme, 'id'>): CustomTheme => {
    const { newTheme, updatedThemes } = createCustomThemeOp(theme, customThemes);
    setCustomThemes(updatedThemes);
    return newTheme;
  }, [customThemes]);
  
  const updateCustomTheme = useCallback((themeId: string, updates: Partial<Omit<CustomTheme, 'id'>>): CustomTheme | null => {
    const { updatedTheme, updatedThemes } = updateCustomThemeOp(themeId, updates, customThemes, activeCustomThemeId);
    setCustomThemes(updatedThemes);
    return updatedTheme;
  }, [customThemes, activeCustomThemeId]);
  
  const deleteCustomTheme = useCallback((themeId: string): boolean => {
    const updatedThemes = deleteCustomThemeOp(themeId, customThemes, activeCustomThemeId, setTheme);
    setCustomThemes(updatedThemes);
    return true;
  }, [customThemes, activeCustomThemeId, setTheme]);
  
  const applyTheme = useCallback(async (themeId: string): Promise<boolean> => {
    if (isApplyingTheme) return false;
    
    setIsApplyingTheme(true);
    
    try {
      setActiveCustomThemeId(themeId);
      const result = await applyThemeOp(themeId, customThemes, setTheme);
      // Save user preference
      localStorage.setItem(USER_THEME_PREFERENCE_KEY, JSON.stringify({ type: 'custom', themeId }));
      return result;
    } finally {
      setTimeout(() => {
        setIsApplyingTheme(false);
      }, 300);
    }
  }, [isApplyingTheme, customThemes, setTheme]);
  
  // Get theme templates
  const getThemeTemplate = useCallback((isDark: boolean): Omit<CustomTheme, 'id'> => {
    return getThemeTemplateOp(isDark, customThemes.length);
  }, [customThemes.length]);

  const getCrimsonThemeTemplate = useCallback((isDark: boolean): Omit<CustomTheme, 'id'> => {
    return getCrimsonThemeTemplateOp(isDark);
  }, []);

  const getWedgewoodThemeTemplate = useCallback((isDark: boolean): Omit<CustomTheme, 'id'> => {
    return getWedgewoodThemeTemplateOp(isDark);
  }, []);

  const getEucalyptusThemeTemplate = useCallback((isDark: boolean): Omit<CustomTheme, 'id'> => {
    return getEucalyptusThemeTemplateOp(isDark);
  }, []);

  const getRetroThemeTemplate = useCallback((isDark: boolean): Omit<CustomTheme, 'id'> => {
    return getRetroThemeTemplateOp(isDark);
  }, []);

  // Import/Export functions
  const exportTheme = useCallback((themeId: string): string | null => {
    return exportThemeOp(themeId, customThemes);
  }, [customThemes]);
  
  const importTheme = useCallback((themeData: string): CustomTheme | null => {
    const { importedTheme, updatedThemes } = importThemeOp(themeData, customThemes);
    setCustomThemes(updatedThemes);
    return importedTheme;
  }, [customThemes]);

  return {
    theme,
    setTheme: setSpecificTheme,
    isDarkMode,
    isColorTheme,
    isActiveColorTheme,
    resolvedTheme,
    systemTheme,
    mounted,
    toggleMode,
    setColorTheme,
    
    // Enhanced theme functions
    applyCrimsonTheme: applyCrimsonThemeFunc,
    applyWedgewoodTheme: applyWedgewoodThemeFunc,
    applyEucalyptusTheme: applyEucalyptusThemeFunc,
    applyRetroTheme: applyRetroThemeFunc,
    applyOriginalTheme: applyOriginalThemeFunc,
    
    // Custom theme management
    customThemes,
    activeCustomTheme,
    activeCustomThemeId,
    createCustomTheme,
    updateCustomTheme,
    deleteCustomTheme,
    applyTheme,
    getThemeTemplate,
    getCrimsonThemeTemplate,
    getWedgewoodThemeTemplate,
    getEucalyptusThemeTemplate,
    getRetroThemeTemplate,
    exportTheme,
    importTheme,
    isApplyingTheme,
  };
}
