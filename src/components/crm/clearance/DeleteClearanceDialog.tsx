
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteClearance } from '@/hooks/useDeleteClearance';
import type { ClearanceItem } from '@/hooks/useClearanceData';

interface DeleteClearanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clearanceItem: ClearanceItem | null;
}

export const DeleteClearanceDialog: React.FC<DeleteClearanceDialogProps> = ({
  open,
  onOpenChange,
  clearanceItem,
}) => {
  const { deleteClearance, isLoading } = useDeleteClearance();

  const handleDelete = async () => {
    if (!clearanceItem) return;
    
    // Pass the UUID string directly instead of converting to number
    await deleteClearance(clearanceItem.id);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Clearance Item</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the clearance item "{clearanceItem?.item_code}"? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
