
import { 
  Table, 
  TableBody
} from '../ui/table';
import { MonthlyItemData } from '@/types/sales';
import { ItemSalesTableHeader } from './sales-table/ItemSalesTableHeader';
import { ItemSalesTableRow } from './sales-table/ItemSalesTableRow';
import { ItemSalesTableLoading } from './sales-table/ItemSalesTableLoading';
import { ItemSalesTableEmpty } from './sales-table/ItemSalesTableEmpty';
import { ItemSalesTableTotals } from './ItemSalesTableTotals';
import { useItemSalesSort } from './sales-table/useItemSalesSort';

interface ItemSalesTableProps {
  monthlyData: MonthlyItemData[];
  isLoading: boolean;
  showAmount: boolean;
  selectedItems: string[];
}

const ItemSalesTable = ({ 
  monthlyData, 
  isLoading, 
  showAmount, 
  selectedItems 
}: ItemSalesTableProps) => {
  const { 
    sortField, 
    sortDirection, 
    handleSort, 
    sortedData, 
    allMonths 
  } = useItemSalesSort(monthlyData, showAmount);
  
  // Determine if we should show the margin column
  const showMarginColumn = showAmount && monthlyData.some(item => item.totals.margin !== undefined);
  
  // Calculate total columns for empty state
  const totalColumns = allMonths.length + 4 + (showMarginColumn ? 1 : 0);

  return (
    <div className="overflow-x-auto">
      <Table>
        <ItemSalesTableHeader 
          sortField={sortField}
          sortDirection={sortDirection}
          handleSort={handleSort}
          allMonths={allMonths}
          showMarginColumn={showMarginColumn}
        />
        
        <TableBody>
          {isLoading ? (
            <ItemSalesTableLoading 
              rowCount={selectedItems.length} 
              columnCount={allMonths.length} 
              showMarginColumn={showMarginColumn} 
            />
          ) : sortedData.length > 0 ? (
            sortedData.map((item) => (
              <ItemSalesTableRow
                key={item.item_code}
                item={item}
                allMonths={allMonths}
                showAmount={showAmount}
                showMarginColumn={showMarginColumn}
              />
            ))
          ) : (
            <ItemSalesTableEmpty colSpan={totalColumns} />
          )}
        </TableBody>
        
        {!isLoading && sortedData.length > 0 && (
          <ItemSalesTableTotals
            monthlyData={monthlyData}
            allMonths={allMonths}
            showAmount={showAmount}
            showMarginColumn={showMarginColumn}
          />
        )}
      </Table>
    </div>
  );
};

export default ItemSalesTable;
