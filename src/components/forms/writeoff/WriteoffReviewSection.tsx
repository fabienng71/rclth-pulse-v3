import React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileCheck, Calendar, Package, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { WriteoffFormValues } from './schema';
import { WRITEOFF_REASONS } from '../../../services/writeoff-requests/types';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WriteoffReviewSectionProps {
  control: Control<WriteoffFormValues>;
}

export const WriteoffReviewSection: React.FC<WriteoffReviewSectionProps> = ({ control }) => {
  const formData = useWatch({ control });

  // Fetch COGS data for items
  const { data: cogsData = {} } = useQuery({
    queryKey: ['cogs-data-review', formData.items?.map(item => item.item_code).filter(Boolean)],
    queryFn: async () => {
      const itemCodes = formData.items?.map(item => item.item_code).filter(Boolean) || [];
      if (itemCodes.length === 0) return {};

      const { data, error } = await supabase
        .from('cogs_master')
        .select('item_code, cogs_unit')
        .in('item_code', itemCodes);

      if (error) throw error;
      
      return data?.reduce((acc, item) => {
        acc[item.item_code] = item.cogs_unit || 0;
        return acc;
      }, {} as Record<string, number>) || {};
    },
    enabled: (formData.items?.length || 0) > 0,
  });

  const totalCost = formData.items?.reduce((sum, item) => {
    const cogsUnit = cogsData[item.item_code] || 0;
    return sum + (item.quantity || 0) * cogsUnit;
  }, 0) || 0;

  const selectedReason = WRITEOFF_REASONS.find(r => r.value === formData.reason);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Review Write-off Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-xl font-semibold">{formData.items?.length || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <DollarSign className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-xl font-semibold">THB {Math.round(totalCost).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="text-lg font-semibold">{selectedReason?.label}</p>
              </div>
            </div>
          </div>

          {/* Write-off Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Reason for Write-off</h4>
              <Badge variant="secondary">{selectedReason?.label}</Badge>
            </div>
            
            {formData.notes && (
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                  {formData.notes}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items to Write Off</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.items && formData.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Expiry Date</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.items.map((item, index) => {
                  const cogsUnit = cogsData[item.item_code] || 0;
                  const itemTotal = (item.quantity || 0) * cogsUnit;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.item_code}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-center">
                        {item.exp_date ? format(new Date(item.exp_date), 'PP') : '-'}
                      </TableCell>
                      <TableCell className="text-right">{Math.round(cogsUnit).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">{Math.round(itemTotal).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={5} className="font-medium">Total</TableCell>
                  <TableCell className="text-right font-bold">{Math.round(totalCost).toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No items added yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};