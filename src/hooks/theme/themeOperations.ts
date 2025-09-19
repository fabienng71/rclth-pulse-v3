import { CustomTheme, defaultLightThemeColors, defaultDarkThemeColors, crimsonLightThemeColors, crimsonDarkThemeColors, wedgewoodLightThemeColors, wedgewoodDarkThemeColors, eucalyptusLightThemeColors, eucalyptusDarkThemeColors, retroLightThemeColors, retroDarkThemeColors } from './types';
import { saveCustomThemes, saveActiveCustomTheme } from './storage';
import { applyCustomTheme, resetCustomTheme, ensureThemeClassAndAttributes, applyCrimsonTheme, applyWedgewoodTheme, applyEucalyptusTheme, applyRetroTheme, applyOriginalTheme } from './themeApplier';

// Create a new custom theme
export const createCustomThemeOp = (
  theme: Omit<CustomTheme, 'id'>,
  customThemes: CustomTheme[]
): { newTheme: CustomTheme, updatedThemes: CustomTheme[] } => {
  const newTheme: CustomTheme = {
    ...theme,
    id: crypto.randomUUID(),
  };
  
  const updatedThemes = [...customThemes, newTheme];
  saveCustomThemes(updatedThemes);
  
  return { newTheme, updatedThemes };
};

// Update an existing custom theme
export const updateCustomThemeOp = (
  themeId: string,
  updates: Partial<Omit<CustomTheme, 'id'>>,
  customThemes: CustomTheme[],
  activeCustomThemeId: string | null
): { updatedTheme: CustomTheme | null, updatedThemes: CustomTheme[] } => {
  const themeIndex = customThemes.findIndex(t => t.id === themeId);
  if (themeIndex === -1) return { updatedTheme: null, updatedThemes: customThemes };
  
  const updatedTheme = { ...customThemes[themeIndex], ...updates };
  const updatedThemes = [...customThemes];
  updatedThemes[themeIndex] = updatedTheme;
  
  saveCustomThemes(updatedThemes);
  
  if (activeCustomThemeId === themeId) {
    applyCustomTheme(updatedTheme);
  }
  
  return { updatedTheme, updatedThemes };
};

// Delete a custom theme
export const deleteCustomThemeOp = (
  themeId: string,
  customThemes: CustomTheme[],
  activeCustomThemeId: string | null,
  setThemeFn: (theme: string) => void
): CustomTheme[] => {
  const filtered = customThemes.filter(t => t.id !== themeId);
  
  if (activeCustomThemeId === themeId) {
    saveActiveCustomTheme(null);
    resetCustomTheme();
    setTimeout(() => {
      setThemeFn('system');
      ensureThemeClassAndAttributes('system');
    }, 0);
  }
  
  saveCustomThemes(filtered);
  return filtered;
};

// Apply a custom theme
export const applyThemeOp = (
  themeId: string,
  customThemes: CustomTheme[],
  setThemeFn: (theme: string) => void
): Promise<boolean> => {
  return new Promise((resolve) => {
    const theme = customThemes.find(t => t.id === themeId);
    if (!theme) {
      resolve(false);
      return;
    }
    
    saveActiveCustomTheme(themeId);
    applyCustomTheme(theme);
    
    setTimeout(() => {
      setThemeFn('custom');
      resolve(true);
    }, 10);
  });
};

// Apply crimson theme
export const applyCrimsonThemeOp = (
  isDark: boolean,
  setThemeFn: (theme: string) => void
): Promise<boolean> => {
  return new Promise((resolve) => {
    saveActiveCustomTheme(null);
    applyCrimsonTheme(isDark);
    
    setTimeout(() => {
      setThemeFn('crimson');
      resolve(true);
    }, 10);
  });
};

// Apply wedgewood theme
export const applyWedgewoodThemeOp = (
  isDark: boolean,
  setThemeFn: (theme: string) => void
): Promise<boolean> => {
  return new Promise((resolve) => {
    saveActiveCustomTheme(null);
    applyWedgewoodTheme(isDark);
    
    setTimeout(() => {
      setThemeFn('wedgewood');
      resolve(true);
    }, 10);
  });
};

