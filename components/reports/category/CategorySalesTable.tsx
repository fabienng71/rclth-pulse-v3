
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CategorySalesData } from '@/hooks/useCategorySalesData';
import { formatCurrency } from '@/lib/utils';
import { formatMonth } from '@/components/reports/monthly-data/formatUtil';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategorySalesTableProps {
  data: CategorySalesData[];
  months: string[];
  isLoading: boolean;
  error: Error | null;
  onCategoryClick?: (category: string) => void;
}

type SortField = 'posting_group' | 'category_name' | 'total' | 'percentage' | string;
type SortDirection = 'asc' | 'desc';

const CategorySalesTable = ({ data, months, isLoading, error, onCategoryClick }: CategorySalesTableProps) => {
  const [sortField, setSortField] = useState<SortField>('total');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  if (isLoading) {
    return <div className="flex justify-center p-6">Loading category data...</div>;
  }
  
  if (error) {
    return <div className="flex justify-center p-6 text-red-600">Error: {error.message}</div>;
  }
  
  if (!data || data.length === 0) {
    return <div className="flex justify-center p-6">No category data available.</div>;
  }
  
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />;
  };
  
  // Sort the data
  const sortedData = [...data].sort((a, b) => {
    // Handle sorting by months (dynamic fields)
    if (months.includes(sortField)) {
      const aValue = a.months[sortField] || 0;
      const bValue = b.months[sortField] || 0;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle sorting by static fields
    let comparison = 0;
    if (sortField === 'posting_group') {
      comparison = a.posting_group.localeCompare(b.posting_group);
    } else if (sortField === 'category_name') {
      const aName = a.category_name || a.posting_group;
      const bName = b.category_name || b.posting_group;
      comparison = aName.localeCompare(bName);
    } else if (sortField === 'total') {
      comparison = a.total - b.total;
    } else if (sortField === 'percentage') {
      comparison = a.percentage - b.percentage;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  // Calculate totals for footer
  const calculateMonthlyTotals = () => {
    const monthlyTotals: Record<string, number> = {};
    months.forEach(month => {
      monthlyTotals[month] = data.reduce((sum, item) => sum + (item.months[month] || 0), 0);
    });
    return monthlyTotals;
  };
  
  const monthlyTotals = calculateMonthlyTotals();
  const grandTotal = data.reduce((sum, item) => sum + item.total, 0);
  
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('posting_group')}
            >
              Category Code {getSortIcon('posting_group')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('category_name')}
            >
              Category Name {getSortIcon('category_name')}
            </TableHead>
            {months.map(month => (
              <TableHead 
                key={month} 
                className="text-right cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort(month)}
              >
                {formatMonth(month)} {getSortIcon(month)}
              </TableHead>
            ))}
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('total')}
            >
              Total {getSortIcon('total')}
            </TableHead>
            <TableHead 
              className="text-right cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('percentage')}
            >
              % of Total {getSortIcon('percentage')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map(category => (
            <TableRow key={category.posting_group}>
              <TableCell>
                {onCategoryClick ? (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800" 
                    onClick={() => onCategoryClick(category.posting_group)}
                  >
                    {category.posting_group}
                  </Button>
                ) : (
                  category.posting_group
                )}
              </TableCell>
              <TableCell>{category.category_name || category.posting_group}</TableCell>
              {months.map(month => (
                <TableCell key={month} className="text-right">
                  {formatCurrency(category.months[month])}
                </TableCell>
              ))}
              <TableCell className="text-right font-semibold">
                {formatCurrency(category.total)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {category.percentage.toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <tfoot>
          <TableRow className="bg-muted/50 font-semibold">
            <TableCell colSpan={2}>Total</TableCell>
            {months.map(month => (
              <TableCell key={month} className="text-right">
                {formatCurrency(monthlyTotals[month])}
              </TableCell>
            ))}
            <TableCell className="text-right">
              {formatCurrency(grandTotal)}
            </TableCell>
            <TableCell className="text-right">
              100.0%
            </TableCell>
          </TableRow>
        </tfoot>
      </Table>
    </div>
  );
};

export default CategorySalesTable;
