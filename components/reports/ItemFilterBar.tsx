
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Vendor {
  vendor_code: string;
  vendor_name: string;
}

interface ItemFilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  vendorFilter: string;
  setVendorFilter: (value: string) => void;
  vendors?: Vendor[];
  selectedItems?: string[];
  onViewDetails?: () => void;
}

const ItemFilterBar = ({ 
  searchTerm, 
  setSearchTerm, 
  vendorFilter,
  setVendorFilter, 
  vendors,
  selectedItems = [],
  onViewDetails,
}: ItemFilterBarProps) => {
  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:w-64">
          <Select
            value={vendorFilter}
            onValueChange={setVendorFilter}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {vendors?.map((vendor) => (
                <SelectItem key={vendor.vendor_code} value={vendor.vendor_code}>
                  {vendor.vendor_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {onViewDetails && (
          <Button 
            onClick={onViewDetails}
            disabled={selectedItems.length === 0}
          >
            View Details
          </Button>
        )}
      </div>
      {selectedItems.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'} selected
        </div>
      )}
    </div>
  );
};

export default ItemFilterBar;
