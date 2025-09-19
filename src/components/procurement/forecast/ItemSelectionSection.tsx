
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Package, X, Building2 } from 'lucide-react';
import { useItemsData } from '@/hooks/useItemsData';
import { useVendorsData } from '@/hooks/useVendorsData';

interface ItemSelectionSectionProps {
  selectedItems: string[];
  onSelectionChange: (items: string[]) => void;
}

const ItemSelectionSection: React.FC<ItemSelectionSectionProps> = ({
  selectedItems,
  onSelectionChange
}) => {
  const [selectedVendorCode, setSelectedVendorCode] = useState<string>('all');
  // Use the hook's built-in search functionality with increased page size
  const { items, isLoading, searchTerm, setSearchTerm } = useItemsData({ 
    page: 1, 
    pageSize: 500 // Increased for better search coverage
  });
  const { vendors, isLoading: vendorsLoading } = useVendorsData();

  // Apply additional client-side filtering for vendor (server-side search handles text search)
  const filteredItems = items.filter(item => {
    const matchesVendor = selectedVendorCode === 'all' || item.vendor_code === selectedVendorCode;
    return matchesVendor;
  });

  // Debug logging to help troubleshoot
  console.log(`[ItemSelection] Total items loaded: ${items.length}`);
  console.log(`[ItemSelection] Filtered items: ${filteredItems.length}`);
  console.log(`[ItemSelection] Search term: "${searchTerm}"`);
  console.log(`[ItemSelection] Selected vendor: "${selectedVendorCode}"`);
  console.log(`[ItemSelection] Loading: ${isLoading}`);

  const handleAddItem = (itemCode: string) => {
    if (!selectedItems.includes(itemCode)) {
      onSelectionChange([...selectedItems, itemCode]);
    }
  };

  const handleRemoveItem = (itemCode: string) => {
    onSelectionChange(selectedItems.filter(item => item !== itemCode));
  };

  const getItemDescription = (itemCode: string) => {
    const item = items.find(i => i.item_code === itemCode);
    return item?.description || itemCode;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedVendorCode('all');
  };

  const selectedVendor = vendors.find(v => v.vendor_code === selectedVendorCode);
  const hasActiveFilters = searchTerm !== '' || selectedVendorCode !== 'all';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Select Items for Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search items by code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Vendor Filter */}
            <div className="flex items-center gap-2 min-w-[200px]">
              <Building2 className="h-4 w-4 text-gray-400" />
              <Select value={selectedVendorCode} onValueChange={setSelectedVendorCode}>
                <SelectTrigger>
                  <SelectValue placeholder="All vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All vendors</SelectItem>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor.vendor_code} value={vendor.vendor_code}>
                      {vendor.vendor_name} ({vendor.vendor_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchTerm}"
                </Badge>
              )}
              {selectedVendor && (
                <Badge variant="secondary" className="text-xs">
                  Vendor: {selectedVendor.vendor_name}
                </Badge>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-6 px-2"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Selected Items */}
        {selectedItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Selected Items ({selectedItems.length})</h4>
            <div className="flex flex-wrap gap-2">
              {selectedItems.map(itemCode => (
                <Badge key={itemCode} variant="secondary" className="flex items-center gap-2">
                  <span className="font-mono text-xs">{itemCode}</span>
                  <span className="text-xs max-w-[200px] truncate">
                    {getItemDescription(itemCode)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveItem(itemCode)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Available Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Available Items</h4>
            <span className="text-xs text-gray-500">
              {filteredItems.length} of {items.length} items
            </span>
          </div>
          {isLoading || vendorsLoading ? (
            <div className="text-sm text-gray-500">Loading items...</div>
          ) : (
            <div className="max-h-60 overflow-y-auto border rounded-md">
              {filteredItems.slice(0, 100).map(item => (
                <div
                  key={item.item_code}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-medium text-gray-900">
                      {item.item_code}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {item.description}
                    </div>
                    {item.vendor_code && (
                      <div className="text-xs text-gray-400">
                        Vendor: {item.vendor_code}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={selectedItems.includes(item.item_code) ? "secondary" : "outline"}
                    onClick={() => 
                      selectedItems.includes(item.item_code) 
                        ? handleRemoveItem(item.item_code)
                        : handleAddItem(item.item_code)
                    }
                    disabled={selectedItems.includes(item.item_code)}
                  >
                    {selectedItems.includes(item.item_code) ? 'Selected' : 'Add'}
                  </Button>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No items found matching your search criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemSelectionSection;
