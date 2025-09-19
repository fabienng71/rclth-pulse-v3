
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Profile } from '../../types/supabase';

interface ProfileNotFoundProps {
  isSyncing: boolean;
  onSyncProfile: () => Promise<Profile | null>;
}

const ProfileNotFound = ({ isSyncing, onSyncProfile }: ProfileNotFoundProps) => {
  const handleSyncProfile = async () => {
    await onSyncProfile();
  };

  return (
    <div className="mb-4">
      <div className="rounded-md bg-amber-50 p-3 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-amber-700">
              Profile not found. This could happen if you signed up before the profile system was in place.
            </p>
          </div>
        </div>
      </div>
      <Button 
        variant="outline" 
        onClick={handleSyncProfile}
        disabled={isSyncing}
        className="mb-4 w-full"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        {isSyncing ? 'Syncing Profile...' : 'Sync Profile'}
      </Button>
    </div>
  );
};

export default ProfileNotFound;
