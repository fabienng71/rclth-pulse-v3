
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Loader, ClipboardPaste, X, Check } from 'lucide-react';

interface BatchItemsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: { item_code: string, description: string, base_unit_code?: string }[]) => void;
}

interface ProcessingResult {
  itemCode: string;
  found: boolean;
  item?: { 
    item_code: string; 
    description: string | null;
    base_unit_code: string | null;
  };
  isDuplicate?: boolean;
  duplicateCount?: number;
}

const BatchItemsDialog: React.FC<BatchItemsDialogProps> = ({
  isOpen,
  onClose,
  onAddItems
}) => {
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setShowResults(false);
  };

  const handleProcess = async () => {
    if (!inputText.trim()) return;

    setProcessing(true);
    setShowResults(false);
    
    // Split input by newlines and filter out empty lines
    const itemCodes = inputText
      .split('\n')
      .map(code => code.trim())
      .filter(code => code.length > 0);
    
    // Count duplicates in the input
    const itemCodeCounts = itemCodes.reduce((counts, code) => {
      counts[code] = (counts[code] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const processResults: ProcessingResult[] = [];
    const processedCodes = new Set<string>();
    
    // Process each unique item code
    for (const itemCode of itemCodes) {
      // Skip if we've already processed this code
      if (processedCodes.has(itemCode)) continue;
      processedCodes.add(itemCode);
      
      try {
        // Fetch item data from Supabase
        const { data, error } = await supabase
          .from('items')
          .select('item_code, description, base_unit_code')
          .eq('item_code', itemCode)
          .maybeSingle();
        
        const duplicateCount = itemCodeCounts[itemCode];
        const isDuplicate = duplicateCount > 1;
        
        if (error) {
          console.error(`Error fetching item ${itemCode}:`, error);
          processResults.push({ 
            itemCode, 
            found: false, 
            isDuplicate,
            duplicateCount: isDuplicate ? duplicateCount : undefined
          });
        } else if (data) {
          processResults.push({ 
            itemCode, 
            found: true, 
            item: data as { 
              item_code: string; 
              description: string | null; 
              base_unit_code: string | null;
            },
            isDuplicate,
            duplicateCount: isDuplicate ? duplicateCount : undefined
          });
        } else {
          processResults.push({ 
            itemCode, 
            found: false,
            isDuplicate,
            duplicateCount: isDuplicate ? duplicateCount : undefined
          });
        }
      } catch (error) {
        console.error(`Error processing item ${itemCode}:`, error);
        processResults.push({ 
          itemCode, 
          found: false,
          isDuplicate: itemCodeCounts[itemCode] > 1,
          duplicateCount: itemCodeCounts[itemCode] > 1 ? itemCodeCounts[itemCode] : undefined
        });
      }
    }
    
    setResults(processResults);
    setProcessing(false);
    setShowResults(true);
  };
  
  const handleAddValid = () => {
    const validItemsToAdd: { item_code: string, description: string, base_unit_code?: string }[] = [];
    
    // For each result, add the item the correct number of times based on duplicates in input
    results.forEach(result => {
      if (result.found && result.item) {
        const timesToAdd = result.duplicateCount || 1;
        for (let i = 0; i < timesToAdd; i++) {
          validItemsToAdd.push({
            item_code: result.item.item_code,
            description: result.item.description || result.item.item_code,
            base_unit_code: result.item.base_unit_code || undefined
          });
        }
      }
    });
    
    if (validItemsToAdd.length > 0) {
      onAddItems(validItemsToAdd);
      onClose();
    }
  };
  
  const totalValidItems = results.reduce((total, result) => {
    return total + (result.found ? (result.duplicateCount || 1) : 0);
  }, 0);
  
  return (
    <Dialog open={isOpen} onOpenChange={() => !processing && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Multiple Items</DialogTitle>
          <DialogDescription>
            Paste item codes, one per line. Each valid item code will be added to the shipment. Duplicate item codes are allowed and will create separate line items.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {!showResults ? (
            <Textarea 
              placeholder="Paste item codes here, one per line&#10;Example:&#10;ICH0WW0000224&#10;ICH0WW0000450&#10;ICH0WW0000224 (duplicate allowed)"
              className="min-h-[200px]"
              value={inputText}
              onChange={handleTextChange}
              disabled={processing}
            />
          ) : (
            <div className="max-h-[300px] overflow-y-auto border rounded-md p-2">
              <p className="font-medium mb-2">Results:</p>
              <ul className="space-y-1">
                {results.map((result, index) => (
                  <li 
                    key={`${result.itemCode}-${index}`}
                    className={`flex items-start gap-2 p-1 ${result.found ? 'text-green-600' : 'text-red-600'}`}
                  >
                    <span className="mt-0.5 flex-shrink-0">
                      {result.found ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </span>
                    <span className="flex-shrink-0">
                      {result.itemCode}
                      {result.isDuplicate && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                          x{result.duplicateCount}
                        </span>
                      )}
                    </span>
                    {result.found ? (
                      <span className="text-sm text-muted-foreground ml-2 break-words max-w-[300px]">
                        ({result.item?.description || 'No description'})
                        {result.isDuplicate && (
                          <span className="block text-xs text-blue-600">
                            Will add {result.duplicateCount} separate line items
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-sm text-red-400 ml-2">Not found</span>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <p className="text-sm">
                  Found {results.filter(r => r.found).length} unique items, will add {totalValidItems} total line items
                </p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          {!showResults ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={processing}>
                Cancel
              </Button>
              <Button onClick={handleProcess} disabled={processing || !inputText.trim()}>
                {processing ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Process'
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowResults(false)}>
                Back
              </Button>
              <Button 
                onClick={handleAddValid}
                disabled={totalValidItems === 0}
              >
                Add {totalValidItems} Item{totalValidItems !== 1 ? 's' : ''}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchItemsDialog;
