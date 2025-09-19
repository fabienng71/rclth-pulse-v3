
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import Navigation from '@/components/Navigation';
import NotificationTester from '@/components/debug/NotificationTester';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NotificationDebug = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchNotifications } = useNotificationStore();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 NotificationDebug: Component mounted');
    
    if (!user) {
      console.log('❌ NotificationDebug: No user, redirecting to login');
      navigate('/login');
      return;
    }

    // Only fetch notifications once on mount - fetchNotifications is NOT in dependency array
    const initializeNotifications = async () => {
      console.log('🔄 NotificationDebug: Fetching notifications for debug page');
      try {
        await fetchNotifications();
        console.log('✅ NotificationDebug: Notifications fetched successfully');
      } catch (error) {
        console.error('❌ NotificationDebug: Error fetching notifications:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    initializeNotifications();

    return () => {
      console.log('🧹 NotificationDebug: Component unmounting');
    };
  }, [user, navigate]); // Only user and navigate in dependencies

  if (!user) {
    return null;
  }

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container py-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading notification debug interface...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Notification System Debug</h1>
            <p className="text-muted-foreground">Test and debug the notification system</p>
          </div>
        </div>
        
        <NotificationTester />
      </div>
    </div>
  );
};

export default NotificationDebug;
