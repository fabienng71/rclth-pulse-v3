
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SyncResult {
  created: number;
  updated: number;
  errors: string[];
}

const SyncProfiles = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const syncProfiles = async () => {
    setIsSyncing(true);
    const result: SyncResult = { created: 0, updated: 0, errors: [] };

    try {
      // Get all users from auth.users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw new Error(`Failed to fetch auth users: ${authError.message}`);
      }

      if (!authUsers?.users) {
        throw new Error('No users found in auth');
      }

      // Get existing profiles
      const { data: existingProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role');

      if (profilesError) {
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
      }

      const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || []);

      // Process each auth user
      for (const authUser of authUsers.users) {
        try {
          const userData = {
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.full_name || '',
            role: authUser.app_metadata?.role || authUser.user_metadata?.role || 'user'
          };

          if (existingProfileIds.has(authUser.id)) {
            // Update existing profile
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                email: userData.email,
                full_name: userData.full_name,
                role: userData.role
              })
              .eq('id', authUser.id);

            if (updateError) {
              result.errors.push(`Failed to update ${userData.email}: ${updateError.message}`);
            } else {
              result.updated++;
            }
          } else {
            // Create new profile
            const { error: insertError } = await supabase
              .from('profiles')
              .insert(userData);

            if (insertError) {
              result.errors.push(`Failed to create ${userData.email}: ${insertError.message}`);
            } else {
              result.created++;
            }
          }
        } catch (userError) {
          result.errors.push(`Error processing user ${authUser.email}: ${userError.message}`);
        }
      }

      setLastSyncResult(result);
      
      if (result.errors.length === 0) {
        toast.success(`Sync completed: ${result.created} created, ${result.updated} updated`);
      } else {
        toast.warning(`Sync completed with ${result.errors.length} errors`);
      }

    } catch (error) {
      console.error('Sync failed:', error);
      toast.error(`Sync failed: ${error.message}`);
      result.errors.push(error.message);
      setLastSyncResult(result);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Profile Synchronization
        </CardTitle>
        <CardDescription>
          Sync user profiles from authentication to the profiles table
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={syncProfiles} 
            disabled={isSyncing}
            className="flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <div className="text-2xl">🔄 Syncing...</div>
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                Sync Profiles
              </>
            )}
          </Button>
          
          {lastSyncResult && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Created: {lastSyncResult.created}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Updated: {lastSyncResult.updated}
              </Badge>
              {lastSyncResult.errors.length > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Errors: {lastSyncResult.errors.length}
                </Badge>
              )}
            </div>
          )}
        </div>

        {lastSyncResult?.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Sync Errors:</div>
              <ul className="list-disc list-inside space-y-1">
                {lastSyncResult.errors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SyncProfiles;
