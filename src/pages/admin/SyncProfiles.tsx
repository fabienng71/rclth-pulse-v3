
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import Navigation from '../../components/Navigation';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

const SyncProfiles = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    created: number;
    existing: number;
    errors: number;
  }>({ created: 0, existing: 0, errors: 0 });
  const { isAdmin } = useAuthStore();

  const syncAllProfiles = async () => {
    if (!isAdmin) {
      toast.error('Only administrators can sync all profiles');
      return;
    }
    
    setIsSyncing(true);
    setSyncResult({ created: 0, existing: 0, errors: 0 });
    
    try {
      // Get all users from auth
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      if (authUsers && authUsers.users) {
        let created = 0;
        let existing = 0;
        let errors = 0;
        
        // Process each user
        for (const authUser of authUsers.users) {
          try {
            // Check if profile exists
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single();
              
            // If profile doesn't exist, create it
            if (!existingProfile) {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: authUser.id,
                  email: authUser.email || '',
                  full_name: authUser.user_metadata?.full_name || '',
                  role: 'user',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
              if (insertError) {
                errors++;
                console.error('Error creating profile for user', authUser.id, insertError);
              } else {
                created++;
              }
            } else {
              existing++;
            }
          } catch (error) {
            errors++;
            console.error('Error processing user', authUser.id, error);
          }
        }
        
        setSyncResult({ created, existing, errors });
        toast.success(`Sync complete: ${created} profiles created, ${existing} already existed`);
      }
    } catch (error) {
      console.error('Error syncing profiles:', error);
      toast.error('Failed to sync profiles');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <Navigation />
      
      <main className="container py-6">
        <h1 className="mb-6 text-2xl font-bold md:text-3xl">Admin Tools</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile Synchronization</CardTitle>
              <CardDescription>
                Create profiles for users that don't have one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                This tool will check all users in the authentication system and create corresponding
                profiles for any that are missing. This is useful if users were created before
                the profile system was in place.
              </p>
              
              <Button 
                onClick={syncAllProfiles}
                disabled={isSyncing}
                className="mb-4"
              >
                {isSyncing ? '🔄 Syncing profiles...' : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync All User Profiles
                  </>
                )}
              </Button>
              
              {(syncResult.created > 0 || syncResult.existing > 0) && (
                <div className="mt-4 rounded-md bg-muted p-4">
                  <h3 className="text-sm font-medium">Sync Results:</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>Profiles created: {syncResult.created}</li>
                    <li>Profiles already existing: {syncResult.existing}</li>
                    {syncResult.errors > 0 && (
                      <li className="text-destructive">Errors: {syncResult.errors}</li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default SyncProfiles;
