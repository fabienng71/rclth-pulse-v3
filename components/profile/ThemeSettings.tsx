import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { Palette, Sparkles, Waves, Leaf, Clock, RotateCcw, Settings, Eye } from 'lucide-react';
import { toast } from 'sonner';

export const ThemeSettings = () => {
  const { user } = useAuthStore();
  const { 
    theme, 
    applyCrimsonTheme, 
    applyWedgewoodTheme,
    applyEucalyptusTheme,
    applyRetroTheme,
    applyOriginalTheme, 
    setTheme,
    isDarkMode,
    isApplyingTheme
  } = useTheme();
  
  const [isUpdating, setIsUpdating] = useState(false);
  

  const handleApplyCrimsonTheme = async () => {
    setIsUpdating(true);
    try {
      const success = await applyCrimsonTheme(isDarkMode);
      if (success) {
        toast.success('Crimson theme applied successfully!');
      } else {
        toast.error('Failed to apply crimson theme');
      }
    } catch (error) {
      toast.error('Error applying crimson theme');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApplyWedgewoodTheme = async () => {
    setIsUpdating(true);
    try {
      const success = await applyWedgewoodTheme(isDarkMode);
      if (success) {
        toast.success('Wedgewood theme applied successfully!');
      } else {
        toast.error('Failed to apply wedgewood theme');
      }
    } catch (error) {
      toast.error('Error applying wedgewood theme');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApplyEucalyptusTheme = async () => {
    setIsUpdating(true);
    try {
      const success = await applyEucalyptusTheme(isDarkMode);
      if (success) {
        toast.success('Eucalyptus theme applied successfully!');
      } else {
        toast.error('Failed to apply eucalyptus theme');
      }
    } catch (error) {
      toast.error('Error applying eucalyptus theme');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApplyRetroTheme = async () => {
    setIsUpdating(true);
    try {
      const success = await applyRetroTheme(isDarkMode);
      if (success) {
        toast.success('Retro theme applied successfully!');
      } else {
        toast.error('Failed to apply retro theme');
      }
    } catch (error) {
      toast.error('Error applying retro theme');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApplyOriginalTheme = async () => {
    setIsUpdating(true);
    try {
      const success = await applyOriginalTheme();
      if (success) {
        toast.success('Original theme restored successfully!');
      } else {
        toast.error('Failed to restore original theme');
      }
    } catch (error) {
      toast.error('Error restoring original theme');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSetSystemTheme = () => {
    setTheme('system');
    toast.success('System theme applied');
  };

  const currentThemeInfo = () => {
    switch (theme) {
      case 'crimson':
        return { name: 'Crimson Theme', color: 'bg-crimson-600', variant: 'default' as const };
      case 'wedgewood':
        return { name: 'Wedgewood Theme', color: 'bg-wedgewood-500', variant: 'default' as const };
      case 'eucalyptus':
        return { name: 'Eucalyptus Theme', color: 'bg-eucalyptus-500', variant: 'default' as const };
      case 'retro':
        return { name: 'Retro Theme', color: 'bg-retro-500', variant: 'default' as const };
      case 'red':
        return { name: 'Original Red Theme', color: 'bg-red-600', variant: 'secondary' as const };
      case 'blue':
        return { name: 'Blue Theme', color: 'bg-blue-600', variant: 'outline' as const };
      case 'purple':
        return { name: 'Purple Theme', color: 'bg-purple-600', variant: 'outline' as const };
      case 'light':
        return { name: 'Light Mode', color: 'bg-gray-200', variant: 'outline' as const };
      case 'dark':
        return { name: 'Dark Mode', color: 'bg-gray-800', variant: 'outline' as const };
      case 'system':
        return { name: 'System Theme', color: 'bg-gradient-to-r from-gray-400 to-gray-600', variant: 'outline' as const };
      case 'custom':
        return { name: 'Custom Theme', color: 'bg-gradient-to-r from-primary to-primary/80', variant: 'default' as const };
      default:
        return { name: 'Unknown Theme', color: 'bg-gray-500', variant: 'secondary' as const };
    }
  };

  const themeInfo = currentThemeInfo();

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-primary" />
          <span>Theme Settings</span>
        </CardTitle>
        <CardDescription>
          Customize your interface with beautiful theme options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Theme Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Current Theme</h4>
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${themeInfo.color}`} />
              <Badge variant={themeInfo.variant} className="text-xs">
                {themeInfo.name}
              </Badge>
            </div>
          </div>
          {isDarkMode && (
            <p className="text-xs text-muted-foreground">
              Currently in dark mode
            </p>
          )}
        </div>

        <Separator />

        {/* Theme Actions */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Theme Actions</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Crimson Theme */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 text-center hover:shadow-medium transition-smooth border-crimson-200 hover:border-crimson-300"
              onClick={handleApplyCrimsonTheme}
              disabled={isUpdating || isApplyingTheme}
            >
              <div className="w-8 h-8 rounded-lg bg-crimson-600 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">Apply Crimson Theme</div>
                <div className="text-xs text-muted-foreground">Enhanced visual design</div>
              </div>
            </Button>

            {/* Wedgewood Theme */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 text-center hover:shadow-medium transition-smooth border-wedgewood-200 hover:border-wedgewood-300"
              onClick={handleApplyWedgewoodTheme}
              disabled={isUpdating || isApplyingTheme}
            >
              <div className="w-8 h-8 rounded-lg bg-wedgewood-500 flex items-center justify-center">
                <Waves className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">Apply Wedgewood Theme</div>
                <div className="text-xs text-muted-foreground">Professional blue-gray aesthetic</div>
              </div>
            </Button>

            {/* Eucalyptus Theme */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 text-center hover:shadow-medium transition-smooth border-eucalyptus-200 hover:border-eucalyptus-300"
              onClick={handleApplyEucalyptusTheme}
              disabled={isUpdating || isApplyingTheme}
            >
              <div className="w-8 h-8 rounded-lg bg-eucalyptus-500 flex items-center justify-center">
                <Leaf className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">Apply Eucalyptus Theme</div>
                <div className="text-xs text-muted-foreground">Natural green aesthetic</div>
              </div>
            </Button>

            {/* Retro Theme */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 text-center hover:shadow-medium transition-smooth border-retro-200 hover:border-retro-300"
              onClick={handleApplyRetroTheme}
              disabled={isUpdating || isApplyingTheme}
            >
              <div className="w-8 h-8 rounded-lg bg-retro-500 flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">Apply Retro Theme</div>
                <div className="text-xs text-muted-foreground">Vintage earth tones</div>
              </div>
            </Button>

            {/* Original Theme */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 text-center hover:shadow-medium transition-smooth"
              onClick={handleApplyOriginalTheme}
              disabled={isUpdating || isApplyingTheme}
            >
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                <RotateCcw className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">Restore Original</div>
                <div className="text-xs text-muted-foreground">Default red theme</div>
              </div>
            </Button>

            {/* System Theme */}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 text-center hover:shadow-medium transition-smooth"
              onClick={handleSetSystemTheme}
              disabled={isUpdating || isApplyingTheme}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center">
                <Palette className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm">System Theme</div>
                <div className="text-xs text-muted-foreground">Follow system preference</div>
              </div>
            </Button>
          </div>
        </div>

        <Separator />

        {/* Theme Information */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Theme Information</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• <strong>Crimson Theme:</strong> Enhanced color scheme with improved visual hierarchy</p>
            <p>• <strong>Wedgewood Theme:</strong> Professional blue-gray aesthetic perfect for business</p>
            <p>• <strong>Eucalyptus Theme:</strong> Nature-inspired green palette for a fresh, calming experience</p>
            <p>• <strong>Retro Theme:</strong> Vintage earth tones with warm, nostalgic aesthetic</p>
            <p>• <strong>Original Theme:</strong> Default application theme with red primary color</p>
            <p>• <strong>System Theme:</strong> Automatically switches between light and dark modes</p>
            <p>• All themes support both light and dark mode variants</p>
          </div>
        </div>

        {/* Status Indicator */}
        {(isUpdating || isApplyingTheme) && (
          <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Applying theme...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
