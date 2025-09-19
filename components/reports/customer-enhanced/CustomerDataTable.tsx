import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCellNumeric } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { SortableTableHeader } from '@/components/reports/SortableTableHeader';

interface CustomerDataTableProps {
  sortedCustomers: any[];
  selectedCustomers: string[];
  isLoading: boolean;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  onSelectAll: (checked: boolean) => void;
  onCustomerSelect: (customerCode: string) => void;
  getHealthScoreColor: (score: number) => string;
  getRFMSegmentColor: (segment: string) => string;
  getGrowthTrendIcon: (trend: string) => React.ReactNode;
}

export const CustomerDataTable: React.FC<CustomerDataTableProps> = ({
  sortedCustomers,
  selectedCustomers,
  isLoading,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onCustomerSelect,
  getHealthScoreColor,
  getRFMSegmentColor,
  getGrowthTrendIcon
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={sortedCustomers.length > 0 && selectedCustomers.length === sortedCustomers.length}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
                aria-label="Select all customers"
              />
            </TableHead>
            <SortableTableHeader 
              field="customer_code" 
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            >
              Code
            </SortableTableHeader>
            <SortableTableHeader 
              field="customer_name" 
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            >
              Name
            </SortableTableHeader>
            <SortableTableHeader 
              field="health_score" 
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              align="right"
            >
              Health Score
            </SortableTableHeader>
            <TableHead>RFM Segment</TableHead>
            <SortableTableHeader 
              field="growth_trend" 
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
            >
              Trend
            </SortableTableHeader>
            <SortableTableHeader 
              field="total_turnover" 
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              align="right"
            >
              Turnover (12M)
            </SortableTableHeader>
            <SortableTableHeader 
              field="recency_days" 
              currentSortField={sortField}
              sortDirection={sortDirection}
              onSort={onSort}
              align="right"
            >
              Days Since Last
            </SortableTableHeader>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(10).fill(0).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
              </TableRow>
            ))
          ) : sortedCustomers && sortedCustomers.length > 0 ? (
            sortedCustomers.map((customer) => (
              <TableRow key={customer.customer_code}>
                <TableCell>
                  <Checkbox 
                    checked={selectedCustomers.includes(customer.customer_code)}
                    onCheckedChange={() => onCustomerSelect(customer.customer_code)}
                    aria-label={`Select ${customer.search_name || customer.customer_name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{customer.customer_code}</TableCell>
                <TableCell>{customer.search_name || customer.customer_name}</TableCell>
                <TableCell className="text-right">
                  <span className={`font-semibold ${getHealthScoreColor(customer.health_score)}`}>
                    {customer.health_score}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getRFMSegmentColor(customer.rfm_segment)}>
                    {customer.rfm_segment.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span>{getGrowthTrendIcon(customer.growth_trend)}</span>
                    <span className="capitalize">{customer.growth_trend}</span>
                  </div>
                </TableCell>
                <TableCellNumeric value={customer.total_turnover} />
                <TableCell className="text-right">
                  <span className={customer.recency_days > 90 ? 'text-red-600' : customer.recency_days > 30 ? 'text-yellow-600' : 'text-green-600'}>
                    {customer.recency_days}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {customer.is_at_risk && (
                      <Badge variant="destructive" className="text-xs">
                        At Risk
                      </Badge>
                    )}
                    {customer.is_new_customer && (
                      <Badge variant="default" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                No customers found matching your criteria
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};