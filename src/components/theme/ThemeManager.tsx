
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useThemeManager } from '@/hooks/useThemeManager';
import { Palette, Download, Upload } from 'lucide-react';

interface ThemeManagerProps {
  open: boolean;
  onClose: () => void;
}

export const ThemeManager = ({ open, onClose }: ThemeManagerProps) => {
  const { exportTheme, importTheme, isLoading } = useThemeManager();
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleExport = async () => {
    try {
      const themeData = await exportTheme();
      const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'theme-config.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Theme exported successfully');
    } catch (error) {
      toast.error('Failed to export theme');
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      const text = await importFile.text();
      const themeData = JSON.parse(text);
      await importTheme(themeData);
      toast.success('Theme imported successfully');
      setImportFile(null);
    } catch (error) {
      toast.error('Failed to import theme');
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Manager
          </DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader>
            <CardDescription>
              Export and import theme configurations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Export Theme</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download your current theme configuration as a JSON file
                </p>
                <Button onClick={handleExport} disabled={isLoading}>
                  {isLoading ? '📦 Exporting...' : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Theme
                    </>
                  )}
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Import Theme</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a theme configuration file to apply new settings
                </p>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="theme-file">Select Theme File</Label>
                    <Input
                      id="theme-file"
                      type="file"
                      accept=".json"
                      onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <Button 
                    onClick={handleImport} 
                    disabled={isLoading || !importFile}
                  >
                    {isLoading ? '📁 Importing...' : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Import Theme
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
