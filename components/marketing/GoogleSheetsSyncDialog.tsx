
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStockSync } from '@/hooks/useStockSync';
import { Loader2, ExternalLink } from 'lucide-react';

interface GoogleSheetsSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSyncComplete?: () => void;
}

export const GoogleSheetsSyncDialog: React.FC<GoogleSheetsSyncDialogProps> = ({
  open,
  onOpenChange,
  onSyncComplete
}) => {
  const [sheetId, setSheetId] = useState('1P86dIlCjV6AoHsrBD4FEAJ9LsMNZoUPm8mn5lfaFPQU');
  const [range, setRange] = useState('stock!A2:G');
  const { syncFromGoogleSheets, isLoading } = useStockSync();

  const handleSync = async () => {
    if (!sheetId.trim()) {
      return;
    }

    try {
      await syncFromGoogleSheets(sheetId.trim(), range.trim());
      onSyncComplete?.();
      onOpenChange(false);
      // Reset form to defaults
      setSheetId('1P86dIlCjV6AoHsrBD4FEAJ9LsMNZoUPm8mn5lfaFPQU');
      setRange('stock!A2:G');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const extractSheetId = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  const handleSheetIdChange = (value: string) => {
    // If it looks like a full URL, extract the ID
    const extractedId = extractSheetId(value);
    setSheetId(extractedId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Sync Stock Data from Google Sheets</DialogTitle>
          <DialogDescription>
            Connect to your Google Sheet to update stock quantities. Make sure your sheet is publicly viewable or shared with the service account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="sheetId">Google Sheet ID or URL</Label>
            <Input
              id="sheetId"
              placeholder="Enter Google Sheet ID or full URL"
              value={sheetId}
              onChange={(e) => handleSheetIdChange(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              You can paste the full Google Sheets URL or just the sheet ID
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="range">Range (optional)</Label>
            <Input
              id="range"
              placeholder="e.g., stock!A2:G or Data!A1:G100"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Specify the range to read. Default: stock!A2:G (assumes header row)
            </p>
          </div>

          <div className="rounded-lg border p-4 bg-muted/50">
            <h4 className="font-medium mb-2">Expected Sheet Format:</h4>
            <div className="text-sm space-y-1">
              <p><strong>Column A:</strong> Code (required)</p>
              <p><strong>Column B:</strong> Description (optional)</p>
              <p><strong>Column C:</strong> Packing (optional)</p>
              <p><strong>Column D:</strong> UOM (optional)</p>
              <p><strong>Column E:</strong> Price (THB) (optional)</p>
              <p><strong>Column F:</strong> Adjust (optional, defaults to 0)</p>
              <p><strong>Column G:</strong> Stock (required)</p>
            </div>
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://docs.google.com/spreadsheets/d/1example/edit', '_blank')}
                className="text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Example Sheet
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSync} disabled={!sheetId.trim() || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sync Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
