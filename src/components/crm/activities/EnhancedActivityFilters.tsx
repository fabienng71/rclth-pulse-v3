
import React, { useState } from 'react';
import { Filter, X, Calendar, User, Tag, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WeekSelector } from './WeekSelector';

interface FilterChip {
  id: string;
  label: string;
  value: string;
  type: 'type' | 'salesperson' | 'week' | 'date' | 'preset';
  icon?: React.ReactNode;
}

interface QuickFilter {
  id: string;
  label: string;
  action: () => void;
  count?: number;
}

interface EnhancedActivityFiltersProps {
  filterType: string;
  onTypeChange: (type: string) => void;
  selectedSalesperson: string;
  onSalespersonChange: (salesperson: string) => void;
  salespersonOptions: string[];
  selectedWeek: number | null;
  onWeekChange: (week: number | null) => void;
  onClearFilters: () => void;
}

export const EnhancedActivityFilters = ({
  filterType,
  onTypeChange,
  selectedSalesperson,
  onSalespersonChange,
  salespersonOptions,
  selectedWeek,
  onWeekChange,
  onClearFilters,
}: EnhancedActivityFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Quick filter presets
  const quickFilters: QuickFilter[] = [
    {
      id: 'this-week',
      label: 'This Week',
      action: () => {
        const today = new Date();
        const week = Math.ceil((today.getDate() - today.getDay() + 1) / 7);
        onWeekChange(week);
      },
    },
    {
      id: 'meetings',
      label: 'Meetings Only',
      action: () => onTypeChange('Meeting'),
    },
  ];

  // Generate active filter chips
  const activeFilters: FilterChip[] = [];
  
  if (filterType && filterType !== 'all') {
    activeFilters.push({
      id: 'type',
      label: filterType,
      value: filterType,
      type: 'type',
      icon: <Tag className="h-3 w-3" />
    });
  }

  if (selectedSalesperson && selectedSalesperson !== 'all') {
    activeFilters.push({
      id: 'salesperson',
      label: selectedSalesperson,
      value: selectedSalesperson,
      type: 'salesperson',
      icon: <User className="h-3 w-3" />
    });
  }

  if (selectedWeek) {
    activeFilters.push({
      id: 'week',
      label: `Week ${selectedWeek}`,
      value: selectedWeek.toString(),
      type: 'week',
      icon: <Calendar className="h-3 w-3" />
    });
  }

  const removeFilter = (filterId: string) => {
    switch (filterId) {
      case 'type':
        onTypeChange('all');
        break;
      case 'salesperson':
        onSalespersonChange('all');
        break;
      case 'week':
        onWeekChange(null);
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <Button
            key={filter.id}
            variant="outline"
            size="sm"
            onClick={filter.action}
            className="h-8 text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {filter.label}
            {filter.count && (
              <Badge variant="secondary" className="ml-1 h-4 text-xs">
                {filter.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1 hover:bg-muted transition-colors"
            >
              {filter.icon}
              <span>{filter.label}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter(filter.id)}
                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Advanced Filters */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 h-8"
          >
            <Filter className="h-3 w-3" />
            Advanced Filters
            <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card className="mt-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Filter Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Activity Type</label>
                  <Select value={filterType || 'all'} onValueChange={onTypeChange}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Meeting">Meeting</SelectItem>
                      <SelectItem value="Walk-in">Walk-in</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Phone Call">Phone Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {salespersonOptions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Salesperson</label>
                    <Select value={selectedSalesperson} onValueChange={onSalespersonChange}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="All Salespersons" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Salespersons</SelectItem>
                        {salespersonOptions.map((name, index) => (
                          <SelectItem key={`${name}-${index}`} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Week</label>
                  <WeekSelector 
                    selectedWeek={selectedWeek}
                    onWeekChange={onWeekChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
