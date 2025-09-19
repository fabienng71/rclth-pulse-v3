
import { useState, useRef, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useItemsData, Item } from '@/hooks/useItemsData';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ItemSearchProps {
  onSelectItem: (item: Item) => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
}

export const ItemSearch = ({ onSelectItem, disabled = false, placeholder = "Search items...", value }: ItemSearchProps) => {
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

  const handleSelect = (item: Item) => {
    onSelectItem(item);
    setOpen(false);
    setSearchTerm(''); // Clear the search term
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
        <div className="relative w-full">
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            disabled={disabled || isLoading}
            className="w-full pr-10"
            autoComplete="off"
          />
          {isLoading ? (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 animate-spin" />
          ) : (
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[1000px] p-0 bg-background border" 
        align="start" 
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
                    value={item.item_code}
                    onSelect={() => handleSelect(item)}
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
