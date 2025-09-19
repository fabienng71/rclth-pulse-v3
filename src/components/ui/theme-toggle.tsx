import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Sparkles, 
  Waves, 
  Leaf, 
  Clock,
  RotateCcw 
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';

export const ThemeToggle = () => {
  const { 
    theme, 
    setTheme, 
    isDarkMode,
    applyCrimsonTheme,
    applyWedgewoodTheme,
    applyEucalyptusTheme,
    applyRetroTheme,
    applyOriginalTheme,
    isApplyingTheme
  } = useTheme();

  const handleApplyCrimsonTheme = async () => {
    const success = await applyCrimsonTheme(isDarkMode);
    if (success) {
      toast.success('Crimson theme applied');
    }
  };

  const handleApplyWedgewoodTheme = async () => {
    const success = await applyWedgewoodTheme(isDarkMode);
    if (success) {
      toast.success('Wedgewood theme applied');
    }
  };

  const handleApplyEucalyptusTheme = async () => {
    const success = await applyEucalyptusTheme(isDarkMode);
    if (success) {
      toast.success('Eucalyptus theme applied');
    }
  };

  const handleApplyRetroTheme = async () => {
    const success = await applyRetroTheme(isDarkMode);
    if (success) {
      toast.success('Retro theme applied');
    }
  };

  const handleApplyOriginalTheme = async () => {
    const success = await applyOriginalTheme();
    if (success) {
      toast.success('Original theme applied');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'crimson':
        return <Sparkles className="h-4 w-4" />;
      case 'wedgewood':
        return <Waves className="h-4 w-4" />;
      case 'eucalyptus':
        return <Leaf className="h-4 w-4" />;
      case 'retro':
        return <Clock className="h-4 w-4" />;
      case 'red':
        return <RotateCcw className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Palette className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          disabled={isApplyingTheme}
        >
          {getThemeIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Theme Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* System Themes */}
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Color Themes</DropdownMenuLabel>
        
        {/* Color Themes */}
        <DropdownMenuItem onClick={handleApplyCrimsonTheme} disabled={isApplyingTheme}>
          <Sparkles className="mr-2 h-4 w-4 text-crimson-600" />
          Crimson
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleApplyWedgewoodTheme} disabled={isApplyingTheme}>
          <Waves className="mr-2 h-4 w-4 text-wedgewood-500" />
          Wedgewood
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleApplyEucalyptusTheme} disabled={isApplyingTheme}>
          <Leaf className="mr-2 h-4 w-4 text-eucalyptus-500" />
          Eucalyptus
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleApplyRetroTheme} disabled={isApplyingTheme}>
          <Clock className="mr-2 h-4 w-4 text-retro-500" />
          Retro
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleApplyOriginalTheme} disabled={isApplyingTheme}>
          <RotateCcw className="mr-2 h-4 w-4 text-red-600" />
          Original
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};