import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { LeadCenterFilters as FiltersType } from '@/types/leadCenter';
import { FOOD_INGREDIENTS_SALES_STAGES, getSalesStageInfo } from '@/utils/channelMapping';

interface LeadCenterFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  onClearFilters: () => void;
}

export const LeadCenterFilters: React.FC<LeadCenterFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const statusOptions = FOOD_INGREDIENTS_SALES_STAGES.map(stage => stage.value);
  const priorityOptions = ['Low', 'Medium', 'High'];

  const handleStatusToggle = (status: string) => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];
    
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handlePriorityToggle = (priority: string) => {
    const currentPriority = filters.priority || [];
    const newPriority = currentPriority.includes(priority)
      ? currentPriority.filter(p => p !== priority)
      : [...currentPriority, priority];
    
    onFiltersChange({ ...filters, priority: newPriority });
  };

  const hasActiveFilters = 
    (filters.status?.length || 0) > 0 ||
    (filters.priority?.length || 0) > 0 ||
    filters.search ||
    filters.lead_source ||
    filters.next_step_due_from ||
    filters.next_step_due_to;

  const getStatusColor = (status: string) => {
    const stageInfo = getSalesStageInfo(status);
    return stageInfo.color + ' hover:opacity-80';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'Low': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search leads..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <Badge
                key={status}
                variant={filters.status?.includes(status) ? "default" : "outline"}
                className={`cursor-pointer ${
                  filters.status?.includes(status) ? '' : getStatusColor(status)
                }`}
                onClick={() => handleStatusToggle(status)}
              >
                {getSalesStageInfo(status).label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <Label>Priority</Label>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((priority) => (
              <Badge
                key={priority}
                variant={filters.priority?.includes(priority) ? "default" : "outline"}
                className={`cursor-pointer ${
                  filters.priority?.includes(priority) ? '' : getPriorityColor(priority)
                }`}
                onClick={() => handlePriorityToggle(priority)}
              >
                {priority}
              </Badge>
            ))}
          </div>
        </div>

        {/* Lead Source */}
        <div className="space-y-2">
          <Label htmlFor="lead_source">Lead Source</Label>
          <Input
            id="lead_source"
            placeholder="Filter by source..."
            value={filters.lead_source || ''}
            onChange={(e) => onFiltersChange({ ...filters, lead_source: e.target.value })}
          />
        </div>

        {/* Next Step Due Date Range */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="due_from">Due From</Label>
            <Input
              id="due_from"
              type="date"
              value={filters.next_step_due_from || ''}
              onChange={(e) => onFiltersChange({ ...filters, next_step_due_from: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_to">Due To</Label>
            <Input
              id="due_to"
              type="date"
              value={filters.next_step_due_to || ''}
              onChange={(e) => onFiltersChange({ ...filters, next_step_due_to: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};