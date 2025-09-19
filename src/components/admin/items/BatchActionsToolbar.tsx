import React from 'react';
import { Trash2, Edit, Download, CheckSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BatchActionsToolbarProps {
  selectedItems: string[];
  onBatchEdit: () => void;
  onBatchDelete: () => void;
  onBatchExport: () => void;
  onClearSelection: () => void;
  isLoading?: boolean;
}

export const BatchActionsToolbar: React.FC<BatchActionsToolbarProps> = ({
  selectedItems,
  onBatchEdit,
  onBatchDelete,
  onBatchExport,
  onClearSelection,
  isLoading = false
}) => {
  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">
            {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
          </span>
          <Badge variant="secondary">{selectedItems.length}</Badge>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onBatchEdit}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Batch Edit
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onBatchExport}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={onBatchDelete}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Selected
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
};