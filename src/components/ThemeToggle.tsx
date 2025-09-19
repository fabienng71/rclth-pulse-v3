
import React, { useState, memo, useCallback } from 'react';
import { Moon, Sun, Palette, Sparkles, Waves, Leaf } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useTheme } from '@/hooks/useTheme';
import { Toggle } from "@/components/ui/toggle";
import { ThemeCustomizer } from './theme/ThemeCustomizer';
import { ThemeManager } from './theme/ThemeManager';

// Memoized components
const ThemeButton = memo(({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
  <DropdownMenuItem onClick={onClick}>
    {children}
  </DropdownMenuItem>
));

const ColorToggle = memo(({ 
  pressed, 
  onPress, 
  colorClass, 
  children, 
  ariaLabel 
}: { 
  pressed: boolean, 
  onPress: () => void, 
  colorClass: string, 
  children: React.ReactNode, 
  ariaLabel: string 
}) => (
  <Toggle
    variant="outline"
    size="sm"
    pressed={pressed}
    onPressedChange={onPress}
    className={`flex-1 transition-smooth ${colorClass}`}
    aria-label={ariaLabel}
  >
    {children}
  </Toggle>
));

const CustomThemeButton = memo(({ 
  theme, 
  isActive, 
  onApply 
}: { 
  theme: { id: string, name: string, primary: string }, 
  isActive: boolean, 
  onApply: () => void 
}) => (
  <Button
    key={theme.id}
    variant="ghost"
    size="sm"
    className={`w-full justify-start transition-smooth ${isActive ? 'bg-accent' : ''}`}
    onClick={onApply}
  >
    <div 
      className="w-3 h-3 mr-2 rounded-full shadow-soft" 
      style={{ backgroundColor: theme.primary }} 
    />
    {theme.name}
  </Button>
));

export function ThemeToggle() {
  const { 
    theme, 
    setTheme, 
    isActiveColorTheme, 
    mounted, 
    customThemes,
    activeCustomThemeId,
    applyTheme,
    isApplyingTheme,
    applyCrimsonTheme,
    applyWedgewoodTheme,
    applyEucalyptusTheme,
    applyOriginalTheme
  } = useTheme();
  
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  
  // Memoized handlers
  const handleOpenCustomizer = useCallback(() => setCustomizerOpen(true), []);
  const handleCloseCustomizer = useCallback(() => setCustomizerOpen(false), []);
  const handleOpenManager = useCallback(() => setManagerOpen(true), []);
  const handleCloseManager = useCallback(() => setManagerOpen(false), []);

  // Theme setters
  const setLightTheme = useCallback(() => setTheme("light"), [setTheme]);
  const setDarkTheme = useCallback(() => setTheme("dark"), [setTheme]);
  const setSystemTheme = useCallback(() => setTheme("system"), [setTheme]);
  const setRedTheme = useCallback(() => setTheme("red"), [setTheme]);
  const setPurpleTheme = useCallback(() => setTheme("purple"), [setTheme]);
  const setBlueTheme = useCallback(() => setTheme("blue"), [setTheme]);
  const setCrimsonTheme = useCallback(() => applyCrimsonTheme(false), [applyCrimsonTheme]);
  const setWedgewoodTheme = useCallback(() => applyWedgewoodTheme(false), [applyWedgewoodTheme]);
  const setEucalyptusTheme = useCallback(() => applyEucalyptusTheme(false), [applyEucalyptusTheme]);
  const setOriginalTheme = useCallback(() => applyOriginalTheme(), [applyOriginalTheme]);
  
  const applyCustomTheme = useCallback((themeId: string) => {
    if (!isApplyingTheme) {
      applyTheme(themeId);
    }
  }, [applyTheme, isApplyingTheme]);

  if (!mounted) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9 transition-smooth shadow-soft hover:shadow-medium">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 shadow-medium">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-foreground mb-2">Theme Mode</p>
            <div className="grid grid-cols-3 gap-2">
              <ThemeButton onClick={setLightTheme}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </ThemeButton>
              <ThemeButton onClick={setDarkTheme}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </ThemeButton>
              <ThemeButton onClick={setSystemTheme}>
                <Palette className="mr-2 h-4 w-4" />
                <span>System</span>
              </ThemeButton>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-foreground mb-2">Color Themes</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <ColorToggle
                pressed={isActiveColorTheme('red')}
                onPress={setRedTheme}
                colorClass="bg-red-500 hover:bg-red-600 data-[state=on]:bg-red-700 text-white"
                ariaLabel="Red theme"
              >
                Red
              </ColorToggle>
              <ColorToggle
                pressed={isActiveColorTheme('crimson')}
                onPress={setCrimsonTheme}
                colorClass="bg-crimson-600 hover:bg-crimson-700 data-[state=on]:bg-crimson-800 text-white"
                ariaLabel="Crimson theme"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                Crimson
              </ColorToggle>
              <ColorToggle
                pressed={isActiveColorTheme('wedgewood')}
                onPress={setWedgewoodTheme}
                colorClass="bg-wedgewood-500 hover:bg-wedgewood-600 data-[state=on]:bg-wedgewood-700 text-white"
                ariaLabel="Wedgewood theme"
              >
                <Waves className="mr-1 h-3 w-3" />
                Wedgewood
              </ColorToggle>
              <ColorToggle
                pressed={isActiveColorTheme('eucalyptus')}
                onPress={setEucalyptusTheme}
                colorClass="bg-eucalyptus-500 hover:bg-eucalyptus-600 data-[state=on]:bg-eucalyptus-700 text-white"
                ariaLabel="Eucalyptus theme"
              >
                <Leaf className="mr-1 h-3 w-3" />
                Eucalyptus
              </ColorToggle>
              <ColorToggle
                pressed={isActiveColorTheme('purple')}
                onPress={setPurpleTheme}
                colorClass="bg-purple-500 hover:bg-purple-600 data-[state=on]:bg-purple-700 text-white"
                ariaLabel="Purple theme"
              >
                Purple
              </ColorToggle>
              <ColorToggle
                pressed={isActiveColorTheme('blue')}
                onPress={setBlueTheme}
                colorClass="bg-blue-500 hover:bg-blue-600 data-[state=on]:bg-blue-700 text-white"
                ariaLabel="Blue theme"
              >
                Blue
              </ColorToggle>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full transition-smooth" 
              onClick={setOriginalTheme}
            >
              Reset to Original
            </Button>
          </div>
          
          <DropdownMenuSeparator />
          
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-foreground mb-2">Custom Themes</p>
            {customThemes.length > 0 ? (
              <div className="max-h-[200px] overflow-y-auto space-y-1 mb-2">
                {customThemes.map((customTheme) => (
                  <CustomThemeButton
                    key={customTheme.id}
                    theme={customTheme}
                    isActive={activeCustomThemeId === customTheme.id}
                    onApply={() => applyCustomTheme(customTheme.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-2">No custom themes yet</p>
            )}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 transition-smooth" 
                onClick={handleOpenCustomizer}
              >
                Create
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 transition-smooth"
                onClick={handleOpenManager}
              >
                Manage
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ThemeCustomizer 
        open={customizerOpen} 
        onClose={handleCloseCustomizer} 
      />
      
      <ThemeManager 
        open={managerOpen} 
        onClose={handleCloseManager} 
      />
    </>
  );
}
