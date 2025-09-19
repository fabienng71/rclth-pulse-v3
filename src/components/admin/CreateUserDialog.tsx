
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface CreateUserFormData {
  email: string;
  password: string;
  fullName: string;
  role: string;
  sppCode: string;
}

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

const CreateUserDialog = ({ 
  open, 
  onOpenChange, 
  onUserCreated 
}: CreateUserDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserFormData>({
    email: '',
    password: '',
    fullName: '',
    role: 'user',
    sppCode: '',
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateForm(prev => ({ ...prev, password }));
  };

  const handleSubmit = async () => {
    if (!createForm.email || !createForm.password || !createForm.fullName) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Get the current session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You need to be logged in');
        setIsLoading(false);
        return;
      }

      // Use the full URL to the Edge Function
      const response = await fetch(`https://cgvjcsevidvxabtwdkdv.supabase.co/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          email: createForm.email,
          password: createForm.password,
          fullName: createForm.fullName,
          role: createForm.role,
          sppCode: createForm.sppCode
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      toast.success('User created successfully');
      onUserCreated(); // Refresh the user list
      onOpenChange(false); // Close the dialog
      
      // Reset the form
      setCreateForm({
        email: '',
        password: '',
        fullName: '',
        role: 'user',
        sppCode: '',
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="create-email">Email *</Label>
            <Input
              id="create-email"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="create-fullname">Full Name *</Label>
            <Input
              id="create-fullname"
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="create-password">Password *</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                type="button" 
                onClick={generateRandomPassword}
                className="text-xs"
              >
                Generate
              </Button>
            </div>
            <Input
              id="create-password"
              type="text"
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="create-role">Role</Label>
            <Select
              value={createForm.role}
              onValueChange={(value) => setCreateForm({ ...createForm, role: value })}
            >
              <SelectTrigger id="create-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Regular User</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="create-spp-code">Salesperson Code (SPP Code)</Label>
            <Input
              id="create-spp-code"
              value={createForm.sppCode}
              onChange={(e) => setCreateForm({ ...createForm, sppCode: e.target.value })}
              placeholder="Enter SPP code (optional)"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Creating User...' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
