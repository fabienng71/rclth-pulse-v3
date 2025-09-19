
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { WeekSelector } from '@/components/crm/activities/WeekSelector';

type CompletionFilterType = 'all' | 'completed' | 'active';

interface ActivityListFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  salespersonFilter: string;
  onSalespersonChange: (value: string) => void;
  salespersonOptions: string[];
  selectedWeek: number | null;
  onWeekChange: (week: number | null) => void;
  onClearFilters: () => void;
  completionFilter?: CompletionFilterType;
  onCompletionFilterChange?: (value: CompletionFilterType) => void;
}

const activityTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'demo', label: 'Demo' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Lead', label: 'Lead' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Proposal', label: 'Proposal' },
  { value: 'Closed Won', label: 'Closed Won' },
  { value: 'Closed Lost', label: 'Closed Lost' },
];

const completionOptions = [
  { value: 'all', label: 'All Activities' },
  { value: 'active', label: 'Active Only' },
  { value: 'completed', label: 'Completed Only' },
];

export const ActivityListFilters: React.FC<ActivityListFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  salespersonFilter,
  onSalespersonChange,
  salespersonOptions,
  selectedWeek,
  onWeekChange,
  onClearFilters,
  completionFilter = 'all',
  onCompletionFilterChange,
}) => {
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || 
    salespersonFilter !== 'all' || selectedWeek !== null || completionFilter !== 'all';

  return (
    <div className="space-y-4 bg-background-container p-4 rounded-lg border border-border/50">
      {/* Search and Quick Filters Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Completion Filter */}
        {onCompletionFilterChange && (
          <Select value={completionFilter} onValueChange={onCompletionFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Completion status" />
            </SelectTrigger>
            <SelectContent>
              {completionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value as CompletionFilterType}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearFilters} className="shrink-0">
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Detailed Filters Row */}
      <div className="flex flex-wrap gap-4">
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {activityTypes.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Salesperson Filter */}
        <Select value={salespersonFilter} onValueChange={onSalespersonChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Salesperson" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Salespersons</SelectItem>
            {salespersonOptions.map((salesperson) => (
              <SelectItem key={salesperson} value={salesperson}>
                {salesperson}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Week Selector - Simplified */}
        <WeekSelector
          selectedWeek={selectedWeek}
          onWeekChange={onWeekChange}
        />
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchTerm}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onSearchChange('')} />
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusOptions.find(s => s.value === statusFilter)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onStatusChange('all')} />
            </Badge>
          )}
          {typeFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Type: {activityTypes.find(t => t.value === typeFilter)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onTypeChange('all')} />
            </Badge>
          )}
          {salespersonFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Salesperson: {salespersonFilter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onSalespersonChange('all')} />
            </Badge>
          )}
          {completionFilter !== 'all' && onCompletionFilterChange && (
            <Badge variant="secondary" className="gap-1">
              Status: {completionOptions.find(c => c.value === completionFilter)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onCompletionFilterChange('all')} />
            </Badge>
          )}
          {selectedWeek !== null && (
            <Badge variant="secondary" className="gap-1">
              Week: {selectedWeek}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onWeekChange(null)} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
