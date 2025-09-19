import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ItemsV2Filters } from '@/types/itemsV2';
import { format } from 'date-fns';

interface DateFiltersSectionProps {
  localFilters: ItemsV2Filters;
  updateFilter: (key: keyof ItemsV2Filters, value: any) => void;
}

export const DateFiltersSection: React.FC<DateFiltersSectionProps> = ({
  localFilters,
  updateFilter
}) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Date Filters
      </Label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Last Sale After</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                <Calendar className="h-4 w-4 mr-2" />
                {localFilters.last_sale_after ? 
                  format(localFilters.last_sale_after, "PPP") : 
                  "Pick a date"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={localFilters.last_sale_after}
                onSelect={(date) => updateFilter('last_sale_after', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Created After</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                <Calendar className="h-4 w-4 mr-2" />
                {localFilters.created_after ? 
                  format(localFilters.created_after, "PPP") : 
                  "Pick a date"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={localFilters.created_after}
                onSelect={(date) => updateFilter('created_after', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};