
import React, { useState } from 'react';
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
import { Loader2, AlertTriangle } from 'lucide-react';
import { ForecastSession, useForecastSessions } from '@/hooks/useForecastSessions';
import { toast } from 'sonner';

interface ConfirmDeleteSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: ForecastSession;
  onConfirm: () => void;
}

export const ConfirmDeleteSessionDialog: React.FC<ConfirmDeleteSessionDialogProps> = ({
  open,
  onOpenChange,
  session,
  onConfirm
}) => {
  const [deleting, setDeleting] = useState(false);
  const { deleteSession } = useForecastSessions();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSession(session.id);
      toast.success('Session deleted successfully');
      onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Forecast Session
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the session "{session.session_name}"?
            <br />
            <br />
            <strong>This action cannot be undone.</strong> All forecast data associated with this session will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Session'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
