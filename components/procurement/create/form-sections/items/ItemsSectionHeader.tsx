
import React from 'react';
import { Button } from '@/components/ui/button';
import { ClipboardPaste } from 'lucide-react';

interface ItemsSectionHeaderProps {
  title?: string;
  onBatchAddClick?: () => void;
}

const ItemsSectionHeader: React.FC<ItemsSectionHeaderProps> = ({ 
  title = "Items",
  onBatchAddClick
}) => {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        {onBatchAddClick && (
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            className="h-8" 
            onClick={onBatchAddClick}
          >
            <ClipboardPaste className="mr-2 h-4 w-4" />
            Paste Multiple
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Search and add items to this shipment
      </p>
    </div>
  );
};

export default ItemsSectionHeader;
