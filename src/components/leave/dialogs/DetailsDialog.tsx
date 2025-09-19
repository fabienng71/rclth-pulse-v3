import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { LeaveRequest } from '@/types/leave';

interface DetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: LeaveRequest | null;
  getLeaveTypeColor: (type: string) => string;
  getStatusColor: (status: string) => string;
}

export const DetailsDialog: React.FC<DetailsDialogProps> = ({
  isOpen,
  onClose,
  selectedRequest,
  getLeaveTypeColor,
  getStatusColor
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
        </DialogHeader>
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Employee</label>
                <p className="text-sm font-medium">{selectedRequest.user_profile?.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{selectedRequest.user_profile?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Leave Type</label>
                <Badge className={getLeaveTypeColor(selectedRequest.leave_type)}>
                  {selectedRequest.leave_type}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge className={getStatusColor(selectedRequest.status)}>
                  {selectedRequest.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <p className="text-sm">{format(new Date(selectedRequest.start_date), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <p className="text-sm">{format(new Date(selectedRequest.end_date), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                <p className="text-sm">{selectedRequest.duration_days} business days</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                <p className="text-sm">{format(new Date(selectedRequest.created_at), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Reason</label>
              <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedRequest.reason}</p>
            </div>

            {selectedRequest.status === 'Denied' && selectedRequest.denial_reason && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Denial Reason</label>
                <p className="text-sm mt-1 p-3 bg-red-50 text-red-800 rounded-md">{selectedRequest.denial_reason}</p>
              </div>
            )}

            {selectedRequest.approver_profile && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {selectedRequest.status === 'Approved' ? 'Approved by' : 'Denied by'}
                </label>
                <p className="text-sm">{selectedRequest.approver_profile.full_name}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};