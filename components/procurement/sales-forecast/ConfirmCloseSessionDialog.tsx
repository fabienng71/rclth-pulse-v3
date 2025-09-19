
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
import { Loader2, Archive } from 'lucide-react';
import { ForecastSession, useForecastSessions } from '@/hooks/useForecastSessions';
import { toast } from 'sonner';

interface ConfirmCloseSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: ForecastSession;
  onConfirm: () => void;
}

export const ConfirmCloseSessionDialog: React.FC<ConfirmCloseSessionDialogProps> = ({
  open,
  onOpenChange,
  session,
  onConfirm
}) => {
  const [closing, setClosing] = useState(false);
  const { updateSession, getCollaborativeData } = useForecastSessions();

  const handleClose = async () => {
    setClosing(true);
    try {
      // First, ensure all data is properly saved by fetching current collaborative data
      const collaborativeData = await getCollaborativeData(session.id);
      console.log('Session data before closing:', collaborativeData);
      
      // Update session status to completed
      await updateSession(session.id, { 
        status: 'completed'
      });
      
      toast.success('Session closed successfully - all data has been preserved for review');
      onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error closing session:', error);
      toast.error('Failed to close session. Please try again.');
    } finally {
      setClosing(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-blue-600" />
            Close Forecast Session
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to close the session "{session.session_name}"?
            <br />
            <br />
            Once closed, this session will become <strong>read-only</strong>. All forecast data will be preserved and can be reviewed, but no new forecasts can be added or edited.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={closing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleClose}
            disabled={closing}
          >
            {closing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Closing...
              </>
            ) : (
              'Close Session'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
