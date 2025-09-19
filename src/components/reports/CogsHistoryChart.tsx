
import React from 'react';
import { useCogsHistory } from '@/hooks/useCogsHistory';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableCellNumeric,
  TableCellVariance,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getTextStyleClasses } from '@/lib/utils';
import { useSortableTable } from '@/hooks/useSortableTable';
import { SortableTableHeader } from '@/components/reports/SortableTableHeader';

interface CogsHistoryChartProps {
  searchTerm?: string;
  vendorFilter?: string;
  fromDate?: Date;
  toDate?: Date;
}

type SortableFields = 'item_code' | 'description' | 'base_unit_code';

const CogsHistoryChart: React.FC<CogsHistoryChartProps> = ({ 
  searchTerm = '', 
  vendorFilter = 'all',
  fromDate,
  toDate
}) => {
  const { cogsHistory, isLoading, error } = useCogsHistory(undefined, vendorFilter, fromDate, toDate);
  const { sortField, sortDirection, handleSort } = useSortableTable<SortableFields>('item_code');

  // Filter items based on search term
  const filteredData = React.useMemo(() => {
    if (!cogsHistory) return [];
    console.log(`Filtering ${cogsHistory.length} COGS history items by search term: "${searchTerm}"`);
    
    return cogsHistory.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (item.item_code && item.item_code.toLowerCase().includes(searchLower)) ||
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.base_unit_code && item.base_unit_code.toLowerCase().includes(searchLower))
      );
    });
  }, [cogsHistory, searchTerm]);
  
  // Group by item and prepare data for horizontal month display
  const groupedData = React.useMemo(() => {
    const itemsMap = new Map();
    
    // First, create a record for each unique item
    filteredData.forEach(item => {
      if (!itemsMap.has(item.item_code)) {
        itemsMap.set(item.item_code, {
          item_code: item.item_code,
          description: item.description || '',
          base_unit_code: item.base_unit_code || '',
          months: {}
        });
      }
      
      // Then add monthly data for each item
      if (item.month && item.year) {
        const monthKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
        itemsMap.get(item.item_code).months[monthKey] = item.cogs_unit;
      }
    });
    
    return Array.from(itemsMap.values());
  }, [filteredData]);

  // Extract unique month-year combinations and sort them chronologically
  const monthColumns = React.useMemo(() => {
    const months = new Set<string>();
    
    filteredData.forEach(item => {
      if (item.month && item.year) {
        const monthKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
        months.add(monthKey);
      }
    });
    
    return Array.from(months).sort();
  }, [filteredData]);

  // Sort the grouped data
  const sortedData = React.useMemo(() => {
    return [...groupedData].sort((a, b) => {
      const aValue = String(a[sortField] || '');
      const bValue = String(b[sortField] || '');

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [groupedData, sortField, sortDirection]);

  // Format the month for display
  const formatMonthDisplay = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return `${date.toLocaleString('default', { month: 'short' })} ${year}`;
  };

  // Calculate variance percentage between first and last months for each item
  const calculateVariance = (monthsData: Record<string, number | null | undefined>) => {
    if (!monthColumns || monthColumns.length < 2) return null;
    
    // Get first and last month keys
    const firstMonthKey = monthColumns[0];
    const lastMonthKey = monthColumns[monthColumns.length - 1];
    
    // Get values for first and last months
    const firstValue = monthsData[firstMonthKey];
    const lastValue = monthsData[lastMonthKey];
    
    // Calculate variance if both values exist
    if (firstValue !== undefined && firstValue !== null && 
        lastValue !== undefined && lastValue !== null && 
        firstValue !== 0) { // Avoid division by zero
      // Calculate percentage change: (new - old) / old * 100
      return ((lastValue - firstValue) / firstValue) * 100;
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
        Error loading COGS history data: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No COGS history data available for the selected date range
        {fromDate && toDate && (
          <p className="text-sm mt-1">
            {fromDate.toLocaleDateString()} to {toDate.toLocaleDateString()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Display the actual date range being used */}
      <div className="text-sm text-muted-foreground">
        Showing data for {filteredData.length} items across {monthColumns.length} months
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHeader 
                field="item_code" 
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="w-[200px]"
              >
                Item Code
              </SortableTableHeader>
              <SortableTableHeader 
                field="description" 
                currentSortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                className="w-[300px]"
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
              {/* Render month columns dynamically */}
              {monthColumns.map((monthKey) => (
                <TableHead key={monthKey} className="text-center">
                  {formatMonthDisplay(monthKey)}
                </TableHead>
              ))}
              {/* Add variance column */}
              {monthColumns.length >= 2 && (
                <TableHead className="text-center bg-gray-50">
                  Var %
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.item_code} className="even:bg-muted/40">
                <TableCell className={getTextStyleClasses(item.item_code)}>{item.item_code}</TableCell>
                <TableCell className={getTextStyleClasses(item.description)}>{item.description}</TableCell>
                <TableCell className={getTextStyleClasses(item.base_unit_code)}>{item.base_unit_code}</TableCell>
                {/* Render COGS value for each month */}
                {monthColumns.map((monthKey) => (
                  <TableCellNumeric key={monthKey} value={item.months[monthKey]} />
                ))}
                {/* Add variance column */}
                {monthColumns.length >= 2 && (
                  <TableCellVariance value={calculateVariance(item.months)} />
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CogsHistoryChart;
