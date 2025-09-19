
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClearanceForm } from './ClearanceForm';
import { useCreateClearance } from '@/hooks/useCreateClearance';
import type { ClearanceFormValues } from './schema';

interface CreateClearanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateClearanceDialog: React.FC<CreateClearanceDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { createClearance, isLoading } = useCreateClearance();

  const handleSubmit = async (data: ClearanceFormValues) => {
    await createClearance(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Clearance Item</DialogTitle>
        </DialogHeader>
        <ClearanceForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
