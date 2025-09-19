
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Profile } from '../../types/supabase';
import { UserFormData } from '../../hooks/admin/useUserEditDialog';

interface EditUserDialogProps {
  user: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (formData: UserFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({ 
  user, 
  open, 
  onOpenChange, 
  onSave,
  isSubmitting = false 
}) => {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [sppCode, setSppCode] = useState('');
  const [generatePassword, setGeneratePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [alCredit, setAlCredit] = useState<number | ''>('');
  const [blCredit, setBlCredit] = useState<number | ''>('');
  const [slCredit, setSlCredit] = useState<number | ''>('');

  // Reset form when user changes or dialog opens
  useEffect(() => {
    if (user && open) {
      setFullName(user.full_name || '');
      setRole(user.role || '');
      setSppCode(user.spp_code || '');
      setGeneratePassword(false);
      setPassword('');
      setAlCredit(user.al_credit || '');
      setBlCredit(user.bl_credit || '');
      setSlCredit(user.sl_credit || '');
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (generatePassword && !password.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    try {
      const formData: UserFormData = {
        fullName,
        role,
        sppCode,
        generatePassword,
        password: generatePassword ? password : undefined,
        al_credit: alCredit === '' ? null : Number(alCredit),
        bl_credit: blCredit === '' ? null : Number(blCredit),
        sl_credit: slCredit === '' ? null : Number(slCredit),
      };

      await onSave(formData);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  // Don't render anything if no user is selected
  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user profile information and permissions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right text-sm">
                Email
              </Label>
              <Input
                id="email"
                value={user.email}
                className="col-span-3 bg-muted"
                disabled
                readOnly
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullName" className="text-right text-sm">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right text-sm">
                Role
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sppCode" className="text-right text-sm">
                SPP Code
              </Label>
              <Input
                id="sppCode"
                value={sppCode}
                onChange={(e) => setSppCode(e.target.value)}
                className="col-span-3"
                placeholder="Enter SPP code (optional)"
              />
            </div>
          </div>

          <Separator />

          {/* Leave Credits */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Leave Credits</h4>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="alCredit" className="text-right text-sm">
                AL Credit
              </Label>
              <Input
                id="alCredit"
                type="number"
                value={alCredit}
                onChange={(e) => setAlCredit(e.target.value === '' ? '' : Number(e.target.value))}
                className="col-span-3"
                placeholder="Annual Leave credit"
                min="0"
                step="0.5"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="blCredit" className="text-right text-sm">
                BL Credit
              </Label>
              <Input
                id="blCredit"
                type="number"
                value={blCredit}
                onChange={(e) => setBlCredit(e.target.value === '' ? '' : Number(e.target.value))}
                className="col-span-3"
                placeholder="Business Leave credit"
                min="0"
                step="0.5"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slCredit" className="text-right text-sm">
                SL Credit
              </Label>
              <Input
                id="slCredit"
                type="number"
                value={slCredit}
                onChange={(e) => setSlCredit(e.target.value === '' ? '' : Number(e.target.value))}
                className="col-span-3"
                placeholder="Sick Leave credit"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <Separator />

          {/* Password Reset */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="generatePassword"
                checked={generatePassword}
                onCheckedChange={(checked) => {
                  setGeneratePassword(!!checked);
                  if (!checked) {
                    setPassword('');
                  }
                }}
              />
              <Label htmlFor="generatePassword" className="text-sm">
                Reset user password
              </Label>
            </div>
            
            {generatePassword && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right text-sm">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter new password"
                  required={generatePassword}
                  minLength={6}
                />
              </div>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '💾 Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
