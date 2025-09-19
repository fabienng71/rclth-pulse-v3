import React from 'react';
import { Package } from 'lucide-react';

interface ReturnRequestsEmptyStateProps {
  hasSearchQuery: boolean;
}

export const ReturnRequestsEmptyState: React.FC<ReturnRequestsEmptyStateProps> = ({
  hasSearchQuery,
}) => {
  return (
    <div className="text-center py-8">
      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
      <p className="text-muted-foreground">
        {hasSearchQuery ? 'No return requests found matching your search' : 'No return requests found'}
      </p>
    </div>
  );
};