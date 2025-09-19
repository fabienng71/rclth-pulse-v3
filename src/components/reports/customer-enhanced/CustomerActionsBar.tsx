import React from 'react';
import { Button } from '@/components/ui/button';

interface CustomerActionsBarProps {
  selectedCustomers: string[];
  totalCustomers: number;
  isLoading: boolean;
  onViewTurnover: () => void;
  onViewDetails: () => void;
  onExportCustomers: () => void;
}

export const CustomerActionsBar: React.FC<CustomerActionsBarProps> = ({
  selectedCustomers,
  totalCustomers,
  isLoading,
  onViewTurnover,
  onViewDetails,
  onExportCustomers
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2">
        <Button 
          disabled={selectedCustomers.length === 0 || isLoading}
          onClick={onViewTurnover}
          variant="outline"
          size="sm"
        >
          View Turnover
        </Button>
        <Button 
          disabled={selectedCustomers.length === 0 || isLoading}
          onClick={onViewDetails}
          variant="outline"
          size="sm"
        >
          View Details
        </Button>
        <Button 
          disabled={selectedCustomers.length === 0 || isLoading}
          onClick={onExportCustomers}
          variant="outline"
          size="sm"
        >
          Export CSV
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        {selectedCustomers.length} of {totalCustomers} selected
      </div>
    </div>
  );
};