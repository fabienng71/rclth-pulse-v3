import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle } from 'lucide-react';
import { AdjustmentFormValues } from './schema';
import { ADJUSTMENT_REASONS } from './schema';

interface AdjustmentReviewSectionProps {
  control: Control<AdjustmentFormValues>;
}

export const AdjustmentReviewSection: React.FC<AdjustmentReviewSectionProps> = ({
  control
}) => {
  const formData = useWatch({ control });

  const getReasonLabel = (reason: string) => {
    return ADJUSTMENT_REASONS.find(r => r.value === reason)?.label || reason;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotalCost = () => {
    return (formData.items || []).reduce((sum, item) => {
      const adjustmentValue = parseFloat(item.adjustment_value || '0') || 0;
      return sum + (adjustmentValue * item.unit_cost);
    }, 0);
  };

  const totalCost = calculateTotalCost();

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Review Adjustment Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Reason</div>
              <div className="text-lg">{getReasonLabel(formData.reason || '')}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Items</div>
              <div className="text-lg">{formData.items?.length || 0} items</div>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">Notes</div>
            <div className="text-sm bg-muted/50 p-3 rounded-md">
              {formData.notes || 'No notes provided'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Review */}
      <Card>
        <CardHeader>
          <CardTitle>Items Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.items && formData.items.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Current Stock</TableHead>
                    <TableHead className="text-center">Adjustment</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.item_code}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{item.current_stock.toLocaleString()}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={parseFloat(item.adjustment_value || '0') >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {parseFloat(item.adjustment_value || '0') > 0 ? '+' : ''}{parseFloat(item.adjustment_value || '0').toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unit_cost)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={parseFloat(item.adjustment_value || '0') >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency((parseFloat(item.adjustment_value || '0') || 0) * item.unit_cost)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Total Cost Summary */}
              <div className="flex justify-end pt-4 border-t">
                <div className="text-right space-y-2">
                  <div className="text-sm text-muted-foreground">Total Adjustment Cost</div>
                  <div className={`text-2xl font-bold ${totalCost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalCost)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {totalCost >= 0 ? 'Positive adjustment (increase)' : 'Negative adjustment (decrease)'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No items selected for adjustment
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};