// Apply eucalyptus theme
export const applyEucalyptusThemeOp = (
  isDark: boolean,
  setThemeFn: (theme: string) => void
): Promise<boolean> => {
  return new Promise((resolve) => {
    saveActiveCustomTheme(null);
    applyEucalyptusTheme(isDark);
    
    setTimeout(() => {
      setThemeFn('eucalyptus');
      resolve(true);
    }, 10);
  });
};

// Apply retro theme
export const applyRetroThemeOp = (
  isDark: boolean,
  setThemeFn: (theme: string) => void
): Promise<boolean> => {
  return new Promise((resolve) => {
    saveActiveCustomTheme(null);
    applyRetroTheme(isDark);
    
    setTimeout(() => {
      setThemeFn('retro');
      resolve(true);
    }, 10);
  });
};

// Apply original theme
export const applyOriginalThemeOp = (
  setThemeFn: (theme: string) => void
): Promise<boolean> => {
  return new Promise((resolve) => {
    saveActiveCustomTheme(null);
    applyOriginalTheme();
    
    setTimeout(() => {
      setThemeFn('red');
      resolve(true);
    }, 10);
  });
};

// Get a template for a new theme
export const getThemeTemplateOp = (isDark: boolean, customThemesCount: number): Omit<CustomTheme, 'id'> => {
  return {
    name: `Custom Theme ${customThemesCount + 1}`,
    ...(isDark ? defaultDarkThemeColors : defaultLightThemeColors),
    isDark,
  };
};

// Get crimson theme template
export const getCrimsonThemeTemplateOp = (isDark: boolean): Omit<CustomTheme, 'id'> => {
  return {
    name: `Crimson ${isDark ? 'Dark' : 'Light'} Theme`,
    ...(isDark ? crimsonDarkThemeColors : crimsonLightThemeColors),
    isDark,
  };
};

// Get wedgewood theme template
export const getWedgewoodThemeTemplateOp = (isDark: boolean): Omit<CustomTheme, 'id'> => {
  return {
    name: `Wedgewood ${isDark ? 'Dark' : 'Light'} Theme`,
    ...(isDark ? wedgewoodDarkThemeColors : wedgewoodLightThemeColors),
    isDark,
  };
};

// Get eucalyptus theme template
export const getEucalyptusThemeTemplateOp = (isDark: boolean): Omit<CustomTheme, 'id'> => {
  return {
    name: `Eucalyptus ${isDark ? 'Dark' : 'Light'} Theme`,
    ...(isDark ? eucalyptusDarkThemeColors : eucalyptusLightThemeColors),
    isDark,
  };
};

// Get retro theme template
export const getRetroThemeTemplateOp = (isDark: boolean): Omit<CustomTheme, 'id'> => {
  return {
    name: `Retro ${isDark ? 'Dark' : 'Light'} Theme`,
    ...(isDark ? retroDarkThemeColors : retroLightThemeColors),
    isDark,
  };
};

// Export a theme
export const exportThemeOp = (themeId: string, customThemes: CustomTheme[]): string | null => {
  const theme = customThemes.find(t => t.id === themeId);
  if (!theme) return null;
  
  return JSON.stringify(theme);
};

// Import a theme
export const importThemeOp = (themeData: string, customThemes: CustomTheme[]): { importedTheme: CustomTheme | null, updatedThemes: CustomTheme[] } => {
  try {
    const theme = JSON.parse(themeData) as CustomTheme;
    if (!theme.id || !theme.name) throw new Error('Invalid theme data');
    
    const existingTheme = customThemes.find(t => t.id === theme.id);
    if (existingTheme) {
      theme.id = crypto.randomUUID();
    }
    
    const updatedThemes = [...customThemes, theme];
    saveCustomThemes(updatedThemes);
    
    return { importedTheme: theme, updatedThemes };
  } catch (e) {
    console.error('Error importing theme:', e);
    return { importedTheme: null, updatedThemes: customThemes };
  }
};
