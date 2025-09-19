
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMonth } from '@/components/reports/monthly-data';
import { CustomerPurchaseItem } from './CustomerPurchaseItem';
import { CustomerPurchaseTotals } from './CustomerPurchaseTotals';
import { CustomerPurchase } from './types';
import { useItemPurchaseSorting, SortField } from '@/hooks/useItemPurchaseSorting';
import { SortableTableHead } from './SortableTableHead';

interface PurchaseDataTableProps {
  purchaseData: CustomerPurchase[];
  isLoading: boolean;
  error: Error | null;
  showAmount: boolean;
  allMonths: string[];
  grandTotalQuantity: number;
  grandTotalAmount: number;
}

export const PurchaseDataTable = ({
  purchaseData,
  isLoading,
  error,
  showAmount,
  allMonths,
  grandTotalQuantity,
  grandTotalAmount
}: PurchaseDataTableProps) => {
  const { sortedData, sortField, sortDirection, handleSort } = useItemPurchaseSorting(
    purchaseData, 
    showAmount
  );
  
  if (error) {
    return <div className="text-destructive">Error loading data: {error.message}</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHead 
              field="item_code" 
              currentSortField={sortField} 
              sortDirection={sortDirection} 
              onSort={handleSort}
              className="w-[150px]"
            >
              Item Code
            </SortableTableHead>
            
            <SortableTableHead 
              field="description" 
              currentSortField={sortField} 
              sortDirection={sortDirection} 
              onSort={handleSort}
              className="w-[250px]"
            >
              Description
            </SortableTableHead>
            
            <TableHead>Unit</TableHead>
            
            {allMonths.map(month => (
              <SortableTableHead 
                key={month} 
                field={`month_${month}`} 
                currentSortField={sortField} 
                sortDirection={sortDirection} 
                onSort={handleSort}
                align="right"
              >
                {formatMonth(month)}
              </SortableTableHead>
            ))}
            
            <SortableTableHead 
              field="total" 
              currentSortField={sortField} 
              sortDirection={sortDirection} 
              onSort={handleSort}
              align="right"
            >
              Total
            </SortableTableHead>

            <SortableTableHead 
              field="margin" 
              currentSortField={sortField} 
              sortDirection={sortDirection} 
              onSort={handleSort}
              align="right"
            >
              Margin %
            </SortableTableHead>

            <SortableTableHead 
              field="last_price" 
              currentSortField={sortField} 
              sortDirection={sortDirection} 
              onSort={handleSort}
              align="right"
            >
              Last Price
            </SortableTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                <TableHead><Skeleton className="h-5 w-48" /></TableHead>
                <TableHead><Skeleton className="h-5 w-16" /></TableHead>
                {allMonths.map((_, j) => (
                  <TableHead key={j} className="text-right">
                    <Skeleton className="h-5 w-20 ml-auto" />
                  </TableHead>
                ))}
                <TableHead className="text-right">
                  <Skeleton className="h-5 w-20 ml-auto" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-5 w-20 ml-auto" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="h-5 w-20 ml-auto" />
                </TableHead>
              </TableRow>
            ))
          ) : sortedData.length > 0 ? (
            <>
              {sortedData.map((item) => (
                <CustomerPurchaseItem 
                  key={item.item_code}
                  item={item}
                  allMonths={allMonths}
                  showAmount={showAmount}
                />
              ))}
              
              <CustomerPurchaseTotals
                purchaseData={purchaseData}
                allMonths={allMonths}
                showAmount={showAmount}
                grandTotalQuantity={grandTotalQuantity}
                grandTotalAmount={grandTotalAmount}
              />
            </>
          ) : (
            <TableRow>
              <TableHead colSpan={allMonths.length + 6} className="text-center py-8 text-muted-foreground">
                No purchase data available for the selected customers in this date range
              </TableHead>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
