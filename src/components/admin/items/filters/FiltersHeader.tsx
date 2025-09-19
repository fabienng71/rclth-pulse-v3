import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, FilterX, ChevronDown } from 'lucide-react';
import { CollapsibleTrigger } from '@/components/ui/collapsible';

interface FiltersHeaderProps {
  activeFilterCount: number;
  isExpanded: boolean;
  onClearAllFilters: () => void;
}

export const FiltersHeader: React.FC<FiltersHeaderProps> = ({
  activeFilterCount,
  isExpanded,
  onClearAllFilters
}) => {
  return (
    <CollapsibleTrigger asChild>
      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-base">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearAllFilters();
                }}
                className="h-6 px-2 text-xs"
              >
                <FilterX className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </CardHeader>
    </CollapsibleTrigger>
  );
};