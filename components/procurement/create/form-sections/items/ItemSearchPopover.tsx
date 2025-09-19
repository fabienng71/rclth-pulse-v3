
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { useItemsData } from '@/hooks/useItemsData';
import { useDebounce } from '@/hooks/useDebounce';

interface ItemSearchPopoverProps {
  onItemSelect: (item: { item_code: string, description: string, base_unit_code?: string }) => void;
}

const ItemSearchPopover: React.FC<ItemSearchPopoverProps> = ({ onItemSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 2000); // 2000ms (2 seconds) debounce
  
  const { items, isLoading } = useItemsData();
  
  // Filter items based on debounced search term
  const filteredItems = items.filter(item => {
    if (!debouncedSearchTerm) return false; // Don't show items when search is empty
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return (
      item.item_code.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  });
  
  // Automatically open dropdown when debounced search has content
  useEffect(() => {
    if (debouncedSearchTerm.length > 0) {
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
    }
  }, [debouncedSearchTerm]);

  const handleItemSelect = (itemCode: string) => {
    const item = items.find(i => i.item_code === itemCode);
    if (item) {
      onItemSelect({
        item_code: item.item_code,
        description: item.description || item.item_code,
        base_unit_code: item.base_unit_code || undefined
      });
      setIsSearchOpen(false);
      setSearchTerm(''); // Clear search after selection
    }
  };

  return (
    <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items..."
            className="pl-8 w-[250px]"
            onClick={() => {
              if (searchTerm.length > 0) {
                setIsSearchOpen(true);
              }
            }}
          />
        </div>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-[400px] p-0" 
        align="end" 
        side="bottom" 
        sideOffset={5}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading items...
                </div>
              ) : (
                "No items found"
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredItems.slice(0, 10).map((item) => (
                <CommandItem
                  key={item.item_code}
                  value={item.item_code}
                  onSelect={() => handleItemSelect(item.item_code)}
                >
                  <div className="flex flex-col">
                    <div className="font-medium">{item.item_code}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                    {item.base_unit_code && (
                      <div className="text-xs text-muted-foreground">Unit: {item.base_unit_code}</div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ItemSearchPopover;
