
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActivityFilters } from '@/components/crm/activities/ActivityFilters';
import { Calendar, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface FollowupsFiltersProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filterType: string;
  onTypeChange: (type: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  statusOptions: string[];
  onClearFilters: () => void;
  selectedSalesperson: string;
  onSalespersonChange: (salesperson: string) => void;
  salespersonOptions: string[];
  selectedWeek: number | null;
  onWeekChange: (week: number | null) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
}

export const FollowupsFilters: React.FC<FollowupsFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterType,
  onTypeChange,
  statusFilter,
  onStatusChange,
  statusOptions,
  onClearFilters,
  selectedSalesperson,
  onSalespersonChange,
  salespersonOptions,
  selectedWeek,
  onWeekChange,
  priorityFilter,
  onPriorityFilterChange
}) => {
  const priorityFilters = [
    { key: 'all', label: 'All Follow-ups', icon: CheckCircle },
    { key: 'overdue', label: 'Overdue', icon: AlertTriangle, color: 'text-red-600' },
    { key: 'today', label: 'Due Today', icon: Clock, color: 'text-yellow-600' },
    { key: 'week', label: 'This Week', icon: Calendar, color: 'text-blue-600' },
  ];

  const handleClearAll = () => {
    onClearFilters();
    onPriorityFilterChange('all');
  };

  return (
    <div className="space-y-4">
      {/* Search Bar and Status Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search follow-ups by customer, contact, or activity type..."
            className="w-full"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </div>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Priority Filters */}
      <div className="flex flex-wrap gap-2">
        {priorityFilters.map((filter) => {
          const IconComponent = filter.icon;
          const isActive = priorityFilter === filter.key;
          
          return (
            <Button
              key={filter.key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPriorityFilterChange(filter.key)}
              className="flex items-center gap-2"
            >
              <IconComponent className={`h-4 w-4 ${filter.color || ''}`} />
              {filter.label}
            </Button>
          );
        })}
      </div>

      {/* Standard Activity Filters - Updated to remove date props */}
      <ActivityFilters
        filterType={filterType}
        onTypeChange={onTypeChange}
        onClearFilters={onClearFilters}
        selectedSalesperson={selectedSalesperson}
        onSalespersonChange={onSalespersonChange}
        salespersonOptions={salespersonOptions}
        selectedWeek={selectedWeek}
        onWeekChange={onWeekChange}
      />

      {/* Active Filters Display - Updated to remove date filter references */}
      {(priorityFilter !== 'all' || statusFilter !== 'all' || filterType || selectedSalesperson !== 'all' || selectedWeek !== null || searchTerm) && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchTerm}
            </Badge>
          )}
          
          {priorityFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Priority: {priorityFilters.find(f => f.key === priorityFilter)?.label}
            </Badge>
          )}

          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {statusFilter}
            </Badge>
          )}
          
          {filterType && (
            <Badge variant="secondary">
              Type: {filterType}
            </Badge>
          )}
          
          {selectedSalesperson !== 'all' && (
            <Badge variant="secondary">
              Salesperson: {selectedSalesperson}
            </Badge>
          )}
          
          {selectedWeek !== null && (
            <Badge variant="secondary">
              Week: {selectedWeek}
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearAll}
            className="text-xs"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};
