
import React from 'react';
import { Button } from '@/components/ui/button';
import { FilePen } from 'lucide-react';

interface SaveDraftButtonProps {
  isSaving: boolean;
  onClick: () => void;
}

const SaveDraftButton: React.FC<SaveDraftButtonProps> = ({ 
  isSaving, 
  onClick 
}) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="flex items-center gap-2"
      disabled={isSaving}
    >
      <FilePen className="h-4 w-4" />
      {isSaving ? 'Saving...' : 'Save Draft'}
    </Button>
  );
};

export default SaveDraftButton;
