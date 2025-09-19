

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, FilterX } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSalespersonsData } from '@/hooks/useCustomersData';
import type { SalespersonAnalysisFilters } from '@/hooks/useSalespersonAnalysisData';

interface SalespersonAnalysisFiltersProps {
  filters: SalespersonAnalysisFilters;
  onFiltersChange: (filters: Partial<SalespersonAnalysisFilters>) => void;
}

export const SalespersonAnalysisFiltersComponent: React.FC<SalespersonAnalysisFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const { salespersons } = useSalespersonsData();

  const handleClearFilters = () => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    onFiltersChange({
      salesperson_code: '',
      from_date: oneMonthAgo,
      to_date: now,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Analysis Filters
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <FilterX className="h-4 w-4" />
            Clear Filters
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Salesperson Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Salesperson</label>
            <Select
              value={filters.salesperson_code}
              onValueChange={(value) => onFiltersChange({ salesperson_code: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select salesperson" />
              </SelectTrigger>
              <SelectContent>
                {salespersons.map((salesperson) => (
                  <SelectItem key={salesperson.spp_code} value={salesperson.spp_code}>
                    {salesperson.spp_name} ({salesperson.spp_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* From Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">From Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.from_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.from_date ? format(filters.from_date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.from_date}
                  onSelect={(date) => date && onFiltersChange({ from_date: date })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.to_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.to_date ? format(filters.to_date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.to_date}
                  onSelect={(date) => date && onFiltersChange({ to_date: date })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
