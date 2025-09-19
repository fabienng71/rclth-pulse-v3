import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, List, Filter, Download, Plus, ExpandIcon, ShrinkIcon } from 'lucide-react';

type ViewMode = 'table' | 'grid' | 'compact';

interface ViewModeControlsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  totalRequests: number;
  filteredCount: number;
  hasActiveFilters: boolean;
  handleExpandAllMonths: () => void;
  handleCollapseAllMonths: () => void;
  handleNewRequest: () => void;
  handleExport: () => void;
}

export const ViewModeControls: React.FC<ViewModeControlsProps> = ({
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  totalRequests,
  filteredCount,
  hasActiveFilters,
  handleExpandAllMonths,
  handleCollapseAllMonths,
  handleNewRequest,
  handleExport
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center space-x-2">
        <h2 className="text-2xl font-bold">Sample Requests</h2>
        <Badge variant="outline">
          {filteredCount} of {totalRequests}
        </Badge>
        {hasActiveFilters && (
          <Badge variant="secondary">Filtered</Badge>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* View Mode Toggle */}
        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Month Expansion Controls */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExpandAllMonths}
        >
          <ExpandIcon className="h-4 w-4 mr-2" />
          Expand All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCollapseAllMonths}
        >
          <ShrinkIcon className="h-4 w-4 mr-2" />
          Collapse All
        </Button>

        {/* Filter Toggle */}
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>

        {/* Export */}
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        {/* New Request */}
        <Button onClick={handleNewRequest}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>
    </div>
  );
};