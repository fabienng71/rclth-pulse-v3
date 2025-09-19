import React from 'react';
import { Package } from 'lucide-react';

export const ItemsTableEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Package className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold mb-2">No items to display</h3>
      <p className="text-muted-foreground">Adjust your filters or search criteria.</p>
    </div>
  );
};