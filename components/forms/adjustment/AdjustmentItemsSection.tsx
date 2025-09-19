import React, { useState } from 'react';
import { Control, useFieldArray } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Package } from 'lucide-react';
import { AdjustmentFormValues } from './schema';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AdjustmentItemsSectionProps {
  control: Control<AdjustmentFormValues>;
  disabled?: boolean;
}

export const AdjustmentItemsSection: React.FC<AdjustmentItemsSectionProps> = ({
  control,
  disabled = false
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items'
  });

  // Search items with stock and COGS data
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['item-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      // First get items
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('item_code, description')
        .or(`item_code.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(10);

      if (itemsError) throw itemsError;
      if (!items || items.length === 0) return [];

      const itemCodes = items.map(item => item.item_code);

      // Get stock data
      const { data: stockData } = await supabase
        .from('stock_onhands')
        .select('item_code, quantity')
        .in('item_code', itemCodes);

      // Get COGS data
      const { data: cogsData } = await supabase
        .from('cogs_master')
        .select('item_code, cogs_unit')
        .in('item_code', itemCodes);

      // Combine the data
      return items.map(item => ({
        ...item,
        stock_onhands: stockData?.find(s => s.item_code === item.item_code) || { quantity: 0 },
        cogs_master: cogsData?.find(c => c.item_code === item.item_code) || { cogs_unit: 0 }
      }));
    },
    enabled: searchQuery.length > 0
  });

  const handleItemSelect = (item: any) => {
    const existingIndex = fields.findIndex(field => field.item_code === item.item_code);
    
    if (existingIndex === -1) {
      append({
        item_code: item.item_code,
        description: item.description,
        current_stock: item.stock_onhands.quantity || 0,
        adjustment_value: '',
        unit_cost: item.cogs_master.cogs_unit || 0
      });
    }
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleAdjustmentChange = (index: number, value: string) => {
    update(index, { ...fields[index], adjustment_value: value });
  };

  const calculateTotalCost = () => {
    return fields.reduce((sum, item) => {
      const adjustmentValue = parseFloat(item.adjustment_value || '0') || 0;
      return sum + (adjustmentValue * item.unit_cost);
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Items to Adjust
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Item Search */}
        <div className="space-y-2">
          <Label>Search Items</Label>
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start" disabled={disabled}>
                <Package className="h-4 w-4 mr-2" />
                Search and add items...
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search by item code or description..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>
                    {isLoading ? 'Searching...' : 'No items found.'}
                  </CommandEmpty>
                  <CommandGroup>
                    {searchResults.map((item) => (
                      <CommandItem
                        key={item.item_code}
                        value={`${item.item_code} ${item.description}`}
                        onSelect={() => handleItemSelect(item)}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{item.item_code}</div>
                          <div className="text-sm text-muted-foreground truncate">
                            {item.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Stock: {item.stock_onhands.quantity || 0} | 
                            Cost: ฿{item.cogs_master.cogs_unit || 0}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Items Table */}
        {fields.length > 0 && (
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
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item_code}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{item.current_stock.toLocaleString()}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="text"
                        value={item.adjustment_value}
                        onChange={(e) => handleAdjustmentChange(index, e.target.value)}
                        disabled={disabled}
                        className="w-32 text-center"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unit_cost)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={parseFloat(item.adjustment_value || '0') >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency((parseFloat(item.adjustment_value || '0') || 0) * item.unit_cost)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={disabled}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Total Cost Summary */}
            <div className="flex justify-end pt-4 border-t">
              <div className="text-right space-y-2">
                <div className="text-sm text-muted-foreground">Total Adjustment Cost</div>
                <div className={`text-xl font-semibold ${calculateTotalCost() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(calculateTotalCost())}
                </div>
              </div>
            </div>
          </div>
        )}

        {fields.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No items added yet</p>
            <p className="text-sm">Search and select items to add to your adjustment request</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};