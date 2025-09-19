
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useItemsData } from '@/hooks/useItemsData';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Search, CheckCircle2, XCircle } from 'lucide-react';

interface EditPriceListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPriceListDialog = ({ open, onOpenChange }: EditPriceListDialogProps) => {
  const { items, isLoading, error, refetch } = useItemsData();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingItems, setUpdatingItems] = useState(false);

  // Filter items based on search query
  const filteredItems = items.filter(item => 
    item.item_code.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectItem = (itemCode: string) => {
    setSelectedItems(prev => 
      prev.includes(itemCode) 
        ? prev.filter(code => code !== itemCode) 
        : [...prev, itemCode]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.item_code));
    }
  };

  const handleIncludeInPriceList = async (include: boolean) => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    setUpdatingItems(true);
    
    try {
      // Table name is "items" (with an 's')
      const { error } = await supabase
        .from('items')
        .update({ pricelist: include })
        .in('item_code', selectedItems);
      
      if (error) {
        throw error;
      }
      
      // Refetch the items data to update the UI
      await refetch();
      
      toast.success(`${selectedItems.length} items ${include ? 'added to' : 'removed from'} price list`);
      setSelectedItems([]);
      // Close the dialog after successful update
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating items:', error);
      toast.error('Failed to update items');
    } finally {
      setUpdatingItems(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Price List</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search by item code or description" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <div className="overflow-y-auto flex-1 border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox 
                    checked={selectedItems.length > 0 && selectedItems.length === filteredItems.length}
                    className={selectedItems.length > 0 && selectedItems.length < filteredItems.length ? 
                      "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground" : ""}
                    data-state={
                      selectedItems.length > 0 && selectedItems.length < filteredItems.length 
                        ? "indeterminate" 
                        : selectedItems.length === filteredItems.length && filteredItems.length > 0 
                          ? "checked" 
                          : "unchecked"
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Item Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">In Price List</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-center">
                      <div className="text-2xl mb-2">💰</div>
                      <p className="text-muted-foreground">Updating prices...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No items match your search
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map(item => (
                  <TableRow key={item.item_code}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedItems.includes(item.item_code)} 
                        onCheckedChange={() => handleSelectItem(item.item_code)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.item_code}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell>{item.posting_group || '-'}</TableCell>
                    <TableCell className="text-center">
                      {item.pricelist === true ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                      ) : item.pricelist === false ? (
                        <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <DialogFooter className="flex justify-between items-center pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedItems.length} items selected
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updatingItems}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleIncludeInPriceList(false)}
              disabled={updatingItems || selectedItems.length === 0}
            >
              Remove from List
            </Button>
            <Button
              onClick={() => handleIncludeInPriceList(true)}
              disabled={updatingItems || selectedItems.length === 0}
            >
              Add to List
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
