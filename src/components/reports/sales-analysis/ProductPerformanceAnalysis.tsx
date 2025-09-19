import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, TrendingUp, TrendingDown, AlertTriangle, Sparkles } from 'lucide-react';
import { ProductPerformanceAnalysis as ProductData } from '@/hooks/useSalesAnalytics';
import { useSortableTable } from '@/hooks/useSortableTable';
import { SortableTableHeader } from '@/components/ui/sortable-table-header';

interface ProductPerformanceAnalysisProps {
  data: ProductData[];
  isLoading: boolean;
  selectedSalesperson: string;
}

export const ProductPerformanceAnalysis: React.FC<ProductPerformanceAnalysisProps> = ({
  data,
  isLoading,
  selectedSalesperson,
}) => {
  // Enhanced sorting with the sortable table hook
  const { sortField, sortDirection, handleSort, sortData } = useSortableTable<keyof ProductData>('current_turnover', 'desc');
  
  // Sort the data
  const sortedData = sortData(data || []);
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SURGING':
        return <Badge variant="default" className="bg-soft-primary text-primary border-primary/20">Surging</Badge>;
      case 'NEW':
        return <Badge variant="secondary" className="bg-soft-accent text-accent border-accent/20">New</Badge>;
      case 'LOST':
        return <Badge variant="destructive" className="bg-soft-destructive text-destructive border-destructive/20">Lost</Badge>;
      case 'DECLINING':
        return <Badge variant="secondary" className="bg-soft-warning text-warning border-warning/20">Declining</Badge>;
      case 'DROPPING':
        return <Badge variant="outline" className="bg-soft-secondary text-secondary border-secondary/20">Dropping</Badge>;
      default:
        return <Badge variant="outline">Stable</Badge>;
    }
  };

  const getPerformanceBadge = (rating: string) => {
    switch (rating) {
      case 'HIGH_PERFORMER':
        return <Badge variant="default" className="bg-soft-primary text-primary border-primary/20">High Performer</Badge>;
      case 'GOOD_PERFORMER':
        return <Badge variant="secondary" className="bg-soft-secondary text-secondary border-secondary/20">Good Performer</Badge>;
      case 'AVERAGE_PERFORMER':
        return <Badge variant="outline" className="bg-background-tertiary text-muted-foreground border-border/30">Average Performer</Badge>;
      default:
        return <Badge variant="outline">Low Performer</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-background-container shadow-soft transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading product performance analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background-container shadow-soft transition-smooth">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product Performance Analysis
          <Badge variant="outline" className="ml-2">
            {data.length} products
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-background-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Surging</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {data.filter(p => p.product_status === 'SURGING').length}
            </p>
          </div>
          
          <div className="bg-background-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">New</span>
            </div>
            <p className="text-2xl font-bold text-accent">
              {data.filter(p => p.product_status === 'NEW').length}
            </p>
          </div>
          
          <div className="bg-background-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Declining</span>
            </div>
            <p className="text-2xl font-bold text-warning">
              {data.filter(p => p.product_status === 'DECLINING').length}
            </p>
          </div>
          
          <div className="bg-background-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">Lost</span>
            </div>
            <p className="text-2xl font-bold text-destructive">
              {data.filter(p => p.product_status === 'LOST').length}
            </p>
          </div>
        </div>

        {/* Product Table */}
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-background-secondary">
                  <SortableTableHeader
                    sortKey="item_description"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Product
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="product_status"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Status
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="current_volume"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Current Volume
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="volume_change_percent"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Volume Change (vs Previous)
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="volume_trend_percent"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Volume Trend (vs 4-Week Avg)
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="current_turnover"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Current Turnover
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="turnover_change_percent"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Turnover Change (vs Previous)
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="turnover_trend_percent"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Turnover Trend (vs 4-Week Avg)
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="performance_rating"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Performance
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="suggested_action"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Action
                  </SortableTableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.slice(0, 20).map((product) => (
                  <TableRow key={product.item_code} className="hover:bg-background-secondary">
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.item_description}</p>
                        <p className="text-sm text-muted-foreground">{product.item_code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(product.product_status)}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {product.current_volume?.toLocaleString() || '0'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono text-sm ${
                        product.volume_change_percent > 0 ? 'text-primary' :
                        product.volume_change_percent < 0 ? 'text-destructive' :
                        'text-muted-foreground'
                      }`}>
                        {product.volume_change_percent > 0 ? '+' : ''}{product.volume_change_percent?.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono text-sm ${
                        product.volume_trend_percent > 0 ? 'text-primary' :
                        product.volume_trend_percent < 0 ? 'text-destructive' :
                        'text-muted-foreground'
                      }`}>
                        {product.volume_trend_percent > 0 ? '+' : ''}{product.volume_trend_percent?.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {Math.round(product.current_turnover || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono text-sm ${
                        product.turnover_change_percent > 0 ? 'text-primary' :
                        product.turnover_change_percent < 0 ? 'text-destructive' :
                        'text-muted-foreground'
                      }`}>
                        {product.turnover_change_percent > 0 ? '+' : ''}{product.turnover_change_percent?.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono text-sm ${
                        product.turnover_trend_percent > 0 ? 'text-primary' :
                        product.turnover_trend_percent < 0 ? 'text-destructive' :
                        'text-muted-foreground'
                      }`}>
                        {product.turnover_trend_percent > 0 ? '+' : ''}{product.turnover_trend_percent?.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {getPerformanceBadge(product.performance_rating)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {product.suggested_action.length > 30 ? 
                          `${product.suggested_action.substring(0, 30)}...` : 
                          product.suggested_action
                        }
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No product performance data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};