
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Search, Loader2, Check } from 'lucide-react';
import { useItemsData } from '@/hooks/useItemsData';
import { useDebounce } from '@/hooks/useDebounce';

interface ItemSearchBarProps {
  onItemSelect: (item: { item_code: string, description: string }) => void;
}

const ItemSearchBar: React.FC<ItemSearchBarProps> = ({ onItemSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const { filteredItems, isLoading } = useItemsData();
  
  // Filter items based on search term
  const searchResults = filteredItems.filter(item => {
    if (!debouncedSearchTerm) return false;
    
    const search = debouncedSearchTerm.toLowerCase();
    return (
      item.item_code.toLowerCase().includes(search) ||
      (item.description && item.description.toLowerCase().includes(search))
    );
  }).slice(0, 10);
  
  // Open dropdown when search has content
  useEffect(() => {
    if (debouncedSearchTerm.length > 0) {
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
    }
  }, [debouncedSearchTerm]);

  const handleItemSelect = (itemCode: string) => {
    const item = filteredItems.find(i => i.item_code === itemCode);
    if (item) {
      const selectedItem = {
        item_code: item.item_code,
        description: item.description || item.item_code
      };
      
      // Call parent handler immediately but close dropdown in next event loop
      onItemSelect(selectedItem);
      
      // Close dropdown and clear search
      setTimeout(() => {
        setIsSearchOpen(false);
        setSearchTerm('');
      }, 0);
    }
  };

  return (
    <div className="w-full">
      <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items to add..."
              className="pl-8 w-full"
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
          align="start" 
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
                {searchResults.map((item) => (
                  <CommandItem
                    key={item.item_code}
                    value={item.item_code}
                    onSelect={() => handleItemSelect(item.item_code)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">{item.item_code}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                      <Check className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ItemSearchBar;
