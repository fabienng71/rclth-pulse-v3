
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow,
  TableFooter
} from '@/components/ui/table';
import { useSortableTable } from '@/hooks/useSortableTable';
import { extractSortedMonths } from './monthly-data';
import { CustomerPurchasesTableProps } from './customer-purchases/types';
import { CustomerPurchasesTableHeader } from './customer-purchases/CustomerPurchasesTableHeader';
import { CustomerPurchasesTableRow } from './customer-purchases/CustomerPurchasesTableRow';
import { CustomerPurchasesTableSkeleton } from './customer-purchases/CustomerPurchasesTableSkeleton';
import { CustomerPurchasesEmptyState } from './customer-purchases/CustomerPurchasesEmptyState';
import { useCustomerPurchasesSorting } from './customer-purchases/useCustomerPurchasesSorting';
import { CustomerPurchasesTotals } from './customer-purchases/CustomerPurchasesTotals';

export function CustomerPurchasesTable({ 
  customerPurchases, 
  isLoading,
  showAmount = true // Default to showing amounts
}: CustomerPurchasesTableProps) {
  const { sortField, sortDirection, handleSort } = useSortableTable<string>('total');
  
  // Extract all months from the data
  const allMonths = extractSortedMonths(customerPurchases.map(item => ({ month_data: item.month_data })));
  
  // Use the custom sorting hook
  const sortedData = useCustomerPurchasesSorting(
    customerPurchases,
    sortField,
    sortDirection,
    showAmount,
    allMonths
  );

  // Calculate columns for empty state message
  const totalColumns = showAmount ? allMonths.length + 5 : allMonths.length + 3;

  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg font-bold mt-8 mb-4">
        Customer Purchases {showAmount ? '(Amount)' : '(Quantity)'}
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <CustomerPurchasesTableHeader
              allMonths={allMonths}
              sortField={sortField}
              sortDirection={sortDirection}
              handleSort={handleSort}
              showAmount={showAmount}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <CustomerPurchasesTableSkeleton allMonths={allMonths} showAmount={showAmount} />
          ) : sortedData.length > 0 ? (
            sortedData.map((customer) => (
              <CustomerPurchasesTableRow 
                key={customer.customer_code}
                customer={customer}
                allMonths={allMonths}
                showAmount={showAmount}
              />
            ))
          ) : (
            <CustomerPurchasesEmptyState colSpan={totalColumns} />
          )}
        </TableBody>
        {!isLoading && sortedData.length > 0 && (
          <TableFooter>
            <CustomerPurchasesTotals
              customerPurchases={customerPurchases}
              allMonths={allMonths}
              showAmount={showAmount}
            />
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
