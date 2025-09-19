
import React, { useEffect } from 'react';

// Component to ensure the app initialization is marked complete and handle early theme restoration
export const AppInitializer = () => {
  useEffect(() => {
    console.log('=== APP INITIALIZER: Component mounted ===');
    
    // Ensure theme is properly restored before marking app as initialized
    const ensureThemeRestoration = () => {
      try {
        const USER_THEME_PREFERENCE_KEY = 'user-theme-preference';
        const savedPreference = localStorage.getItem(USER_THEME_PREFERENCE_KEY);
        
        if (savedPreference) {
          const preference = JSON.parse(savedPreference);
          console.log('=== APP INITIALIZER: Ensuring theme is applied:', preference);
          
          // Make sure the document has the correct theme attributes
          if (preference.type === 'custom') {
            document.documentElement.setAttribute('data-theme', 'custom');
          } else if (preference.type === 'crimson') {
            document.documentElement.setAttribute('data-theme', 'crimson');
            if (preference.isDark) {
              document.documentElement.classList.add('dark');
            }
          } else if (preference.type === 'wedgewood') {
            document.documentElement.setAttribute('data-theme', 'wedgewood');
            if (preference.isDark) {
              document.documentElement.classList.add('dark');
            }
          } else if (preference.type === 'original') {
            document.documentElement.removeAttribute('data-theme');
          } else if (preference.type === 'dark') {
            document.documentElement.classList.add('dark');
          } else if (preference.type === 'light') {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch (error) {
        console.error('=== APP INITIALIZER: Error ensuring theme restoration:', error);
      }
    };
    
    // Ensure theme is applied
    ensureThemeRestoration();
    
    // Mark the app as initialized when this component mounts
    console.log('=== APP INITIALIZER: Marking app as initialized ===');
    
    if (typeof window !== 'undefined' && window.markAppInitialized) {
      window.markAppInitialized();
    }
  }, []);

  return null;
};
