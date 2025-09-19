
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { Save, RotateCcw } from 'lucide-react';

export const ThemeSettings = () => {
  const { 
    settings, 
    updateSetting, 
    resetToDefaults, 
    saveSettings, 
    isLoading, 
    hasUnsavedChanges 
  } = useThemeSettings();

  const handleSave = async () => {
    await saveSettings();
  };

  const handleReset = async () => {
    await resetToDefaults();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Theme Settings
          {hasUnsavedChanges && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Unsaved Changes
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Customize the appearance and behavior of your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Colors Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Colors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary-color">Primary Color</Label>
              <Input
                id="primary-color"
                type="color"
                value={settings.colors.primary}
                onChange={(e) => updateSetting('colors.primary', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <Input
                id="secondary-color"
                type="color"
                value={settings.colors.secondary}
                onChange={(e) => updateSetting('colors.secondary', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="accent-color">Accent Color</Label>
              <Input
                id="accent-color"
                type="color"
                value={settings.colors.accent}
                onChange={(e) => updateSetting('colors.accent', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="background-color">Background Color</Label>
              <Input
                id="background-color"
                type="color"
                value={settings.colors.background}
                onChange={(e) => updateSetting('colors.background', e.target.value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Typography Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Typography</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="font-family">Font Family</Label>
              <Input
                id="font-family"
                value={settings.typography.fontFamily}
                onChange={(e) => updateSetting('typography.fontFamily', e.target.value)}
                placeholder="Inter, sans-serif"
              />
            </div>
            <div>
              <Label htmlFor="font-size">Base Font Size</Label>
              <Input
                id="font-size"
                value={settings.typography.fontSize}
                onChange={(e) => updateSetting('typography.fontSize', e.target.value)}
                placeholder="16px"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Layout Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Layout</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Enable dark theme</p>
              </div>
              <Switch
                id="dark-mode"
                checked={settings.layout.darkMode}
                onCheckedChange={(checked) => updateSetting('layout.darkMode', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Use more compact spacing</p>
              </div>
              <Switch
                id="compact-mode"
                checked={settings.layout.compactMode}
                onCheckedChange={(checked) => updateSetting('layout.compactMode', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset} disabled={isLoading}>
            {isLoading ? '🔄 Resetting...' : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </>
            )}
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !hasUnsavedChanges}>
            {isLoading ? '💾 Saving...' : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
