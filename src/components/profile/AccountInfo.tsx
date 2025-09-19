
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Profile } from '../../types/supabase';

interface AccountInfoProps {
  userId: string | undefined;
  profile: Profile | null;
  isSyncing: boolean;
  onSyncProfile: () => Promise<Profile | null>;
  userEmail?: string | null;
}

const AccountInfo = ({ userId, profile, isSyncing, onSyncProfile }: AccountInfoProps) => {
  const handleSyncProfile = async () => {
    await onSyncProfile();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium leading-none">Account ID</h3>
        <p className="text-sm text-muted-foreground">{userId || 'Not loaded'}</p>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium leading-none">Created At</h3>
        <p className="text-sm text-muted-foreground">
          {profile?.created_at 
            ? new Date(profile.created_at).toLocaleDateString()
            : 'Not available'}
        </p>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium leading-none">Annual Leaves</h3>
        <p className="text-sm text-muted-foreground">
          {profile?.al_credit !== null && profile?.al_credit !== undefined
            ? `${profile.al_credit} days`
            : 'Not available'}
        </p>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium leading-none">Last Updated</h3>
        <p className="text-sm text-muted-foreground">
          {profile?.updated_at 
            ? new Date(profile.updated_at).toLocaleDateString()
            : 'Not available'}
        </p>
      </div>
      
      {!profile && (
        <Button 
          variant="outline" 
          onClick={handleSyncProfile}
          disabled={isSyncing}
          className="mt-4 w-full"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {isSyncing ? 'Syncing Profile...' : 'Sync Profile'}
        </Button>
      )}
    </div>
  );
};

export default AccountInfo;
