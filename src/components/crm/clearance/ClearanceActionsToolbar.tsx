
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Square, CheckSquare, FileText, Eye } from 'lucide-react';
import { ClearanceItem } from '@/hooks/useClearanceData';
import { generateClearancePDF } from '@/utils/clearancePdfGenerator';
import { toast } from 'sonner';

interface ClearanceActionsToolbarProps {
  isSelectMode: boolean;
  onToggleSelectMode: () => void;
  selectedItems: Set<string>;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  items: ClearanceItem[];
}

export const ClearanceActionsToolbar: React.FC<ClearanceActionsToolbarProps> = ({
  isSelectMode,
  onToggleSelectMode,
  selectedItems,
  onSelectAll,
  onDeselectAll,
  items,
}) => {
  const selectedCount = selectedItems.size;
  const totalItems = items.length;
  const allSelected = selectedCount === totalItems && totalItems > 0;

  const handleGeneratePDF = async () => {
    if (selectedCount === 0) {
      toast.error('Please select items to generate PDF');
      return;
    }

    try {
      const selectedItemsData = items.filter(item => selectedItems.has(item.id));
      const currentMonth = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      await generateClearancePDF({
        selectedItems: selectedItemsData,
        month: currentMonth,
      });
      
      toast.success(`PDF generated for ${selectedCount} items`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant={isSelectMode ? "default" : "outline"}
              onClick={onToggleSelectMode}
              className="flex items-center gap-2"
            >
              {isSelectMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              {isSelectMode ? 'Exit Select Mode' : 'Select Items'}
            </Button>

            {isSelectMode && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedCount} of {totalItems} selected
                </span>
                
                {totalItems > 0 && (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={allSelected ? onDeselectAll : onSelectAll}
                    >
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {isSelectMode && selectedCount > 0 && (
            <Button
              onClick={handleGeneratePDF}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate Clearance List ({selectedCount})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
