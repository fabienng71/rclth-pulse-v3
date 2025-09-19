
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClearanceForm } from './ClearanceForm';
import { useUpdateClearance } from '@/hooks/useUpdateClearance';
import type { ClearanceFormValues } from './schema';
import type { ClearanceItem } from '@/hooks/useClearanceData';

interface EditClearanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clearanceItem: ClearanceItem | null;
}

export const EditClearanceDialog: React.FC<EditClearanceDialogProps> = ({
  open,
  onOpenChange,
  clearanceItem,
}) => {
  const { updateClearance, isLoading } = useUpdateClearance();

  const handleSubmit = async (data: ClearanceFormValues) => {
    if (!clearanceItem) return;
    
    // Pass the UUID string directly instead of converting to number
    await updateClearance({ ...data, id: clearanceItem.id });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Clearance Item</DialogTitle>
        </DialogHeader>
        <ClearanceForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          initialData={clearanceItem || undefined}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
