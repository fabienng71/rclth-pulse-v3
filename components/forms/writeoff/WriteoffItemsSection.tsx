import React, { useState, useEffect } from 'react';
import { Control, useFieldArray, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { WriteoffFormValues } from './schema';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface WriteoffItemsSectionProps {
  control: Control<WriteoffFormValues>;
  disabled?: boolean;
}

interface Item {
  item_code: string;
  description: string;
}

export const WriteoffItemsSection: React.FC<WriteoffItemsSectionProps> = ({ control, disabled = false }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Watch all items to calculate total cost
  const watchedItems = useWatch({
    control,
    name: 'items',
  });

  // Fetch items for search
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const { data, error } = await supabase
        .from('items')
        .select('item_code, description')
        .or(`item_code.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      return data as Item[];
    },
    enabled: searchQuery.length > 0,
  });

  // Fetch COGS data for items
  const { data: cogsData = {} } = useQuery({
    queryKey: ['cogs-data', watchedItems?.map(item => item.item_code).filter(Boolean)],
    queryFn: async () => {
      const itemCodes = watchedItems?.map(item => item.item_code).filter(Boolean) || [];
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
    enabled: (watchedItems?.length || 0) > 0,
  });

  // Calculate total cost
  const totalCost = watchedItems?.reduce((sum, item) => {
    const cogsUnit = cogsData[item.item_code] || 0;
    return sum + (item.quantity || 0) * cogsUnit;
  }, 0) || 0;

  const addItem = () => {
    append({
      item_code: '',
      description: '',
      quantity: 1,
      exp_date: new Date(),
      cogs_unit: 0,
    });
  };

  const selectItem = (item: Item) => {
    const cogsUnit = cogsData[item.item_code] || 0;
    append({
      item_code: item.item_code,
      description: item.description,
      quantity: 1,
      exp_date: new Date(),
      cogs_unit: cogsUnit,
    });
    setSearchQuery('');
    setSearchOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Write-off Items</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              Total Cost: {totalCost.toLocaleString()}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Item Search */}
        <div className="flex gap-2">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex-1 justify-start" disabled={disabled}>
                <Search className="h-4 w-4 mr-2" />
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
                    {items.map((item) => (
                      <CommandItem
                        key={item.item_code}
                        value={`${item.item_code} ${item.description}`}
                        onSelect={() => selectItem(item)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{item.item_code}</span>
                          <span className="text-sm text-muted-foreground">{item.description}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          <Button type="button" onClick={addItem} disabled={disabled}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Items List */}
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No items added yet. Use the search above to add items.
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="grid gap-4 md:grid-cols-6">
                  <FormField
                    control={control}
                    name={`items.${index}.item_code`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Item code" disabled={disabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Description" disabled={disabled} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            placeholder="0"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`items.${index}.exp_date`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={disabled}
                              >
                                {field.value ? (
                                  format(field.value, "PP")
                                ) : (
                                  <span>Pick date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <FormLabel className="text-sm">Cost</FormLabel>
                      <div className="text-sm font-medium text-muted-foreground mt-1">
                        {Math.round((watchedItems?.[index]?.quantity || 0) * (cogsData[watchedItems?.[index]?.item_code] || 0)).toLocaleString()}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};