import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, Trash2, Package, Star, Clock } from 'lucide-react';
import { SampleRequestItem } from '@/services/sampleRequestService';
import { useItemsData } from '@/hooks/useItemsData';
import { cn } from '@/lib/utils';

interface EnhancedItemsSectionProps {
  items: SampleRequestItem[];
  onAddItem: (item: SampleRequestItem) => void;
  onUpdateItem: (index: number, field: keyof SampleRequestItem, value: string | number | boolean | undefined) => void;
  onRemoveItem: (index: number) => void;
}

const EnhancedItemsSection = ({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem
}: EnhancedItemsSectionProps) => {
  // Use useItemsData with higher page size for search scenarios
  const { items: itemsData, isLoading, error, searchTerm, setSearchTerm } = useItemsData({ 
    page: 1, 
    pageSize: 100 // Increased for better search results
  });
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Popular items (first 5 items when no search term)
  const popularItems = searchTerm.length === 0 ? itemsData.slice(0, 5) : [];
  
  // Only open dropdown when user types something and we have results
  useEffect(() => {
    if (searchTerm.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [searchTerm]);

  // Use items directly from the hook (already filtered server-side)
  const searchResults = itemsData.slice(0, 20);
  
  const handleAddItem = (itemCode: string, description: string, price?: number) => {
    const newItem: SampleRequestItem = {
      item_code: itemCode,
      description: description || itemCode,
      quantity: 1,
      price,
      is_free: false
    };
    
    onAddItem(newItem);
    setOpen(false);
    setSearchTerm('');
  };
  
  const addEmptyItem = () => {
    const newItem: SampleRequestItem = {
      item_code: '',
      description: '',
      quantity: 1,
      is_free: false
    };
    onAddItem(newItem);
  };

  // Handle the input change - now uses the hook's search functionality
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Close dropdown when clicking outside
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen || searchTerm.length === 0) {
      setOpen(false);
    }
  };
  
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      if (item.price && !item.is_free) {
        return total + (item.price * item.quantity);
      }
      return total;
    }, 0);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Package className="h-5 w-5 mr-2 text-primary" />
          Sample Items
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Add items to include in this sample request
        </p>
      </div>
      
      {/* Item Search and Quick Actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Add Items</CardTitle>
            <Badge variant="outline">{items.length} items</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <Popover open={open} onOpenChange={handleOpenChange}>
              <PopoverTrigger asChild>
                <div className="relative flex-1">
                  <Input
                    ref={inputRef}
                    placeholder="Search items by code or description..."
                    value={searchTerm}
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
                      {isLoading ? "Loading items..." : "No items found"}
                    </CommandEmpty>
                    {error ? (
                      <div className="p-4 text-sm text-red-500">
                        Error loading items: {error.message}
                      </div>
                    ) : (
                      <>
                        {/* Popular Items */}
                        {popularItems.length > 0 && (
                          <CommandGroup heading="Popular Items">
                            {popularItems.map((item) => (
                              <CommandItem
                                key={item.item_code}
                                onSelect={() => handleAddItem(
                                  item.item_code,
                                  item.description || item.item_code,
                                  item.unit_price
                                )}
                                className="flex items-center justify-between p-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <div>
                                    <div className="font-medium">{item.item_code}</div>
                                    <div className="text-sm text-muted-foreground">{item.description}</div>
                                  </div>
                                </div>
                                {item.unit_price && (
                                  <Badge variant="outline">฿{item.unit_price}</Badge>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                        
                        {/* Search Results */}
                        <CommandGroup heading={searchTerm ? "Search Results" : "All Items"}>
                          <ScrollArea className="h-[300px]">
                            {searchResults.length === 0 && searchTerm.length > 0 && !isLoading ? (
                              <div className="p-4 text-center text-muted-foreground">
                                No items found for "{searchTerm}"
                              </div>
                            ) : searchResults.length === 0 ? (
                              <div className="p-4 text-center text-muted-foreground">
                                Start typing to search for items...
                              </div>
                            ) : (
                              searchResults.map((item) => (
                                <CommandItem
                                  key={item.item_code}
                                  onSelect={() => handleAddItem(
                                    item.item_code,
                                    item.description || item.item_code,
                                    item.unit_price
                                  )}
                                  className="flex items-center justify-between p-3"
                                >
                                  <div className="flex items-center space-x-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <div className="font-medium">{item.item_code}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {item.description}
                                      </div>
                                    </div>
                                  </div>
                                  {item.unit_price && (
                                    <Badge variant="outline">฿{item.unit_price}</Badge>
                                  )}
                                </CommandItem>
                              ))
                            )}
                          </ScrollArea>
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            <Button
              type="button"
              variant="outline"
              onClick={addEmptyItem}
              className="flex-shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Custom Item
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Items Table */}
      {items.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Quantity</TableHead>
                    <TableHead className="w-32">Unit Price</TableHead>
                    <TableHead className="w-20">Free</TableHead>
                    <TableHead className="w-32">Total</TableHead>
                    <TableHead className="w-16">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={item.item_code}
                          onChange={(e) => onUpdateItem(index, 'item_code', e.target.value)}
                          placeholder="Item code"
                          className="min-w-[120px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => onUpdateItem(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="min-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity === 0 ? '' : item.quantity}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            onUpdateItem(index, 'quantity', isNaN(value) ? 0 : value);
                          }}
                          placeholder="Quantity"
                          className="text-center"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price === undefined ? '' : item.price}
                          onChange={(e) => {
                            const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                            onUpdateItem(index, 'price', value);
                          }}
                          placeholder="0.00"
                          disabled={item.is_free}
                          className="text-right"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={item.is_free || false}
                          onCheckedChange={(checked) => {
                            onUpdateItem(index, 'is_free', checked === true);
                            if (checked) {
                              onUpdateItem(index, 'price', 0);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.is_free ? (
                          <Badge variant="secondary">Free</Badge>
                        ) : item.price ? (
                          `฿${(item.price * item.quantity).toFixed(2)}`
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(index)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Total Summary */}
            <Separator />
            <div className="p-4 bg-muted/30">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Value:</span>
                <span className="text-lg font-bold">฿{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No items added yet</h3>
            <p className="text-muted-foreground mb-4">
              Search for items above or add a custom item to get started
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Validation Message */}
      {items.length === 0 && (
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <strong>Required:</strong> Please add at least one item to continue
        </div>
      )}
    </div>
  );
};

export default EnhancedItemsSection;
