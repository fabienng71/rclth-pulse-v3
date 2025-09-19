
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import { Profile } from '../../types/supabase';
import { supabase } from '../../lib/supabase';

interface ProfileFormProps {
  profile: Profile;
  userId: string;
  onProfileUpdated: () => Promise<Profile | null>;
}

const ProfileForm = ({ profile, userId, onProfileUpdated }: ProfileFormProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile.full_name || '',
    email: profile.email || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      await onProfileUpdated();
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          value={formData.email}
          disabled
        />
        <p className="text-xs text-muted-foreground">
          Email cannot be changed
        </p>
      </div>
      
      <div className="space-y-2">
        <Label>Account Type</Label>
        <div className="rounded-md border p-3 text-sm">
          {profile?.role === 'admin' ? 'Administrator' : 'Regular User'}
        </div>
      </div>
      
      {profile?.role === 'admin' && (
        <div className="mt-4 flex items-center text-primary">
          <ShieldCheck className="mr-2 h-5 w-5" />
          <span className="font-medium">Administrator Access</span>
        </div>
      )}
      
      <Button type="submit" disabled={isUpdating} className="w-full">
        {isUpdating ? 'Updating Profile...' : 'Update Profile'}
      </Button>
    </form>
  );
};

export default ProfileForm;
