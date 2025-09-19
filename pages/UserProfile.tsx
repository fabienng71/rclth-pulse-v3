import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Database, Bug, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { supabase } from '../lib/supabase';
import ProfileForm from '../components/profile/ProfileForm';
import AccountInfo from '../components/profile/AccountInfo';
import ProfileNotFound from '../components/profile/ProfileNotFound';
import { ThemeSettings } from '../components/profile/ThemeSettings';
import { Profile } from '../types/supabase';
import RoleDebugger from '../components/RoleDebugger';

const UserProfile = () => {
  const { user, profile, getProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();
  
  // Special user check
  const isSpecialUser = user?.email === 'fabien@repertoire.co.th';

  // Run this effect on initial load to ensure profile is fetched
  useEffect(() => {
    if (user && !profile) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      await getProfile();
      console.log("Profile loaded:", profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const syncProfiles = async (): Promise<Profile | null> => {
    if (!user) return null;
    setIsSyncing(true);
    
    try {
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      
      if (authUser && authUser.user) {
        console.log("Current auth user:", authUser.user);
        
        // First check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.user.id);
          
        if (profileError) {
          console.error("Error checking profile:", profileError);
          throw profileError;
        }
        
        console.log("Profile check result:", existingProfile);
        
        if (!existingProfile || existingProfile.length === 0) {
          console.log("Creating new profile for user:", authUser.user.id);
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: authUser.user.id,
              email: authUser.user.email || '',
              full_name: authUser.user.user_metadata?.full_name || '',
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error("Profile creation error:", insertError);
            throw insertError;
          }
          
          toast.success('Profile created successfully');
          return await getProfile();
        } else {
          console.log("Profile already exists:", existingProfile);
          toast.info('Profile already exists');
          return await getProfile();
        }
      }
      return null;
    } catch (error) {
      console.error('Error syncing profile:', error);
      toast.error('Failed to sync profile');
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  // Show loading state
  if (isLoading && !profile) {
    return (
      <>
        <Navigation />
        <main className="container py-6">
          <h1 className="mb-6 text-2xl font-bold md:text-3xl">Your Profile</h1>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-2xl mb-2">👤</div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      
      <main className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Your Profile</h1>
          
          {/* Special Buttons - Only visible to fabien@repertoire.co.th */}
          {isSpecialUser && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="default" 
                onClick={() => navigate('/sql')}
                className="flex items-center transition-smooth shadow-soft hover:shadow-medium"
              >
                <Database className="mr-2 h-4 w-4" />
                SQL Queries
              </Button>
              
              <Button 
                variant="default" 
                onClick={() => navigate('/reports/executive')}
                className="transition-smooth shadow-soft hover:shadow-medium"
              >
                <FileText className="mr-2 h-4 w-4" />
                Executive Dashboard
              </Button>
              
              <Button 
                variant="default" 
                onClick={() => navigate('/admin/users')}
                className="transition-smooth shadow-soft hover:shadow-medium"
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/debug/notifications')}
                className="transition-smooth shadow-soft hover:shadow-medium"
              >
                <Bug className="mr-2 h-4 w-4" />
                Debug Notifications
              </Button>
            </div>
          )}
        </div>
        
        <RoleDebugger />
        
        <div className="grid gap-6">
          {/* Profile and Account Information */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  Manage your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!profile ? (
                  <ProfileNotFound
                    isSyncing={isSyncing}
                    onSyncProfile={syncProfiles}
                  />
                ) : (
                  <ProfileForm
                    profile={profile}
                    userId={user?.id || ''}
                    onProfileUpdated={getProfile}
                  />
                )}
              </CardContent>
            </Card>
            
            <Card className="card-enhanced">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccountInfo
                  userId={user?.id}
                  profile={profile}
                  isSyncing={isSyncing}
                  onSyncProfile={syncProfiles}
                  userEmail={user?.email}
                />
              </CardContent>
            </Card>
          </div>

          {/* Theme Settings - Only for fabien@repertoire.co.th */}
          <ThemeSettings />
        </div>
      </main>
    </>
  );
};

export default UserProfile;
