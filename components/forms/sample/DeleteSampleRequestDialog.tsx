
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { deleteSampleRequest } from '@/services/sample-requests';

interface DeleteSampleRequestDialogProps {
  requestId: string;
  customerName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

const DeleteSampleRequestDialog: React.FC<DeleteSampleRequestDialogProps> = ({
  requestId,
  customerName,
  isOpen,
  onOpenChange,
  onDeleted
}) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteSampleRequest(requestId);
      
      toast({
        title: "Success",
        description: "Sample request deleted successfully",
      });
      
      onOpenChange(false);
      onDeleted();
    } catch (error) {
      console.error('Error deleting sample request:', error);
      toast({
        title: "Error",
        description: "Failed to delete sample request",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Sample Request</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the sample request for {customerName}?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex items-center justify-between gap-2 sm:justify-between">
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>Cancel</Button>
          </DialogClose>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? '🗑️ Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSampleRequestDialog;
