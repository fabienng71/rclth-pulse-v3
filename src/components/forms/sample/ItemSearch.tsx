
import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useItemsData } from '@/hooks/useItemsData';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SampleRequestItem } from '@/services/sampleRequestService';

interface ItemSearchProps {
  isSubmitting: boolean;
  onAddItem: (item: SampleRequestItem) => void;
}

const ItemSearch: React.FC<ItemSearchProps> = ({ isSubmitting, onAddItem }) => {
  // Use useItemsData with higher page size for search scenarios
  const { items, isLoading, error, searchTerm, setSearchTerm } = useItemsData({ 
    page: 1, 
    pageSize: 100 // Increased for better search results
  });
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Only open dropdown when user types something and we have results
  useEffect(() => {
    if (searchTerm.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [searchTerm]);

  // Use items directly from the hook (already filtered server-side)
  const searchResults = items.slice(0, 10); // Limit display to 10 results for UI performance

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

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="relative w-[250px]">
          <Input
            ref={inputRef}
            placeholder="Type to search items..."
            value={searchTerm}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className="pr-10"
            autoComplete="off"
          />
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] p-0" 
        align="end" 
        sideOffset={5}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {error ? (
              <div className="p-4 text-sm text-red-500">
                Error loading items: {error.message}
              </div>
            ) : searchResults.length === 0 && searchTerm.length > 0 && !isLoading ? (
              <CommandEmpty>No items found for "{searchTerm}"</CommandEmpty>
            ) : searchResults.length === 0 ? (
              <CommandEmpty>Start typing to search for items...</CommandEmpty>
            ) : (
              <CommandGroup>
                {searchResults.map((item) => (
                <CommandItem
                  key={item.item_code}
                  onSelect={() => handleAddItem(
                    item.item_code, 
                    item.description || item.item_code,
                    item.unit_price || undefined
                  )}
                  className="flex flex-col items-start"
                >
                  <div className="font-medium">{item.item_code}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.description || "No description"}
                  </div>
                </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ItemSearch;
