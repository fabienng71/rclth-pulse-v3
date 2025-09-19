import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronRight, Calendar, FileText, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EnhancedQuotationsTable } from './EnhancedQuotationsTable';
import { Quotation } from '@/types/quotations';
import { calculateTotal } from '@/components/quotations/details/items/QuotationItemsCalculations';

interface GroupedQuotationsTableProps {
  quotations: Quotation[];
  onDelete: (id: string) => void;
  onArchive: (id: string, currentStatus: boolean) => void;
  onStatusUpdate?: (id: string, status: any) => void;
}

interface MonthGroup {
  key: string;
  label: string;
  quotations: Quotation[];
  totalCount: number;
  totalValue: number;
  date: Date;
}

export const GroupedQuotationsTable: React.FC<GroupedQuotationsTableProps> = ({
  quotations,
  onDelete,
  onArchive,
  onStatusUpdate,
}) => {
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const monthGroups = useMemo(() => {
    const groups: { [key: string]: MonthGroup } = {};
    
    quotations.forEach(quotation => {
      const date = new Date(quotation.created_at);
      const key = format(date, 'yyyy-MM');
      const label = format(date, 'MMMM yyyy');
      
      if (!groups[key]) {
        groups[key] = {
          key,
          label,
          quotations: [],
          totalCount: 0,
          totalValue: 0,
          date,
        };
      }
      
      groups[key].quotations.push(quotation);
      groups[key].totalCount++;
      // Calculate total from quotation items
      const quotationTotal = quotation.quotation_items && Array.isArray(quotation.quotation_items) 
        ? calculateTotal(quotation.quotation_items) 
        : 0;
      groups[key].totalValue += quotationTotal;
    });

    // Sort groups by date (newest first)
    return Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [quotations]);

  // Auto-expand current month and previous month
  React.useEffect(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const previousMonth = format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM');
    setExpandedMonths(new Set([currentMonth, previousMonth]));
  }, []);

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey);
      } else {
        newSet.add(monthKey);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const expandAll = () => {
    setExpandedMonths(new Set(monthGroups.map(group => group.key)));
  };

  const collapseAll = () => {
    setExpandedMonths(new Set());
  };

  if (monthGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium mb-2">No quotations found</h2>
        <p className="text-sm text-muted-foreground">
          No quotations match your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            {monthGroups.length} month{monthGroups.length !== 1 ? 's' : ''} with quotations
          </h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Month Groups */}
      {monthGroups.map((group) => (
        <Card key={group.key} className="overflow-hidden">
          <Collapsible
            open={expandedMonths.has(group.key)}
            onOpenChange={() => toggleMonth(group.key)}
          >
            <CollapsibleTrigger asChild>
              <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expandedMonths.has(group.key) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">{group.label}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">
                        {group.totalCount} quotation{group.totalCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline">
                        {formatCurrency(group.totalValue)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0">
                <EnhancedQuotationsTable
                  quotations={group.quotations}
                  onDelete={onDelete}
                  onArchive={onArchive}
                  onStatusUpdate={onStatusUpdate}
                />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );
};