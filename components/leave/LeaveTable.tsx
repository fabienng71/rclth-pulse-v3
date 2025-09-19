
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getFullLeaveName } from '@/utils/leaveUtils';
import { Badge } from '@/components/ui/badge';
import { LeaveRequest, LeaveCredits } from '@/types/leave';

interface LeaveTableProps {
  leaves: LeaveRequest[];
  leaveCredits: LeaveCredits | null;
  userCreditsMap?: Record<string, LeaveCredits>;
  approvedRows: Record<string, boolean>;
  approvingIds: Record<string, boolean>;
  isAdmin: boolean;
  onApprove: (leave: LeaveRequest) => void;
  onReject: (leave: LeaveRequest) => void;
  onDelete: (leaveId: string) => void;
}

export const LeaveTable: React.FC<LeaveTableProps> = ({
  leaves,
  leaveCredits,
  userCreditsMap = {},
  approvedRows,
  approvingIds,
  isAdmin,
  onApprove,
  onReject,
  onDelete
}) => {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Table className="min-w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Length</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaves.map((leave) => (
          <TableRow key={leave.id}>
            <TableCell>{leave.full_name || leave.submitter_full_name || 'Unknown'}</TableCell>
            <TableCell>{getFullLeaveName(leave.leave_type)}</TableCell>
            <TableCell>{formatDate(leave.start_date)}</TableCell>
            <TableCell>{formatDate(leave.end_date)}</TableCell>
            <TableCell>{leave.length} day(s)</TableCell>
            <TableCell>{leave.reason || 'No reason provided'}</TableCell>
            <TableCell>
              {approvedRows[leave.id] ? (
                <Badge className="bg-green-500">Approved</Badge>
              ) : (
                <Badge variant="outline">Pending</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {isAdmin && (
                  <>
                    {!approvedRows[leave.id] ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApprove(leave)}
                        disabled={!!approvingIds[leave.id]}
                      >
                        {approvingIds[leave.id] ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Approving...
                          </>
                        ) : (
                          'Approve'
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReject(leave)}
                        disabled={!!approvingIds[leave.id]}
                      >
                        {approvingIds[leave.id] ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Updating...
                          </>
                        ) : (
                          'Unapprove'
                        )}
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => onDelete(leave.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        {leaves.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
              No leave requests found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
