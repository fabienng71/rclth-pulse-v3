import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Target, AlertTriangle, TrendingDown, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { PredictiveChurnAnalysis as PredictiveData } from '@/hooks/useSalesAnalytics';
import { useSortableTable } from '@/hooks/useSortableTable';
import { SortableTableHeader } from '@/components/ui/sortable-table-header';

interface PredictiveAnalyticsProps {
  data: PredictiveData[];
  isLoading: boolean;
  selectedSalesperson: string;
}

const ExpandableFactors: React.FC<{ factors: string[]; customerCode: string; bgClass?: string }> = ({ factors, customerCode, bgClass = 'bg-background-tertiary' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (factors.length <= 2) {
    return (
      <div className="space-y-1">
        {factors.map((factor, index) => (
          <div key={index} className={`text-sm ${bgClass} px-2 py-1 rounded`}>
            {factor}
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {factors.slice(0, isExpanded ? factors.length : 2).map((factor, index) => (
        <div key={index} className={`text-sm ${bgClass} px-2 py-1 rounded`}>
          {factor}
        </div>
      ))}
      {factors.length > 2 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              +{factors.length - 2} more
            </>
          )}
        </button>
      )}
    </div>
  );
};

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  data,
  isLoading,
  selectedSalesperson,
}) => {
  // Enhanced sorting with the sortable table hook
  const { sortField, sortDirection, handleSort, sortData } = useSortableTable<keyof PredictiveData>('churn_probability', 'desc');
  
  // Sort the data
  const sortedData = sortData(data || []);
  const getChurnProbabilityBadge = (probability: number) => {
    if (probability >= 70) {
      return <Badge variant="destructive" className="bg-soft-destructive text-destructive border-destructive/20">High Risk</Badge>;
    } else if (probability >= 50) {
      return <Badge variant="secondary" className="bg-soft-warning text-warning border-warning/20">Medium Risk</Badge>;
    } else {
      return <Badge variant="outline" className="bg-soft-secondary text-secondary border-secondary/20">Low Risk</Badge>;
    }
  };

  const getRiskColor = (probability: number) => {
    if (probability >= 70) return 'text-destructive';
    if (probability >= 50) return 'text-warning';
    return 'text-secondary';
  };

  if (isLoading) {
    return (
      <Card className="bg-background-container shadow-soft transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Predictive Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading predictive analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background-container shadow-soft transition-smooth">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Predictive Analytics
          <Badge variant="outline" className="ml-2">
            {data.length} customers analyzed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-background-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">High Risk</span>
            </div>
            <p className="text-2xl font-bold text-destructive">
              {data.filter(c => c.churn_probability >= 70).length}
            </p>
            <p className="text-sm text-muted-foreground">≥70% churn probability</p>
          </div>
          
          <div className="bg-background-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">Medium Risk</span>
            </div>
            <p className="text-2xl font-bold text-warning">
              {data.filter(c => c.churn_probability >= 50 && c.churn_probability < 70).length}
            </p>
            <p className="text-sm text-muted-foreground">50-69% churn probability</p>
          </div>
          
          <div className="bg-background-secondary p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Value at Risk</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {Math.round(data.reduce((sum, c) => sum + (c.customer_value_at_risk || 0), 0)).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Revenue at risk</p>
          </div>
        </div>

        {/* Predictive Table */}
        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-background-secondary">
                  <SortableTableHeader
                    sortKey="customer_name"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Customer
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="churn_probability"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Churn Probability
                  </SortableTableHeader>
                  <TableHead>Key Risk Factors</TableHead>
                  <SortableTableHeader
                    sortKey="customer_value_at_risk"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Value at Risk
                  </SortableTableHeader>
                  <SortableTableHeader
                    sortKey="predicted_churn_week"
                    currentSortKey={sortField}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  >
                    Predicted Churn Week
                  </SortableTableHeader>
                  <TableHead>Preventive Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((customer) => (
                  <TableRow key={customer.customer_code} className="hover:bg-background-secondary">
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{customer.customer_code}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getRiskColor(customer.churn_probability)}`}>
                          {customer.churn_probability}%
                        </span>
                        <div className="w-16 h-2 bg-background-secondary rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              customer.churn_probability >= 70 ? 'bg-destructive' :
                              customer.churn_probability >= 50 ? 'bg-warning' : 'bg-secondary'
                            }`}
                            style={{ width: `${customer.churn_probability}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-1">
                        {getChurnProbabilityBadge(customer.churn_probability)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ExpandableFactors 
                        factors={customer.key_risk_factors} 
                        customerCode={customer.customer_code}
                        bgClass="bg-background-tertiary"
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {Math.round(customer.customer_value_at_risk || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {customer.predicted_churn_week === 1 ? 'Next week' : 
                         customer.predicted_churn_week === 2 ? 'In 2 weeks' :
                         `In ${customer.predicted_churn_week} weeks`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ExpandableFactors 
                        factors={customer.preventive_actions} 
                        customerCode={customer.customer_code}
                        bgClass="bg-background-accent"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No predictive analytics data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};