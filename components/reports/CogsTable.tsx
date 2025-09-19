
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell,
  TableCellText,
  TableCellNumeric
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, getTextStyleClasses } from '@/lib/utils';
import { useSortableTable } from '@/hooks/useSortableTable';
import { SortableTableHeader } from './SortableTableHeader';
import { CogsItem } from '@/hooks/useCogsData';

interface CogsTableProps {
  cogsItems: CogsItem[];
  isLoading: boolean;
}

type SortField = 'item_code' | 'description' | 'unit_cost' | 'unit_price' | 'cogs_unit' | 'margin';

const CogsTable = ({ cogsItems, isLoading }: CogsTableProps) => {
  const { sortField, sortDirection, handleSort } = useSortableTable<SortField>('item_code');

  // Calculate margin % for each item
  const itemsWithCalculatedMargin = cogsItems.map(item => {
    let calculatedMargin = null;
    
    if (item.unit_price && item.cogs_unit && item.unit_price > 0) {
      calculatedMargin = ((item.unit_price - item.cogs_unit) / item.unit_price) * 100;
    }
    
    return {
      ...item,
      calculatedMargin
    };
  });

  const sortedItems = [...(itemsWithCalculatedMargin || [])].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'item_code') {
      return ((a.item_code || '') > (b.item_code || '') ? 1 : -1) * direction;
    } else if (sortField === 'description') {
      return ((a.description || '') > (b.description || '') ? 1 : -1) * direction;
    } else if (sortField === 'unit_cost') {
      return ((a.unit_cost || 0) - (b.unit_cost || 0)) * direction;
    } else if (sortField === 'unit_price') {
      return ((a.unit_price || 0) - (b.unit_price || 0)) * direction;
    } else if (sortField === 'cogs_unit') {
      return ((a.cogs_unit || 0) - (b.cogs_unit || 0)) * direction;
    } else if (sortField === 'margin') {
      return ((a.calculatedMargin || 0) - (b.calculatedMargin || 0)) * direction;
    }
    
    return 0;
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHeader
              field="item_code"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Item Code
            </SortableTableHeader>
            <SortableTableHeader
              field="description"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Description
            </SortableTableHeader>
            <SortableTableHeader
              field="base_unit_code"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Unit
            </SortableTableHeader>
            <SortableTableHeader
              field="unit_cost"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              align="center"
            >
              Unit Cost
            </SortableTableHeader>
            <SortableTableHeader
              field="unit_price"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              align="center"
            >
              Unit Price
            </SortableTableHeader>
            <SortableTableHeader
              field="cogs_unit"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              align="center"
            >
              COGS Unit
            </SortableTableHeader>
            <SortableTableHeader
              field="margin"
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              align="center"
            >
              Margin %
            </SortableTableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <TableRow key={`loading-${index}`}>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
              </TableRow>
            ))
          ) : sortedItems.length > 0 ? (
            sortedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className={getTextStyleClasses(item.item_code)}>{item.item_code}</TableCell>
                <TableCell className={getTextStyleClasses(item.description)}>{item.description || '-'}</TableCell>
                <TableCell className={getTextStyleClasses(item.base_unit_code)}>{item.base_unit_code || '-'}</TableCell>
                <TableCellNumeric value={item.unit_cost} />
                <TableCellNumeric value={item.unit_price} />
                <TableCellNumeric value={item.cogs_unit} />
                <TableCell className={`text-center ${
                  item.calculatedMargin !== null ? 
                    (item.calculatedMargin > 0 ? 'text-green-600' : 'text-red-500') : ''
                }`}>
                  {item.calculatedMargin !== null ? `${item.calculatedMargin.toFixed(1)}%` : '-'}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No COGS data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CogsTable;
