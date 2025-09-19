
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

interface Item {
  item_code: string;
  description: string | null;
  base_unit_code: string | null;
  unit_price: number | null;
  vendor_code: string | null;
}

interface ItemsTableProps {
  isLoading: boolean;
  filteredItems?: Item[];
  selectedItems: string[];
  toggleItemSelection: (itemCode: string) => void;
  toggleSelectAll: () => void;
  areAllSelected: boolean;
  getVendorName: (vendorCode: string | null) => string;
}

const ItemsTable = ({
  isLoading,
  filteredItems,
  selectedItems,
  toggleItemSelection,
  toggleSelectAll,
  areAllSelected,
  getVendorName
}: ItemsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={areAllSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
                disabled={!filteredItems || filteredItems.length === 0}
              />
            </TableHead>
            <TableHead>Item Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Base Unit Code</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <TableRow key={item.item_code}>
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(item.item_code)}
                    onCheckedChange={() => toggleItemSelection(item.item_code)}
                    aria-label={`Select item ${item.item_code}`}
                  />
                </TableCell>
                <TableCell>{item.item_code}</TableCell>
                <TableCell>{item.description || '-'}</TableCell>
                <TableCell>{item.base_unit_code || '-'}</TableCell>
                <TableCell>{getVendorName(item.vendor_code)}</TableCell>
                <TableCell className="text-right">
                  {item.unit_price ? item.unit_price.toLocaleString(undefined, { 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 0 
                  }) : '-'}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                {filteredItems ? 'No items match your filters' : 'No items found'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ItemsTable;
