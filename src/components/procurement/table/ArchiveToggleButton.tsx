
import React from 'react';
import { Button } from '@/components/ui/button';
import { Archive, ArchiveX } from 'lucide-react';

interface ArchiveToggleButtonProps {
  showArchived: boolean;
  toggleArchived: () => void;
}

const ArchiveToggleButton: React.FC<ArchiveToggleButtonProps> = ({
  showArchived,
  toggleArchived
}) => {
  return (
    <Button
      onClick={toggleArchived}
      variant="outline"
      size="sm"
      className="ml-auto flex items-center"
    >
      {showArchived ? (
        <>
          <ArchiveX className="h-4 w-4 mr-2" />
          Hide Archived Shipments
        </>
      ) : (
        <>
          <Archive className="h-4 w-4 mr-2" />
          Show Archived Shipments
        </>
      )}
    </Button>
  );
};

export default ArchiveToggleButton;
