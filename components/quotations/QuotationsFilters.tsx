
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  X,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { QuotationStatus } from '@/types/quotations';
import { DateRange } from 'react-day-picker';

export interface QuotationsFiltersState {
  search: string;
  status: QuotationStatus | 'all';
  dateRange: DateRange | undefined;
  sortField: 'created_at' | 'quote_number' | 'title' | 'status';
  sortDirection: 'asc' | 'desc';
  customerType: 'all' | 'customer' | 'lead';
}

interface QuotationsFiltersProps {
  filters: QuotationsFiltersState;
  onFiltersChange: (filters: Partial<QuotationsFiltersState>) => void;
  onClearFilters: () => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

export const QuotationsFilters: React.FC<QuotationsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  showAdvanced,
  onToggleAdvanced,
}) => {
  const hasActiveFilters = filters.search || 
    filters.status !== 'all' || 
    filters.dateRange?.from || 
    filters.customerType !== 'all';

  const statusOptions: { value: QuotationStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'final', label: 'Final' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
    { value: 'archived', label: 'Archived' },
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Date Created' },
    { value: 'quote_number', label: 'Quote Number' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' },
  ];

  return (
    <div className="space-y-4">
      {/* Primary Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search quotations by title, customer, or quote number..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ status: value as QuotationStatus | 'all' })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Toggle */}
        <Button
          variant="outline"
          onClick={onToggleAdvanced}
          className="whitespace-nowrap"
        >
          <Filter className="mr-2 h-4 w-4" />
          Advanced
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid gap-4 p-4 border rounded-lg bg-muted/20">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Customer Type */}
            <Select
              value={filters.customerType}
              onValueChange={(value) => onFiltersChange({ customerType: value as 'all' | 'customer' | 'lead' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Customer Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="lead">Leads</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange?.from ? (
                    filters.dateRange.to ? (
                      `${format(filters.dateRange.from, "LLL dd")} - ${format(filters.dateRange.to, "LLL dd")}`
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
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
                  selected={filters.dateRange}
                  onSelect={(range) => onFiltersChange({ dateRange: range })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Sort Field */}
            <Select
              value={filters.sortField}
              onValueChange={(value) => onFiltersChange({ sortField: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Direction */}
            <Button
              variant="outline"
              onClick={() => onFiltersChange({ 
                sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' 
              })}
              className="justify-start"
            >
              {filters.sortDirection === 'asc' ? (
                <SortAsc className="mr-2 h-4 w-4" />
              ) : (
                <SortDesc className="mr-2 h-4 w-4" />
              )}
              {filters.sortDirection === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onFiltersChange({ search: '' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onFiltersChange({ status: 'all' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.customerType !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Type: {filters.customerType}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onFiltersChange({ customerType: 'all' })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.dateRange?.from && (
            <Badge variant="secondary" className="gap-1">
              Date: {format(filters.dateRange.from, "MMM dd")}
              {filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM dd")}`}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onFiltersChange({ dateRange: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};
