
import { useAuthStore } from '../../stores/authStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

export const ProfileDebugInfo = () => {
  const { user, profile, isAdmin, getProfile } = useAuthStore();

  const refreshProfile = async () => {
    await getProfile();
    toast.success('Profile refreshed');
  };

  const setAdminRole = async () => {
    if (!user) {
      toast.error('No user is logged in');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id);

      if (error) {
        toast.error('Failed to set admin role: ' + error.message);
        return;
      }

      await getProfile();
      toast.success('Admin role has been set');
    } catch (error) {
      console.error('Error setting admin role:', error);
      toast.error('Failed to set admin role');
    }
  };

  return (
    <>
      <h3 className="font-medium mb-2">Authentication Debug Info</h3>
      <div className="text-sm space-y-1 mb-4">
        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
        <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
        <p><strong>Profile Role:</strong> {profile?.role || 'No profile'}</p>
        <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
      </div>
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant="secondary" onClick={refreshProfile}>
          Refresh Profile
        </Button>
        {isAdmin && (
          <Button size="sm" variant="default" onClick={setAdminRole}>
            Set Admin Role
          </Button>
        )}
      </div>
    </>
  );
};
