import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface SampleRequestsFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  creatorFilter: string;
  handleCreatorFilterChange: (value: string) => void;
  uniqueCreators: string[];
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  showFilters: boolean;
}

export const SampleRequestsFilters: React.FC<SampleRequestsFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  creatorFilter,
  handleCreatorFilterChange,
  uniqueCreators,
  dateRange,
  setDateRange,
  showFilters
}) => {
  return (
    <>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer, code, or items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
          <Select value={creatorFilter} onValueChange={handleCreatorFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by creator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Creators</SelectItem>
              {uniqueCreators.map((creator) => (
                <SelectItem key={creator} value={creator}>
                  {creator}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, "LLL dd")} - ${format(dateRange.to, "LLL dd")}`
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Pick date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            onClick={() => {
              setDateRange(undefined);
              setSearchQuery('');
              handleCreatorFilterChange('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </>
  );
};