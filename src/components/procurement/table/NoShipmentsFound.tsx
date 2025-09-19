
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArchiveX } from 'lucide-react';

interface NoShipmentsFoundProps {
  isFiltered: boolean;
  onShowActiveShipments?: () => void;
  showArchived?: boolean;
}

const NoShipmentsFound: React.FC<NoShipmentsFoundProps> = ({ 
  isFiltered, 
  onShowActiveShipments, 
  showArchived = false 
}) => {
  return (
    <div className="rounded-md border p-8 flex flex-col items-center justify-center space-y-4">
      <p className="text-lg font-medium">
        {isFiltered 
          ? "No shipments match your filters" 
          : "No archived shipments found"}
      </p>
      {isFiltered && (
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filter criteria
        </p>
      )}
      {showArchived && onShowActiveShipments && (
        <Button 
          onClick={onShowActiveShipments}
          variant="outline"
          className="mt-4"
        >
          <ArchiveX className="h-4 w-4 mr-2" />
          Hide Archived Shipments
        </Button>
      )}
    </div>
  );
};

export default NoShipmentsFound;
