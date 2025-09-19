
import { useState, useEffect } from 'react';

interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
  };
  layout: {
    darkMode: boolean;
    compactMode: boolean;
  };
}

const defaultSettings: ThemeSettings = {
  colors: {
    primary: '#ef4444',
    secondary: '#6b7280',
    accent: '#f59e0b',
    background: '#ffffff',
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '16px',
  },
  layout: {
    darkMode: false,
    compactMode: false,
  },
};

export const useThemeSettings = () => {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let current: any = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Apply settings to CSS variables
      const root = document.documentElement;
      Object.entries(settings.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
      
      setHasUnsavedChanges(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = async () => {
    setIsLoading(true);
    try {
      setSettings(defaultSettings);
      setHasUnsavedChanges(true);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    updateSetting,
    saveSettings,
    resetToDefaults,
    isLoading,
    hasUnsavedChanges,
  };
};
