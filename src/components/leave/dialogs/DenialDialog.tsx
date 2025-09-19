import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LeaveRequest } from '@/types/leave';

interface DenialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (request: LeaveRequest, reason: string) => Promise<void>;
  selectedRequest: LeaveRequest | null;
  isSubmitting: boolean;
}

export const DenialDialog: React.FC<DenialDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedRequest,
  isSubmitting
}) => {
  const [denialReason, setDenialReason] = useState('');

  const handleClose = () => {
    onClose();
    setDenialReason('');
  };

  const handleConfirm = async () => {
    if (selectedRequest && denialReason.trim()) {
      await onConfirm(selectedRequest, denialReason);
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deny Leave Request</DialogTitle>
          <DialogDescription>
            Please provide a reason for denying this leave request.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Enter denial reason..."
            value={denialReason}
            onChange={(e) => setDenialReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!denialReason.trim() || isSubmitting}
          >
            {isSubmitting ? 'Denying...' : 'Deny Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};