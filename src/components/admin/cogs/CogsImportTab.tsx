import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, Download, RefreshCw, FileText } from 'lucide-react';
import { useCogsSync } from '@/hooks/useCogsSync';

export const CogsImportTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { importData, isImporting, downloadTemplate } = useCogsSync();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importData(selectedFile);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('cogs-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import COGS Data
          </CardTitle>
          <CardDescription>
            Upload an Excel file containing COGS data. The system will automatically sync the master table.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="cogs-file-input" className="text-sm font-medium">
              Select Excel File
            </label>
            <input
              id="cogs-file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
          
          {selectedFile && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>File Selected</AlertTitle>
              <AlertDescription>
                Ready to import: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || isImporting}
              className="flex items-center gap-2"
            >
              {isImporting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isImporting ? 'Importing...' : 'Import Data'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};