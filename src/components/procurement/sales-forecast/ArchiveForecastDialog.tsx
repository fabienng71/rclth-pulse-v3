
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
import { Archive, Eye } from 'lucide-react';

interface ArchiveForecastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  action: 'archive' | 'unarchive';
}

export const ArchiveForecastDialog: React.FC<ArchiveForecastDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  action
}) => {
  const isArchiving = action === 'archive';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isArchiving ? (
              <Archive className="h-5 w-5 text-orange-500" />
            ) : (
              <Eye className="h-5 w-5 text-blue-500" />
            )}
            {isArchiving ? 'Archive' : 'Unarchive'} Sales Forecast
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArchiving ? (
              <>
                Are you sure you want to archive this sales forecast? 
                Archived forecasts will be hidden from the active list but can be restored later.
              </>
            ) : (
              <>
                Are you sure you want to unarchive this sales forecast? 
                It will be moved back to the active forecasts list.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {isArchiving ? 'Archive' : 'Unarchive'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
