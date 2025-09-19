import { useEffect } from 'react';
import { 
  applyPlatformFontOptimizations, 
  detectPlatform, 
  getPlatformRecommendations,
  runFontCompatibilityTest
} from '@/utils/platformFontDetection';

/**
 * Hook to automatically apply platform-specific font optimizations
 * and provide character rendering recommendations
 */
export const usePlatformFontOptimization = () => {
  useEffect(() => {
    // Apply platform-specific font optimizations on mount
    const initializeFontOptimizations = async () => {
      try {
        // Detect platform and apply optimizations
        applyPlatformFontOptimizations();
        
        const platformInfo = detectPlatform();
        const recommendations = getPlatformRecommendations();
        
        console.log('🎨 Platform Font Optimization Applied:', {
          platform: platformInfo.platform,
          browserEngine: platformInfo.browserEngine,
          recommendedStrategy: platformInfo.fallbackStrategy,
          unicodeSupport: platformInfo.unicodeSupport,
          fontFamily: recommendations.fontFamily
        });
        
        // Run compatibility test in background
        if (process.env.NODE_ENV === 'development') {
          runFontCompatibilityTest().then(results => {
            console.log('🔤 Font Compatibility Test Results:', results);
          });
        }
        
      } catch (error) {
        console.warn('Failed to apply platform font optimizations:', error);
      }
    };

    initializeFontOptimizations();
  }, []);

  // Return platform info for components that need it
  const platformInfo = detectPlatform();
  const recommendations = getPlatformRecommendations();
  
  return {
    platform: platformInfo.platform,
    browserEngine: platformInfo.browserEngine,
    recommendations,
    shouldUseWebFonts: recommendations.useWebFonts,
    shouldUseHtmlEntities: recommendations.useHtmlEntities,
    shouldUseFallbackText: recommendations.useFallbackText,
    optimalFontFamily: recommendations.fontFamily
  };
};