
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CleanFragment } from "@/components/ui/clean-fragment";
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { ClearanceItem } from '@/hooks/useClearanceData';
import { ClearanceRowExpansion } from '@/components/crm/clearance/ClearanceRowExpansion';
import { useToggleClearanceCompletion } from '@/hooks/useToggleClearanceCompletion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ClearanceTableProps {
  items: ClearanceItem[];
  sortField: keyof ClearanceItem;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof ClearanceItem) => void;
  onEdit: (item: ClearanceItem) => void;
  onDelete: (item: ClearanceItem) => void;
  isSelectMode?: boolean;
  selectedItems?: Set<string>;
  onItemSelect?: (itemId: string, selected: boolean) => void;
}

export function ClearanceTable({ 
  items, 
  sortField, 
  sortDirection, 
  onSort, 
  onEdit, 
  onDelete,
  isSelectMode = false,
  selectedItems = new Set(),
  onItemSelect
}: ClearanceTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { toggleCompletion, isLoading: isToggling } = useToggleClearanceCompletion();

  const toggleRowExpansion = (itemId: string) => {
    console.log('Toggling row expansion for item ID:', itemId);
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(itemId)) {
      newExpandedRows.delete(itemId);
    } else {
      newExpandedRows.add(itemId);
    }
    setExpandedRows(newExpandedRows);
    console.log('Expanded rows after toggle:', Array.from(newExpandedRows));
  };

  const handleCompletionToggle = async (item: ClearanceItem, completed: boolean) => {
    try {
      await toggleCompletion({ id: item.id, is_done: completed });
    } catch (error) {
      toast.error('Failed to update completion status');
    }
  };

  const handleItemSelect = (itemId: string, selected: boolean) => {
    if (onItemSelect) {
      onItemSelect(itemId, selected);
    }
  };

  const getSortIcon = (field: keyof ClearanceItem) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getStatusBadgeColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'good':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'unknown':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (value: number) => {
    return Math.floor(value).toLocaleString('en-US');
  };

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return '-';
    return Math.floor(price).toLocaleString('en-US');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clearance Items</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                {isSelectMode && (
                  <TableHead className="w-12">
                    <span className="sr-only">Select</span>
                  </TableHead>
                )}
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onSort('item_code')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Item Code
                    {getSortIcon('item_code')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onSort('description')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Description
                    {getSortIcon('description')}
                  </Button>
                </TableHead>
                <TableHead>UOM</TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => onSort('quantity')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Quantity
                    {getSortIcon('quantity')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onSort('status')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Status
                    {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => onSort('expiration_date')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Expiration Date
                    {getSortIcon('expiration_date')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => onSort('clearance_price')}
                    className="h-auto p-0 font-semibold hover:bg-transparent"
                  >
                    Clearance Price
                    {getSortIcon('clearance_price')}
                  </Button>
                </TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? (
                items.map((item) => (
                  <CleanFragment fragmentKey={item.id}>
                    <TableRow className={cn(
                      "hover:bg-muted/50",
                      item.is_done && "opacity-60"
                    )}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(item.id)}
                          className="h-6 w-6 p-0"
                        >
                          {expandedRows.has(item.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      
                      {isSelectMode && (
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={(checked) => 
                              handleItemSelect(item.id, checked as boolean)
                            }
                          />
                        </TableCell>
                      )}

                      <TableCell className={cn(
                        "font-medium",
                        item.is_done && "line-through"
                      )}>
                        {item.item_code}
                      </TableCell>
                      
                      <TableCell className={cn(
                        item.is_done && "line-through"
                      )}>
                        {item.description || 'N/A'}
                      </TableCell>
                      
                      <TableCell>{item.uom || 'N/A'}</TableCell>
                      
                      <TableCell className="text-right">
                        {formatNumber(item.quantity)}
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={getStatusBadgeColor(item.status)}
                        >
                          {item.status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>{formatDate(item.expiration_date)}</TableCell>
                      
                      <TableCell className="text-right font-medium">
                        {formatPrice(item.clearance_price)}
                      </TableCell>
                      
                      <TableCell>
                        {item.note || '-'}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCompletionToggle(item, !item.is_done)}
                            disabled={isToggling}
                            className={cn(
                              "h-8 w-8",
                              item.is_done 
                                ? "text-green-600 hover:text-green-700" 
                                : "text-gray-400 hover:text-green-600"
                            )}
                            title={item.is_done ? "Mark as pending" : "Mark as completed"}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                            className="h-8 w-8"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(item.id) && (
                      <TableRow key={`${item.id}-expanded`}>
                        <TableCell colSpan={isSelectMode ? 11 : 10} className="p-0">
                          <ClearanceRowExpansion itemCode={item.item_code} />
                        </TableCell>
                      </TableRow>
                    )}
                  </CleanFragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isSelectMode ? 11 : 10} className="text-center py-6 text-muted-foreground">
                    No clearance items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
