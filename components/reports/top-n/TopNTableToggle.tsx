import React from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Table, Zap } from 'lucide-react';

interface TopNTableToggleProps {
  viewMode: 'standard' | 'virtualized';
  onViewModeChange: (mode: 'standard' | 'virtualized') => void;
  recordCount: number;
  className?: string;
}

const VIRTUALIZATION_THRESHOLD = 500;

export const TopNTableToggle: React.FC<TopNTableToggleProps> = ({
  viewMode,
  onViewModeChange,
  recordCount,
  className = ''
}) => {
  const shouldRecommendVirtualization = recordCount >= VIRTUALIZATION_THRESHOLD;
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground">View:</span>
      <ToggleGroup type="single" value={viewMode} onValueChange={onViewModeChange}>
        <ToggleGroupItem value="standard" className="relative">
          <Table className="h-4 w-4 mr-2" />
          Standard
        </ToggleGroupItem>
        <ToggleGroupItem value="virtualized" className="relative">
          <Zap className="h-4 w-4 mr-2" />
          Virtualized
          {shouldRecommendVirtualization && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-2 h-2" />
          )}
        </ToggleGroupItem>
      </ToggleGroup>
      {shouldRecommendVirtualization && viewMode === 'standard' && (
        <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
          {recordCount.toLocaleString()} rows - Consider virtualized view for better performance
        </div>
      )}
    </div>
  );
};