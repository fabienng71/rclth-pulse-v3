import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Package, ExpandIcon, ShrinkIcon } from 'lucide-react';

interface ReturnRequestsHeaderProps {
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export const ReturnRequestsHeader: React.FC<ReturnRequestsHeaderProps> = ({
  totalCount,
  searchQuery,
  onSearchChange,
  onExpandAll,
  onCollapseAll,
}) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Return Requests
        </CardTitle>
        <Badge variant="secondary">{totalCount} total</Badge>
      </div>
      
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        {/* Bulk month controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExpandAll}
            className="text-xs"
          >
            <ExpandIcon className="h-3 w-3 mr-1" />
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCollapseAll}
            className="text-xs"
          >
            <ShrinkIcon className="h-3 w-3 mr-1" />
            Collapse All
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};