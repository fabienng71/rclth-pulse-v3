
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, Trash2 } from 'lucide-react';
import { useItemsData } from '@/hooks/useItemsData';

interface SelectedItem {
  item_code: string;
  description: string;
  quantity: number;
}

interface ItemSearchSectionProps {
  selectedItems: SelectedItem[];
  onAddItem: (item: { item_code: string, description: string }) => void;
  onRemoveItem: (itemCode: string) => void;
  onUpdateQuantity: (itemCode: string, quantity: number) => void;
}

const ItemSearchSection: React.FC<ItemSearchSectionProps> = ({
  selectedItems,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity
}) => {
  const { filteredItems, isLoading } = useItemsData();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleItemSelect = (itemCode: string) => {
    const item = filteredItems.find(i => i.item_code === itemCode);
    if (item) {
      // Check if item is already selected
      const isAlreadySelected = selectedItems.some(selected => selected.item_code === item.item_code);
      if (isAlreadySelected) {
        return; // Don't add duplicates
      }

      onAddItem({
        item_code: item.item_code,
        description: item.description || item.item_code
      });
      setSearchTerm(''); // Clear search after selection
    }
  };

  const handleQuantityChange = (itemCode: string, value: string) => {
    if (value === '') {
      onUpdateQuantity(itemCode, 0);
    } else {
      const quantity = parseFloat(value);
      if (!isNaN(quantity) && quantity >= 0) {
        onUpdateQuantity(itemCode, quantity);
      }
    }
  };

  // Filter items based on search term and exclude already selected items
  const searchResults = filteredItems.filter(item => {
    if (!searchTerm || searchTerm.length < 2) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      item.item_code.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
    
    // Exclude already selected items
    const isNotSelected = !selectedItems.some(selected => selected.item_code === item.item_code);
    
    return matchesSearch && isNotSelected;
  }).slice(0, 10); // Limit to 10 results

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Claim Items</h4>
          <p className="text-sm text-muted-foreground">
            Search and add items to this claim
          </p>
        </div>
        
        <div className="relative w-[250px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search items..."
            className="pl-8"
          />
        </div>
      </div>

      {/* Search Results */}
      {searchTerm.length >= 2 && (
        <Card className="border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading items...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="max-h-48 overflow-y-auto">
                {searchResults.map((item) => (
                  <div
                    key={item.item_code}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleItemSelect(item.item_code)}
                  >
                    <div>
                      <div className="font-medium">{item.item_code}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No items found matching "{searchTerm}"
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedItems.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedItems.map((item) => (
                <TableRow key={item.item_code}>
                  <TableCell className="font-medium">{item.item_code}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={item.quantity || ''}
                      onChange={(e) => handleQuantityChange(item.item_code, e.target.value)}
                      className="w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0.0"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.item_code)}
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center text-muted-foreground">
          No items added. Use the search field above to add items to this claim.
        </div>
      )}
    </div>
  );
};

export default ItemSearchSection;
