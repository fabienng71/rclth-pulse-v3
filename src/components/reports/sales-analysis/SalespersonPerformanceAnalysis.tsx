import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Users, DollarSign, Target, Award } from 'lucide-react';
import { SalespersonPerformanceAnalysis as SalespersonData } from '@/hooks/useSalesAnalytics';
import { useSortableTable } from '@/hooks/useSortableTable';
import { SortableTableHeader } from '@/components/ui/sortable-table-header';

interface SalespersonPerformanceAnalysisProps {
  data: SalespersonData[];
  isLoading: boolean;
  selectedSalesperson: string;
}

export const SalespersonPerformanceAnalysis: React.FC<SalespersonPerformanceAnalysisProps> = ({
  data,
  isLoading,
  selectedSalesperson,
}) => {
  // Enhanced sorting with the sortable table hook
  const { sortField, sortDirection, handleSort, sortData } = useSortableTable<keyof SalespersonData>('total_turnover', 'desc');
  
  // Sort the data
  const sortedData = sortData(data || []);
  const getPerformanceBadge = (rating: string) => {
    switch (rating) {
      case 'TOP_PERFORMER':
        return <Badge variant="default" className="bg-soft-primary text-primary border-primary/20">Top Performer</Badge>;
      case 'GOOD_PERFORMER':
        return <Badge variant="secondary" className="bg-soft-secondary text-secondary border-secondary/20">Good Performer</Badge>;
      case 'AVERAGE_PERFORMER':
        return <Badge variant="outline" className="bg-background-tertiary text-muted-foreground border-border/30">Average Performer</Badge>;
      default:
        return <Badge variant="destructive" className="bg-soft-destructive text-destructive border-destructive/20">Needs Improvement</Badge>;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-secondary';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  if (isLoading) {
    return (
      <Card className="bg-background-container shadow-soft transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Salesperson Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading performance analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background-container shadow-soft transition-smooth">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Salesperson Performance Analysis
          <Badge variant="outline" className="ml-2">
            {data.length} salesperson{data.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        {data.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-background-secondary p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Top Performers</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                {data.filter(s => s.performance_rating === 'TOP_PERFORMER').length}
              </p>
            </div>
            
            <div className="bg-background-secondary p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold text-secondary">
                {Math.round(data.reduce((sum, s) => sum + (s.total_turnover || 0), 0)).toLocaleString()}
              </p>
            </div>
            
            <div className="bg-background-secondary p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Total Customers</span>
              </div>
              <p className="text-2xl font-bold text-warning">
                {data.reduce((sum, s) => sum + (s.total_customers || 0), 0).toLocaleString()}
              </p>
            </div>
            
            <div className="bg-background-secondary p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Avg Health Score</span>
              </div>
              <p className="text-2xl font-bold text-accent">
                {data.length > 0 ? (data.reduce((sum, s) => sum + s.customer_health_score, 0) / data.length).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        )}

        {/* Performance Table */}
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-background-secondary">
                  <SortableTableHeader
                    sortKey="salesperson_code"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Salesperson
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="performance_rating"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Performance Rating
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="total_turnover"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Total Revenue
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="total_customers"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Customers
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="customer_health_score"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Health Score
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="margin_percent"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Margin %
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="target_achievement_percent"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Target Achievement
                  </SortableTableHeader>
                  <TableHead>Focus Areas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((salesperson) => (
                  <TableRow key={salesperson.salesperson_code} className="hover:bg-background-secondary">
                    <TableCell>
                      <div>
                        <p className="font-medium">{salesperson.salesperson_code}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            Rank: #{salesperson.turnover_rank}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPerformanceBadge(salesperson.performance_rating)}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {Math.round(salesperson.total_turnover || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span className="font-medium">{salesperson.total_customers}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>New: {salesperson.new_customers}</span>
                          <span>At Risk: {salesperson.at_risk_customers}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getHealthScoreColor(salesperson.customer_health_score)}`}>
                          {salesperson.customer_health_score.toFixed(1)}%
                        </span>
                        <div className="w-16 h-2 bg-background-secondary rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              salesperson.customer_health_score >= 80 ? 'bg-primary' :
                              salesperson.customer_health_score >= 60 ? 'bg-secondary' :
                              salesperson.customer_health_score >= 40 ? 'bg-warning' : 'bg-destructive'
                            }`}
                            style={{ width: `${salesperson.customer_health_score}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {salesperson.margin_percent.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      {salesperson.target_achievement_percent ? (
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            salesperson.target_achievement_percent >= 100 ? 'text-primary' :
                            salesperson.target_achievement_percent >= 80 ? 'text-secondary' :
                            salesperson.target_achievement_percent >= 60 ? 'text-warning' : 'text-destructive'
                          }`}>
                            {salesperson.target_achievement_percent.toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No target set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {salesperson.suggested_focus_areas.slice(0, 2).map((area, index) => (
                          <div key={index} className="text-sm bg-background-tertiary px-2 py-1 rounded">
                            {area}
                          </div>
                        ))}
                        {salesperson.suggested_focus_areas.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{salesperson.suggested_focus_areas.length - 2} more
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No performance data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};