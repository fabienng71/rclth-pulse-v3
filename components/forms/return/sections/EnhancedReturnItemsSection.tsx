
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Package, Plus, Trash2, X } from 'lucide-react';
import { useItemsData } from '@/hooks/useItemsData';
import { useDebounce } from '@/hooks/useDebounce';
import { ReturnRequestItem } from '../EnhancedReturnForm';

interface EnhancedReturnItemsSectionProps {
  items: ReturnRequestItem[];
  onAddItem: (item: ReturnRequestItem) => void;
  onUpdateItem: (index: number, field: keyof ReturnRequestItem, value: string | number) => void;
  onRemoveItem: (index: number) => void;
}

const RETURN_REASONS = [
  { value: 'defective', label: 'Defective Product' },
  { value: 'wrong_item', label: 'Wrong Item Shipped' },
  { value: 'damaged', label: 'Damaged in Transit' },
  { value: 'not_as_described', label: 'Not as Described' },
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'overstock', label: 'Customer Overstock' },
  { value: 'other', label: 'Other' }
];

const EnhancedReturnItemsSection = ({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem
}: EnhancedReturnItemsSectionProps) => {
  // Use larger pageSize for better search coverage and connect search to hook
  const { 
    items: availableItems, 
    isLoading, 
    setSearchTerm,
    searchTerm 
  } = useItemsData({ page: 1, pageSize: 200 });
  
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Connect component search to hook's database search
  useEffect(() => {
    setSearchTerm(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearchTerm]);
  
  // Only open dropdown when user types something (minimum 2 characters) and after debounce
  useEffect(() => {
    if (debouncedSearchQuery.length >= 2) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [debouncedSearchQuery]);

  // Use items directly from hook (already filtered by database query)
  const filteredItems = availableItems.slice(0, 10); // Limit to 10 results for UI performance
  
  const handleSelectItem = (item: { 
    item_code: string; 
    description?: string | null; 
    base_unit_code?: string | null;
  }) => {
    const newItem: ReturnRequestItem = {
      item_code: item.item_code,
      description: item.description || '',
      quantity: 1,
      unit: item.base_unit_code || '',
      reason: ''
    };
    onAddItem(newItem);
    setOpen(false);
    setSearchQuery('');
  };

  // Handle the input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Close dropdown when clicking outside or insufficient search length
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen || searchQuery.length < 2) {
      setOpen(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2 text-primary" />
          Return Items
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Add the items you want to return
        </p>
      </div>
      
      {/* Add Item Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Add Item</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="item-search">Search Items</Label>
            <Popover open={open} onOpenChange={handleOpenChange}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    ref={inputRef}
                    id="item-search"
                    placeholder="Type at least 2 characters to search items..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    className="pr-10"
                    autoComplete="off"
                  />
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[500px] p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandEmpty>
                      {isLoading ? "Searching items..." : 
                       searchQuery.length < 2 ? "Type at least 2 characters to search" :
                       `No items found matching "${searchQuery}"`}
                    </CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-[300px]">
                        {filteredItems.map((item) => (
                          <CommandItem
                            key={item.item_code}
                            onSelect={() => handleSelectItem(item)}
                            className="flex items-center space-x-3 p-3 cursor-pointer"
                          >
                            <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{item.item_code}</div>
                              <div className="text-sm text-muted-foreground truncate">{item.description}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>
      
      {/* Selected Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Selected Items ({items.length})</h4>
        </div>
        
        {items.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No items added</h3>
              <p className="text-muted-foreground">Search and add items you want to return</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <Card key={index} className="border-l-4 border-l-orange-500">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">{item.item_code}</Badge>
                        {item.unit && <Badge variant="secondary">{item.unit}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`reason-${index}`}>Return Reason</Label>
                      <Select
                        value={item.reason}
                        onValueChange={(value) => onUpdateItem(index, 'reason', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {RETURN_REASONS.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {items.length === 0 && (
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>Required:</strong> Please add at least one item to continue
        </div>
      )}
    </div>
  );
};

export default EnhancedReturnItemsSection;
