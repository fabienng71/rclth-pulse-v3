
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Profile } from '../../types/supabase';
import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface ToggleUserStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: Profile | null;
  onConfirmToggle: () => Promise<void>;
}

const ToggleUserStatusDialog = ({ 
  open, 
  onOpenChange, 
  selectedUser, 
  onConfirmToggle 
}: ToggleUserStatusDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuthStore();

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      await onConfirmToggle();
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Determine if we're activating or deactivating
  const isDeactivating = selectedUser?.is_active;
  const actionText = isDeactivating ? 'Deactivate' : 'Activate';
  const actionDescription = isDeactivating 
    ? 'This user will no longer be able to log in or access the system.' 
    : 'This will restore the user\'s access to the system.';

  console.log('Dialog status info:', { 
    selectedUser,
    isActive: selectedUser?.is_active,
    isDeactivating 
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actionText} User</DialogTitle>
          <DialogDescription>
            Are you sure you want to {actionText.toLowerCase()} this user?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm">
            <span className="block mt-1 font-medium">{selectedUser?.full_name}</span>
            <span className="block text-muted-foreground">{selectedUser?.email}</span>
          </p>
          <p className="text-sm mt-3">
            {actionDescription}
          </p>
          
          {selectedUser?.id === user?.id && (
            <div className="flex items-center gap-2 mt-3 p-3 bg-destructive/10 text-destructive rounded-md">
              <ShieldAlert className="h-5 w-5" />
              <p className="text-sm font-medium">
                Warning: You cannot {actionText.toLowerCase()} your own account
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            variant={isDeactivating ? "destructive" : "default"}
            onClick={handleToggleStatus} 
            disabled={isProcessing || selectedUser?.id === user?.id}
          >
            {isProcessing ? 
              `${isDeactivating ? 'Deactivating' : 'Activating'}...` : 
              `${actionText} user`
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ToggleUserStatusDialog;
