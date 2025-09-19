import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { TrendingUp, TrendingDown, BarChart3, AlertTriangle } from 'lucide-react';
import { ItemAnalytics, ItemsV2ViewConfig } from '@/types/itemsV2';
import { cn } from '@/lib/utils';
import { ItemsTableActions } from './ItemsTableActions';

interface ItemsTableRowProps {
  item: ItemAnalytics;
  viewConfig: ItemsV2ViewConfig;
  selectedItems: string[];
  hoveredRow: string | null;
  onSelectionChange?: (selectedItems: string[]) => void;
  onSelectItem: (itemCode: string, checked: boolean) => void;
  onViewDetails?: (itemCode: string) => void;
  onQuickQuote?: (itemCode: string) => void;
  onRequestSample?: (itemCode: string) => void;
  onToggleFavorite?: (itemCode: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const ItemsTableRow: React.FC<ItemsTableRowProps> = ({
  item,
  viewConfig,
  selectedItems,
  hoveredRow,
  onSelectionChange,
  onSelectItem,
  onViewDetails,
  onQuickQuote,
  onRequestSample,
  onToggleFavorite,
  onMouseEnter,
  onMouseLeave
}) => {
  const defaultColumns = ['item_code', 'description', 'price', 'margin', 'stock', 'performance', 'actions'];
  const visibleColumns = viewConfig.columns_visible || defaultColumns;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    }).format(date);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <BarChart3 className="h-3 w-3 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600';
      case 'low':
        return 'text-orange-600';
      case 'adequate':
        return 'text-green-600';
      case 'high':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <TableRow
      className={cn(
        "hover:bg-muted/50 cursor-pointer transition-colors",
        selectedItems.includes(item.item_code) && "bg-blue-50",
        item.priority_level === 'critical' && "border-l-2 border-l-red-500",
        hoveredRow === item.item_code && "bg-muted/30"
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => onViewDetails?.(item.item_code)}
    >
      {onSelectionChange && (
        <TableCell>
          <Checkbox
            checked={selectedItems.includes(item.item_code)}
            onCheckedChange={(checked) =>
              onSelectItem(item.item_code, Boolean(checked))
            }
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${item.item_code}`}
          />
        </TableCell>
      )}

      {visibleColumns.includes('item_code') && (
        <TableCell>
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium">{item.item_code}</div>
              {item.brand && (
                <div className="text-xs text-muted-foreground">{item.brand}</div>
              )}
            </div>
            {item.priority_level === 'critical' && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </TableCell>
      )}

      {visibleColumns.includes('description') && (
        <TableCell>
          <div className="max-w-xs">
            <div className="truncate unicode-text">{item.description?.normalize('NFC') || 'No description'}</div>
            {item.posting_group && (
              <Badge variant="secondary" className="text-xs mt-1">
                {item.posting_group}
              </Badge>
            )}
          </div>
        </TableCell>
      )}

      {visibleColumns.includes('price') && (
        <TableCell className="text-right">
          {item.unit_price ? formatCurrency(item.unit_price) : 'N/A'}
        </TableCell>
      )}

      {visibleColumns.includes('margin') && (
        <TableCell>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-medium",
                item.sales_metrics.margin_percent > 30
                  ? 'text-green-600'
                  : item.sales_metrics.margin_percent > 15
                  ? 'text-orange-600'
                  : 'text-red-600'
              )}
            >
              {item.sales_metrics.margin_percent.toFixed(1)}%
            </span>
            {getTrendIcon(item.demand_trend || 'stable')}
          </div>
        </TableCell>
      )}

      {visibleColumns.includes('stock') && (
        <TableCell>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-medium",
                getStockStatusColor(item.inventory_intel.stock_status)
              )}
            >
              {item.inventory_intel.current_stock}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                item.inventory_intel.stock_status === 'critical' && "bg-red-100 text-red-800",
                item.inventory_intel.stock_status === 'low' && "bg-orange-100 text-orange-800"
              )}
            >
              {item.inventory_intel.stock_status}
            </Badge>
          </div>
        </TableCell>
      )}

      {visibleColumns.includes('performance') && (
        <TableCell>
          <div className="space-y-1 min-w-[120px]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {Math.round(item.overall_performance_score)}
              </span>
              <Badge
                variant="secondary"
                className={cn("text-xs", getPriorityColor(item.priority_level))}
              >
                {item.priority_level}
              </Badge>
            </div>
            <Progress value={item.overall_performance_score} className="h-1" />
          </div>
        </TableCell>
      )}

      {visibleColumns.includes('velocity') && (
        <TableCell>
          <div className="text-sm font-medium">
            {item.sales_velocity?.toFixed(1) || '0'}/mo
          </div>
        </TableCell>
      )}

      {visibleColumns.includes('last_sale') && (
        <TableCell>
          <div className="text-sm">
            {formatDate(item.sales_metrics.last_sale_date)}
          </div>
        </TableCell>
      )}

      {visibleColumns.includes('commission') && (
        <TableCell className="text-right">
          <div className="text-sm font-medium text-green-600">
            {formatCurrency(item.commission_impact)}
          </div>
        </TableCell>
      )}

      {visibleColumns.includes('actions') && (
        <TableCell>
          <ItemsTableActions
            itemCode={item.item_code}
            onViewDetails={onViewDetails}
            onQuickQuote={onQuickQuote}
            onRequestSample={onRequestSample}
            onToggleFavorite={onToggleFavorite}
          />
        </TableCell>
      )}
    </TableRow>
  );
};